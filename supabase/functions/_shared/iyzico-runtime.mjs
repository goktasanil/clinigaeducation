import { createClient } from "npm:@supabase/supabase-js@2.110.2";
import {
 authorization, billingCustomer, constantTimeEqual, decimalAmount, decimalMinor, fail,
 hostedPaymentUrl, paidPeriods, parseCatalog, PLAN_CREDITS, PACK_CREDITS, requireLiveMode,
 providerFormHtml, ref, sha256, subscriptionState, text, UUID_RE, validateProviderPlan, verifyV3,
} from "./iyzico-protocol.mjs";

const env = name => Deno.env.get(name)?.trim() || "";
const mode = () => ["live","sandbox"].includes(env("IYZICO_ENV")) ? env("IYZICO_ENV") : "disabled";
const apiOrigin = () => "https://api.iyzipay.com";
const site = () => "https://www.clinigaeducation.com";
let database;
export function admin() {
 if (!env("SUPABASE_URL") || !env("SUPABASE_SERVICE_ROLE_KEY")) fail("DATABASE_NOT_CONFIGURED");
 database ||= createClient(env("SUPABASE_URL"),env("SUPABASE_SERVICE_ROLE_KEY"),{auth:{persistSession:false,autoRefreshToken:false}});
 return database;
}
function origins() {
 const values = new Set([site(),"https://clinigaeducation.com"]);
 try { for(const value of JSON.parse(env("IYZICO_ALLOWED_ORIGINS") || "[]")) values.add(new URL(value).origin); } catch { /* fail closed to production origins */ }
 return values;
}
function headers(req) {
 const origin=req.headers.get("origin");
 return {
  "Content-Type":"application/json","Cache-Control":"no-store","X-Content-Type-Options":"nosniff",
  "Access-Control-Allow-Methods":"GET,POST,OPTIONS","Access-Control-Allow-Headers":"authorization,apikey,content-type,x-client-info",
  ...(origin && origins().has(origin) ? {"Access-Control-Allow-Origin":origin} : {}),Vary:"Origin",
 };
}
function json(req,value,status=200) { return new Response(JSON.stringify(value),{status,headers:headers(req)}); }
function originAllowed(req) { const origin=req.headers.get("origin");return !origin || origins().has(origin); }
function code(error) { const message=error instanceof Error ? error.message : "";return /^[A-Z][A-Z0-9_]{2,100}$/.test(message) ? message : "IYZICO_SERVICE_FAILED"; }
function errorResponse(req,error) {
 const name=code(error);
 const status=name==="AUTH_REQUIRED"?401:name.includes("NOT_CONFIGURED")||name.includes("NOT_READY")?503:
  name.startsWith("INVALID_")?400:name.includes("NOT_FOUND")?404:name.includes("MISMATCH")||name.includes("PENDING")||name.includes("EXISTS")||name.includes("RECONCILIATION")||name.includes("REQUIRES_CANCELLATION")?409:502;
 return json(req,{error:name},status);
}
async function requestJson(req) {
 const value=await req.text();
 if(new TextEncoder().encode(value).length>16384)fail("INVALID_REQUEST_SIZE");
 try { const data=JSON.parse(value);if(!data || typeof data!=="object" || Array.isArray(data))fail("INVALID_REQUEST");return data; }
 catch { fail("INVALID_REQUEST"); }
}
export async function user(req) {
 const match=(req.headers.get("authorization") || "").match(/^Bearer\s+(.+)$/i);
 if(!match)fail("AUTH_REQUIRED");
 const {data,error}=await admin().auth.getUser(match[1]);
 if(error || !data.user)fail("AUTH_REQUIRED");
 return data.user;
}
async function rpc(name,args={}) {
 const {data,error}=await admin().rpc(name,args);
 if(error)fail("PAYMENT_STATE_NOT_READY");
 return data;
}
async function updateOrder(id,values) {
 const {error}=await admin().from("portal_iyzico_checkouts").update(values).eq("id",id);
 if(error)fail("PAYMENT_STATE_NOT_READY");
}
async function byOrder(id) {
 if(!UUID_RE.test(id || ""))fail("INVALID_CHECKOUT_ID");
 const {data,error}=await admin().from("portal_iyzico_checkouts").select("*").eq("id",id).maybeSingle();
 if(error)fail("PAYMENT_STATE_NOT_READY");
 if(!data)fail("CHECKOUT_NOT_FOUND");
 return data;
}
async function api(path,body,method=body===undefined?"GET":"POST") {
 requireLiveMode(mode());
 if(!env("IYZICO_API_KEY") || !env("IYZICO_SECRET_KEY") || mode()==="disabled")fail("IYZICO_NOT_CONFIGURED");
 const encoded=body===undefined?"":JSON.stringify(body);
 const random=crypto.randomUUID().replaceAll("-","");
 const signedPath=new URL(path,apiOrigin()).pathname;
 const response=await fetch(apiOrigin()+path,{
  method,redirect:"error",signal:AbortSignal.timeout(20000),
  headers:{"Content-Type":"application/json","x-iyzi-rnd":random,
   Authorization:await authorization(env("IYZICO_API_KEY"),env("IYZICO_SECRET_KEY"),random,signedPath,encoded)},
  ...(body===undefined?{}:{body:encoded}),
 });
 const raw=await response.text();
 if(raw.length>1048576)fail("INVALID_PROVIDER_RESPONSE");
 let payload;try{payload=JSON.parse(raw);}catch{fail("INVALID_PROVIDER_RESPONSE");}
 if(!response.ok || payload.status!=="success")fail("IYZICO_REQUEST_FAILED");
 return payload;
}
async function schemaReady() {
 try{return (await rpc("portal_iyzico_schema_ready"))===20261028;}catch{return false;}
}
async function computeReadiness() {
 const missing=[];
 for(const name of ["SUPABASE_URL","SUPABASE_SERVICE_ROLE_KEY","IYZICO_API_KEY","IYZICO_SECRET_KEY","IYZICO_MERCHANT_ID"])if(!env(name))missing.push(name+"_MISSING");
 for(const name of ["IYZICO_MERCHANT_APPROVED","IYZICO_SUBSCRIPTION_ENABLED","IYZICO_WEBHOOK_V3_ENABLED","IYZICO_OPERATIONS_VERIFIED"])if(env(name)!=="true")missing.push(name+"_REQUIRED");
 if(mode()!=="live")missing.push(mode()==="sandbox"?"IYZICO_SANDBOX_NOT_SUPPORTED":"IYZICO_LIVE_MODE_REQUIRED");
 let catalog={plans:[],packs:[]};
 try{catalog=parseCatalog(env("IYZICO_PLANS_JSON"));}catch(error){missing.push(code(error));}
 if(!await schemaReady())missing.push("IYZICO_SCHEMA_NOT_READY");
 if(env("IYZICO_API_KEY") && env("IYZICO_SECRET_KEY") && mode()==="live"){
  try{await Promise.all(catalog.plans.map(async product=>{
   const actual=await api("/v2/subscription/pricing-plans/"+encodeURIComponent(product.referenceCode));
   validateProviderPlan(actual.data,product);
  }));}catch{missing.push("IYZICO_PROVIDER_PLAN_VERIFICATION_FAILED");}
 }
 if(!catalog.plans.length)missing.push("IYZICO_SUBSCRIPTION_PLANS_REQUIRED");
 const baseReady=missing.length===0;
 const membership=baseReady && catalog.plans.length>0;
 const credits=baseReady && catalog.packs.length>0;
 const configured=membership || credits;
 const available=Array.from(new Set([...(membership?catalog.plans:[]),...(credits?catalog.packs:[])].map(row=>row.currency)));
 return {
  ok:true,provider:"iyzico",configured,mode:mode(),supportedCurrencies:["EUR","TRY"],
  readyCurrencies:configured?available:[],missing,
  prices:catalog.plans.map(({plan,yearly,currency,amountMinor})=>({plan,yearly,currency,amountMinor})),
  creditPrices:catalog.packs.map(({pack,currency,amountMinor})=>({pack,currency,amountMinor})),
  capabilities:{membership,credits,cancellation:mode()==="live"&&Boolean(env("IYZICO_API_KEY")&&env("IYZICO_SECRET_KEY"))},
  sandboxReady:false,
 };
}
// Public health performs at most one provider-plan probe per isolate per minute.
// Checkout bypasses this cache and verifies its selected provider plan again.
let readinessCache=null,readinessFlight=null;
export async function readiness() {
 if(readinessCache && readinessCache.expires>Date.now())return readinessCache.value;
 if(readinessFlight)return readinessFlight;
 readinessFlight=computeReadiness().then(value=>{
  readinessCache={value,expires:Date.now()+60000};
  return value;
 }).finally(()=>{readinessFlight=null;});
 return readinessFlight;
}
export async function healthHandler(req) {
 if(!originAllowed(req))return json(req,{ok:false,configured:false,error:"ORIGIN_NOT_ALLOWED"},403);
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:headers(req)});
 if(req.method!=="GET")return json(req,{error:"METHOD_NOT_ALLOWED"},405);
 try{return json(req,await readiness());}
 catch(error){return json(req,{ok:false,provider:"iyzico",configured:false,missing:[code(error)],readyCurrencies:[],prices:[],creditPrices:[]});}
}
async function existingCheckout(userId,requestId) {
 const {data,error}=await admin().from("portal_iyzico_checkouts").select("*").eq("user_id",userId).eq("request_id",requestId).maybeSingle();
 if(error)fail("PAYMENT_STATE_NOT_READY");
 return data;
}
function checkoutResult(order) {
 if(order.status==="ready" && order.checkout_url && new Date(order.expires_at).getTime()>Date.now()){
  return {url:order.checkout_url,provider:"iyzico",currency:order.currency};
 }
 fail(order.status==="paid"?"PAYMENT_ALREADY_EXISTS":"CHECKOUT_RECONCILIATION_REQUIRED");
}
async function beginCheckout(auth,input) {
 requireLiveMode(mode());
 if(!UUID_RE.test(input.requestId || "") || !["EUR","TRY"].includes(input.currency))fail("INVALID_CHECKOUT_REQUEST");
 const old=await existingCheckout(auth.id,input.requestId);
 if(old){
  if(old.kind!==input.action || old.product_key!==(input.plan || input.pack) || old.currency!==input.currency ||
    (old.kind==="membership" && old.yearly!==input.yearly))fail("IDEMPOTENCY_REQUEST_MISMATCH");
  return checkoutResult(old);
 }
 const ready=await computeReadiness();
 if(!ready.configured)fail("IYZICO_NOT_CONFIGURED");
 const catalog=parseCatalog(env("IYZICO_PLANS_JSON"));
 const membership=input.action==="membership";
 if(membership && typeof input.yearly!=="boolean")fail("INVALID_BILLING_PERIOD");
 const product=membership
  ?catalog.plans.find(row=>row.plan===input.plan && row.yearly===input.yearly && row.currency===input.currency)
  :catalog.packs.find(row=>row.pack===input.pack && row.currency===input.currency);
 if(!product)fail("PRICE_NOT_CONFIGURED");
 if(membership){
  if(await rpc("portal_has_paid_access",{p_user_id:auth.id}))fail("ACTIVE_MEMBERSHIP_EXISTS");
  // An unpaid renewal can still be retried by the provider after paid access lapses.
  // Require cancellation before a second recurring contract can be created.
  const [otherProvider,legacy]=await Promise.all([
   admin().from("portal_provider_subscriptions").select("id").eq("user_id",auth.id).eq("provider_mode","live")
    .eq("renewals_stopped",false).in("status",["active","pending","past_due"]).limit(1),
   admin().from("portal_subscriptions").select("user_id").eq("user_id",auth.id).eq("cancel_at_period_end",false)
    .in("plan",["basic","plus","pro"]).in("status",["active","trialing","past_due"]).limit(1),
  ]);
  if(otherProvider.error || legacy.error)fail("PAYMENT_STATE_NOT_READY");
  if(otherProvider.data?.length || legacy.data?.length)fail("SUBSCRIPTION_REQUIRES_CANCELLATION");
  const {data:pending,error}=await admin().from("portal_iyzico_checkouts").select("id").eq("user_id",auth.id).eq("kind","membership")
   .in("status",["creating","ready","pending","unknown"]).gte("created_at",new Date(Date.now()-86400000).toISOString()).limit(1);
  if(error)fail("PAYMENT_STATE_NOT_READY");
  if(pending?.length)fail("CHECKOUT_ALREADY_PENDING");
  const actual=await api("/v2/subscription/pricing-plans/"+encodeURIComponent(product.referenceCode));
  validateProviderPlan(actual.data,product);
 }
 const billing=billingCustomer(input.billing,auth.email);
 if(billing.missing.length)return {billingRequired:billing.missing};
 const order={
  user_id:auth.id,request_id:input.requestId,kind:input.action,product_key:membership?input.plan:input.pack,
  currency:product.currency,amount_minor:product.amountMinor,credits:membership?PLAN_CREDITS[input.plan]:PACK_CREDITS[input.pack],
  yearly:membership?input.yearly:false,plan_reference:membership?product.referenceCode:null,provider_mode:"live",
 };
 const {data:created,error:insertError}=await admin().from("portal_iyzico_checkouts").insert(order).select("*").single();
 if(insertError){
  const raced=await existingCheckout(auth.id,input.requestId);
  if(raced)return checkoutResult(raced);
  if(insertError.code==="23505" && membership)fail("CHECKOUT_ALREADY_PENDING");
  fail("PAYMENT_STATE_NOT_READY");
 }
 const callback=env("SUPABASE_URL").replace(/\/$/,"")+"/functions/v1/iyzico-callback?order="+created.id;
 try{
  let payload;
  if(membership){
   payload=await api("/v2/subscription/checkoutform/initialize",{
    locale:input.locale==="en"?"en":"tr",callbackUrl:callback,pricingPlanReferenceCode:product.referenceCode,
    subscriptionInitialStatus:"ACTIVE",conversationId:created.id,customer:billing.customer,
   });
  }else{
   const customer=billing.customer;
   payload=await api("/payment/iyzipos/checkoutform/initialize/auth/ecom",{
    locale:input.locale==="en"?"en":"tr",conversationId:created.id,callbackUrl:callback,
    currency:product.currency,price:decimalAmount(product.amountMinor),paidPrice:decimalAmount(product.amountMinor),
    basketId:created.id,paymentGroup:"PRODUCT",enabledInstallments:[1],
    buyer:{id:auth.id,name:customer.name,surname:customer.surname,email:customer.email,gsmNumber:customer.gsmNumber,
     identityNumber:customer.identityNumber,registrationAddress:customer.billingAddress.address,
     city:customer.billingAddress.city,country:customer.billingAddress.country},
    billingAddress:customer.billingAddress,
    basketItems:[{id:created.id,price:decimalAmount(product.amountMinor),name:"CliniGA "+input.pack,category1:"Portal credits",itemType:"VIRTUAL"}],
   });
  }
  if(payload.conversationId!==created.id || !text(payload.token,8,1024))fail("PROVIDER_RESPONSE_MISMATCH");
  const expires=new Date(Date.now()+Math.min(Math.max(Number(payload.tokenExpireTime)||900,60),1800)*1000).toISOString();
  let url,html=null;
  if(membership){
   html=providerFormHtml(payload.checkoutFormContent);
   url=site()+"/portal/checkout?session="+created.id;
  }else url=hostedPaymentUrl(payload.paymentPageUrl,mode());
  await updateOrder(created.id,{status:"ready",checkout_token:payload.token,expires_at:expires,form_html:html,checkout_url:url});
  return {url,provider:"iyzico",currency:product.currency};
 }catch(error){
  await updateOrder(created.id,{status:code(error)==="IYZICO_REQUEST_FAILED"?"failed":"unknown"});
  throw error;
 }
}

async function subscriptionRow(userId,referenceCode) {
 let query=admin().from("portal_provider_subscriptions").select("*").eq("provider","iyzico").eq("user_id",userId);
 if(referenceCode)query=query.eq("reference_code",ref(referenceCode));
 const {data,error}=await query.order("updated_at",{ascending:false}).limit(1).maybeSingle();
 if(error)fail("PAYMENT_STATE_NOT_READY");
 return data;
}
async function subscriptionDetail(referenceCode) {
 const result=await api("/v2/subscription/subscriptions/"+encodeURIComponent(ref(referenceCode)));
 const data=Array.isArray(result.data?.items)?result.data.items.find(item=>item.referenceCode===referenceCode):result.data;
 if(!data || data.referenceCode!==referenceCode)fail("PROVIDER_SUBSCRIPTION_MISMATCH");
 return data;
}
async function syncSubscription(order,subscriptionReferenceCode,customerReferenceCode,detail) {
 requireLiveMode(mode());requireLiveMode(order.provider_mode);
 const actual=detail || await subscriptionDetail(subscriptionReferenceCode);
 const expected={subscriptionReferenceCode,customerReferenceCode,referenceCode:order.plan_reference,currency:order.currency,amountMinor:order.amount_minor};
 const periods=paidPeriods(actual,expected);
 const state=subscriptionState(actual.subscriptionStatus);
 const id=await rpc("portal_iyzico_register_subscription",{
  p_checkout_id:order.id,p_reference:subscriptionReferenceCode,p_customer:customerReferenceCode,p_status:state,
 });
 for(const period of periods){
  await rpc("portal_iyzico_record_period",{p_subscription_id:id,p_reference:period.reference,p_start:period.start,p_end:period.end});
 }
 return id;
}
function publicSubscription(row) {
 return row?{
  subscriptionReferenceCode:row.reference_code,plan:row.plan,status:row.status,currency:row.currency,
  yearly:row.yearly,amountMinor:row.amount_minor,currentPeriodEnd:row.revoked_at?null:row.paid_until,
  renewalsStopped:row.renewals_stopped,
 }:null;
}
async function status(auth) {
 let row=await subscriptionRow(auth.id);
 let statusVerified=false;
 if(row && env("IYZICO_API_KEY") && env("IYZICO_SECRET_KEY")){
  try{
   const order=await byOrder(row.checkout_id);
   await syncSubscription(order,row.reference_code,row.customer_reference);
   row=await subscriptionRow(auth.id,row.reference_code);
   statusVerified=true;
  }catch{ /* Return only previously verified stored state; never invent a current provider status. */ }
 }
 return {provider:"iyzico",subscription:publicSubscription(row),statusVerified};
}
async function cancel(auth,input) {
 let row=await subscriptionRow(auth.id,ref(input.subscriptionReferenceCode));
 if(!row)fail("SUBSCRIPTION_NOT_FOUND");
 const order=await byOrder(row.checkout_id);
 await syncSubscription(order,row.reference_code,row.customer_reference);
 row=await subscriptionRow(auth.id,row.reference_code);
 if(!row.renewals_stopped){
  await api("/v2/subscription/subscriptions/"+encodeURIComponent(row.reference_code)+"/cancel",undefined,"POST");
  const {error}=await admin().from("portal_provider_subscriptions")
   .update({status:"cancelled",renewals_stopped:true,updated_at:new Date().toISOString()}).eq("id",row.id).eq("user_id",auth.id);
  if(error)fail("PAYMENT_STATE_NOT_READY");
 }
 return {provider:"iyzico",subscriptionReferenceCode:row.reference_code,status:"cancelled",
  currentPeriodEnd:row.revoked_at?null:row.paid_until,renewalsStopped:true};
}
async function checkout(auth,input) {
 requireLiveMode(mode());
 const order=await byOrder(input.orderId);
 if(order.user_id!==auth.id)fail("CHECKOUT_NOT_FOUND");
 requireLiveMode(order.provider_mode);
 if(order.kind!=="membership" || order.status!=="ready" || !order.form_html ||
   new Date(order.expires_at).getTime()<=Date.now())fail("CHECKOUT_NOT_READY");
 return {provider:"iyzico",orderId:order.id,formContent:order.form_html,expiresAt:order.expires_at,
  currency:order.currency,amountMinor:order.amount_minor};
}
export async function commerceHandler(req) {
 if(!originAllowed(req))return json(req,{error:"ORIGIN_NOT_ALLOWED"},403);
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:headers(req)});
 if(req.method!=="POST")return json(req,{error:"METHOD_NOT_ALLOWED"},405);
 try{
  const auth=await user(req),input=await requestJson(req);
  if(input.action==="status")return json(req,await status(auth));
  if(input.action==="cancel")return json(req,await cancel(auth,input));
  if(input.action==="checkout")return json(req,await checkout(auth,input));
  if(input.action!=="membership" && input.action!=="credits")fail("INVALID_ACTION");
  const result=await beginCheckout(auth,input);
  if(result.billingRequired)return json(req,{error:"BILLING_DATA_REQUIRED",fields:result.billingRequired},422);
  return json(req,result);
 }catch(error){return errorResponse(req,error);}
}
async function reconcileCheckout(order,token) {
 requireLiveMode(mode());requireLiveMode(order.provider_mode);
 if(!constantTimeEqual(order.checkout_token,token))fail("CHECKOUT_TOKEN_MISMATCH");
 if(order.kind==="membership"){
  const result=await api("/v2/subscription/checkoutform/"+encodeURIComponent(token));
  if(result.token!==token || (result.conversationId && result.conversationId!==order.id))fail("PROVIDER_RESPONSE_MISMATCH");
  const data=result.data;
  if(!data || data.pricingPlanReferenceCode!==order.plan_reference)fail("PROVIDER_PLAN_MISMATCH");
  await syncSubscription(order,ref(data.referenceCode),ref(data.customerReferenceCode));
  return;
 }
 const result=await api("/payment/iyzipos/checkoutform/auth/ecom/detail",{locale:"tr",conversationId:order.id,token});
 if(result.token!==token || result.conversationId!==order.id || result.basketId!==order.id ||
   result.currency!==order.currency || decimalMinor(result.paidPrice)!==order.amount_minor ||
   decimalMinor(result.price)!==order.amount_minor)fail("PROVIDER_RESPONSE_MISMATCH");
 if(result.paymentStatus!=="SUCCESS" || result.fraudStatus!==1){
  await updateOrder(order.id,{status:result.fraudStatus===0?"pending":"failed",form_html:null});
  return;
 }
 const item=(result.itemTransactions || []).find(value=>value.itemId===order.id);
 if(!item || decimalMinor(item.price)!==order.amount_minor || ![1,2].includes(item.transactionStatus))fail("PROVIDER_ITEM_MISMATCH");
 if(!/^[1-9]\d{0,31}$/.test(String(result.paymentId)))fail("INVALID_PROVIDER_PAYMENT_ID");
 await rpc("portal_iyzico_apply_credit_payment",{p_checkout_id:order.id,p_payment_reference:String(result.paymentId)});
}
export async function callbackHandler(req) {
 if(req.method!=="POST")return new Response("Method not allowed",{status:405});
 try{
  requireLiveMode(mode());
  const id=new URL(req.url).searchParams.get("order");
  const order=await byOrder(id);
  const raw=await req.text();
  if(raw.length>4096)fail("INVALID_CALLBACK");
  const params=new URLSearchParams(raw),token=params.get("token");
  if(!text(token,8,1024))fail("INVALID_CALLBACK");
  await reconcileCheckout(order,token);
  return new Response(null,{status:303,headers:{
   Location:site()+"/portal/account?payment=processing","Cache-Control":"no-store","Referrer-Policy":"no-referrer",
  }});
 }catch(error){return new Response(code(error),{status:400,headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});}
}
async function orderForSubscription(payload,detail) {
 const subscriptionReferenceCode=ref(payload.subscriptionReferenceCode);
 const {data:known,error}=await admin().from("portal_provider_subscriptions").select("*")
  .eq("provider","iyzico").eq("reference_code",subscriptionReferenceCode).maybeSingle();
 if(error)fail("PAYMENT_STATE_NOT_READY");
 if(known){
  if(known.customer_reference!==payload.customerReferenceCode)fail("PROVIDER_SUBSCRIPTION_MISMATCH");
  return await byOrder(known.checkout_id);
 }
 // Browser callback can be lost. Bind only after retrieving the exact saved checkout token.
 const {data:candidates,error:candidateError}=await admin().from("portal_iyzico_checkouts").select("*")
  .eq("kind","membership").eq("plan_reference",detail.pricingPlanReferenceCode)
  .in("status",["ready","pending","unknown"]).gte("created_at",new Date(Date.now()-86400000).toISOString())
  .order("created_at",{ascending:false}).limit(25);
 if(candidateError)fail("PAYMENT_STATE_NOT_READY");
 for(const candidate of candidates || []){
  if(!candidate.checkout_token)continue;
  try{
   const result=await api("/v2/subscription/checkoutform/"+encodeURIComponent(candidate.checkout_token));
   if(result.token===candidate.checkout_token && result.data?.referenceCode===subscriptionReferenceCode &&
    result.data.customerReferenceCode===payload.customerReferenceCode && result.data.pricingPlanReferenceCode===candidate.plan_reference)return candidate;
  }catch{ /* An unfinished candidate is not a verified match. */ }
 }
 fail("CHECKOUT_RECONCILIATION_REQUIRED");
}
export async function webhookHandler(req) {
 if(req.method!=="POST")return new Response("Method not allowed",{status:405});
 try{
  requireLiveMode(mode());
  const payload=await requestJson(req),signature=req.headers.get("x-iyz-signature-v3");
  if(!env("IYZICO_SECRET_KEY") || !env("IYZICO_MERCHANT_ID"))fail("IYZICO_NOT_CONFIGURED");
  if(!await verifyV3(env("IYZICO_SECRET_KEY"),env("IYZICO_MERCHANT_ID"),payload,signature))
   return new Response("Invalid signature",{status:400});
  const subscription=Object.hasOwn(payload,"subscriptionReferenceCode");
  const eventKey=mode()+":"+(subscription
   ?["subscription",payload.subscriptionReferenceCode,payload.orderReferenceCode,payload.eventType].join(":")
   :["hpp",payload.iyziPaymentId,payload.iyziEventType,payload.status].join(":"));
  const {data:existing,error:readError}=await admin().from("portal_iyzico_events").select("status").eq("event_key",eventKey).maybeSingle();
  if(readError)fail("PAYMENT_STATE_NOT_READY");
  if(existing?.status==="processed")return new Response("ok",{status:200});
  const {error:saveError}=await admin().from("portal_iyzico_events").upsert({
   event_key:eventKey,event_hash:await sha256(JSON.stringify(payload)),status:"received",
  });
  if(saveError)fail("PAYMENT_STATE_NOT_READY");
  if(subscription){
   const detail=await subscriptionDetail(ref(payload.subscriptionReferenceCode));
   if(detail.customerReferenceCode!==payload.customerReferenceCode)fail("PROVIDER_SUBSCRIPTION_MISMATCH");
   const order=await orderForSubscription(payload,detail);
   await syncSubscription(order,payload.subscriptionReferenceCode,payload.customerReferenceCode,detail);
  }else{
   if(payload.iyziEventType!=="CHECKOUT_FORM_AUTH")return new Response("Unsupported event",{status:202});
   const order=await byOrder(payload.paymentConversationId);
   await reconcileCheckout(order,payload.token);
  }
  const {error:markError}=await admin().from("portal_iyzico_events")
   .update({status:"processed",processed_at:new Date().toISOString()}).eq("event_key",eventKey);
  if(markError)fail("PAYMENT_STATE_NOT_READY");
  return new Response("ok",{status:200});
 }catch{
  // Do not log payloads, tokens, customer details, signatures or provider response bodies.
  return new Response("Webhook reconciliation pending",{status:503});
 }
}
