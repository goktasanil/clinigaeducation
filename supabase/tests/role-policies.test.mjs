import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';

const migration=readFileSync(new URL('../migrations/20261108180056_fix_admin_report_role_policies.sql',import.meta.url),'utf8');
const schema=readFileSync(new URL('./role-policy-schema.sql',import.meta.url),'utf8');
const tables=['gsc_url_snapshots','gsc_perf_snapshots','sanitize_audit_events','sanitize_alerts'];
const ids={admin:'00000000-0000-4000-8000-000000000001',user:'00000000-0000-4000-8000-000000000002',otherAdmin:'00000000-0000-4000-8000-000000000003'};
const helperMetadata="select p.proname,p.prosecdef,p.proconfig,p.proacl::text acl,pg_get_functiondef(p.oid) definition from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in ('has_role','get_booked_slots') order by p.proname";
let db,beforeHelpers,beforePolicies;

async function asUser(database,id=ids.admin,role='authenticated'){
 await database.exec('reset role');
 await database.query("select set_config('request.jwt.claim.sub',$1,false)",[id??'']);
 await database.exec(`set role ${role}`);
}
async function readReport(database,table){return (await database.query(`select marker from public.${table}`)).rows;}

test.before(async()=>{
 db=new PGlite();await db.exec(schema);
 beforeHelpers=(await db.query(helperMetadata)).rows;
 beforePolicies=(await db.query("select tablename,policyname,roles,cmd,permissive,qual from pg_policies where schemaname='public' order by tablename,policyname")).rows;
 await db.exec(migration);
});
test.after(async()=>{await db.close();});
test.beforeEach(async()=>{await asUser(db);});

test('original policy and revoked helper reproduce SQLSTATE 42501 for an authenticated admin',async()=>{
 const original=new PGlite();
 try{
  await original.exec(schema);await asUser(original);
  for(const table of tables){
   await assert.rejects(readReport(original,table),error=>error.code==='42501'&&/permission denied for function has_role/.test(error.message));
  }
 }finally{await original.close();}
});

for(const table of tables)test(`authenticated admin can read ${table} after the migration`,async()=>{
 assert.deepEqual(await readReport(db,table),[{marker:'synthetic-admin-report'}]);
});

test('authenticated non-admin is denied all four reports by row filtering',async()=>{
 await asUser(db,ids.user);for(const table of tables)assert.deepEqual(await readReport(db,table),[]);
});

test('anonymous users cannot read any of the four reports',async()=>{
 await asUser(db,null,'anon');for(const table of tables)assert.deepEqual(await readReport(db,table),[]);
});

test('authenticated callers without a subject cannot read the reports',async()=>{
 await asUser(db,null);for(const table of tables)assert.deepEqual(await readReport(db,table),[]);
});

test('policy evaluation does not expose another account role',async()=>{
 await asUser(db,ids.user);
 assert.deepEqual((await db.query('select role from public.user_roles where user_id=$1',[ids.otherAdmin])).rows,[]);
 assert.deepEqual((await db.query('select role from public.user_roles where user_id=$1',[ids.user])).rows,[{role:'user'}]);
 await assert.rejects(db.query("select public.has_role($1,'admin')",[ids.otherAdmin]),error=>error.code==='42501');
});

test('a non-admin cannot grant itself admin or change its existing role',async()=>{
 await asUser(db,ids.user);
 await assert.rejects(db.query("insert into public.user_roles(user_id,role) values($1,'admin')",[ids.user]),error=>error.code==='42501');
 assert.deepEqual((await db.query("update public.user_roles set role='admin' where user_id=$1 returning role",[ids.user])).rows,[]);
 for(const table of tables)assert.deepEqual(await readReport(db,table),[]);
});

test('has_role and booked-slot function bodies and ACLs remain exactly unchanged',async()=>{
 await db.exec('reset role');assert.deepEqual((await db.query(helperMetadata)).rows,beforeHelpers);
 for(const name of ['has_role','get_booked_slots']){
  const {rows}=await db.query("select has_function_privilege('anon',p.oid,'execute') anon_exec,has_function_privilege('authenticated',p.oid,'execute') auth_exec,has_function_privilege('service_role',p.oid,'execute') service_exec from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname=$1",[name]);
  assert.deepEqual(rows,[{anon_exec:false,auth_exec:false,service_exec:true}]);
 }
});

test('privileged service-role and owner has_role semantics remain intact',async()=>{
 await asUser(db,ids.user,'service_role');
 assert.equal((await db.query("select public.has_role($1,'admin') allowed",[ids.otherAdmin])).rows[0].allowed,true);
 await db.exec('reset role');
 assert.equal((await db.query("select public.has_role($1,'admin') allowed",[ids.otherAdmin])).rows[0].allowed,true);
});

test('only the four intended policy expressions change',async()=>{
 await db.exec('reset role');
 const after=(await db.query("select tablename,policyname,roles,cmd,permissive,qual from pg_policies where schemaname='public' order by tablename,policyname")).rows;
 assert.equal(after.length,beforePolicies.length);
 for(let i=0;i<after.length;i++){
  const {qual:oldQual,...oldContract}=beforePolicies[i];const {qual:newQual,...newContract}=after[i];
  assert.deepEqual(newContract,oldContract);
  if(tables.includes(after[i].tablename)){assert.notEqual(newQual,oldQual);assert.match(newQual,/EXISTS/);assert.doesNotMatch(newQual,/has_role/);}
  else assert.equal(newQual,oldQual);
 }
});

test('the established inline leads policy still permits only administrators',async()=>{
 assert.deepEqual((await db.query('select marker from public.leads')).rows,[{marker:'synthetic-lead'}]);
 await asUser(db,ids.user);assert.deepEqual((await db.query('select marker from public.leads')).rows,[]);
});
