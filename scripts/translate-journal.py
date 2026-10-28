"""Offline, resumable full-text translation. No credentials or runtime translation fallback.
Requires pinned CTranslate2 4.6.3, SentencePiece 0.2.1 and BeautifulSoup 4.14.3.
Model: facebook/m2m100_418M (MIT), converted CT2 int8 revision in translation provenance.
"""
import argparse,concurrent.futures,hashlib,html,json,pathlib,re,sqlite3,threading,time,uuid
from bs4 import BeautifulSoup,NavigableString
import ctranslate2,sentencepiece as spm
ROOT=pathlib.Path(__file__).resolve().parents[1]
LANGS=['tr','en','de','fr','es','it','hi','ar','ru','zh']
WORK=ROOT/'.journal-work';WORK.mkdir(exist_ok=True)
MODEL=pathlib.Path('/tmp/education-translate-model')
SP=spm.SentencePieceProcessor(model_file=str(MODEL/'tokenizer.model'))
TRANSLATOR=ctranslate2.Translator(str(MODEL),device='cpu',compute_type='int8',inter_threads=2,intra_threads=4)
DB=sqlite3.connect(str(WORK/'translation-cache.sqlite'),check_same_thread=False)
DB.execute('pragma journal_mode=WAL');DB.execute('create table if not exists translations (key text primary key,value text not null)');DB.commit();LOCK=threading.Lock()
START=time.monotonic();STATS={'translatedSegments':0,'cachedSegments':0}
FACTS=json.loads((ROOT/'src/data/journal/verified-facts.json').read_text())['facts']
FACT_EN={value:f['text']['en'] for f in FACTS for value in f['text'].values()}
ROUTE_VERSION='sentence-pivot-v2'
def clean_text(text):
 return re.sub(r'[\ufe0e\ufe0f\u2047]|<unk>','',text)
def save_json(path,data):
 path.parent.mkdir(parents=True,exist_ok=True);temp=path.with_suffix('.partial');temp.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');temp.replace(path)
def split_text(text):
 # M2M-100 is sentence-oriented; never drop later sentences in a paragraph.
 raw=re.split(r'(?<=[.!?。！？])\s+(?=[A-ZÀ-Ž0-9"“(])|\n+',text)
 out=[]
 for item in raw:
  if not item.strip():continue
  tokens=SP.encode(item)
  if len(tokens)>220:
   words=item.split();current=[]
   for word in words:
    if current and len(SP.encode(' '.join(current+[word])))>200:out.append(' '.join(current));current=[]
    current.append(word)
   if current:out.append(' '.join(current))
  else:out.append(item)
 return out

def translate_many(texts,source,target):
 if source==target:return texts[:]
 result=[None]*len(texts);pending={}
 for i,text in enumerate(texts):
  if re.fullmatch(r'(?:https?://|www\.)\S+|(?:[\w-]+\.)+[a-zA-Z]{2,}(?:/\S*)?|[^@\s]+@[^@\s]+\.[^@\s]+',text.strip()):result[i]=text;continue
  if not re.search(r'[^\W\d_]',text,re.U):result[i]=text;continue
  key=hashlib.sha256((source+'\0'+target+'\0'+text).encode()).hexdigest()
  with LOCK:row=DB.execute('select value from translations where key=?',(key,)).fetchone()
  if row:result[i]=row[0];STATS['cachedSegments']+=1
  else:pending.setdefault((key,text),[]).append(i)
 items=list(pending)
 for offset in range(0,len(items),128):
  batch=items[offset:offset+128]
  inp=[['__'+source+'__']+SP.encode(text,out_type=str)+['</s>'] for _,text in batch]
  if any(len(x)>1024 for x in inp):raise ValueError('Unsplit text exceeds model context')
  outputs=TRANSLATOR.translate_batch(inp,target_prefix=[['__'+target+'__']]*len(inp),beam_size=2,batch_type='tokens',max_batch_size=2048,max_decoding_length=768,repetition_penalty=1.1)
  for (key,text),o in zip(batch,outputs):
   pieces=o.hypotheses[0];translated=clean_text(SP.decode(pieces[1:] if pieces and pieces[0]=='__'+target+'__' else pieces)).strip()
   if not translated:raise ValueError('Empty translation '+source+' -> '+target+' '+repr(text[:180]))
   for i in pending[(key,text)]:result[i]=translated
   with LOCK:DB.execute('insert or replace into translations values(?,?)',(key,translated))
   STATS['translatedSegments']+=1
  with LOCK:DB.commit()
 return result

def translate_texts(texts,source,target):
 parts=[split_text(x) for x in texts];flat=[x for p in parts for x in p];translated=translate_many(flat,source,target);out=[];n=0
 for original,p in zip(texts,parts):
  v=' '.join(translated[n:n+len(p)]);n+=len(p)
  out.append((re.match(r'^\s*',original)[0] if original else '')+v+(re.search(r'\s*$',original)[0] if original else ''))
 return out

def facts():
 p=ROOT/'src/data/journal/verified-facts.json';d=json.loads(p.read_text())
 jobs=[(i,l) for i,f in enumerate(d['facts']) for l in LANGS if l not in f['text']]
 def run(job):
  i,l=job;f=d['facts'][i];value=translate_texts([f['text']['en']],'en',l)[0];return i,l,value
 with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
  for n,(i,l,text) in enumerate(pool.map(run,jobs),1):
   d['facts'][i]['text'][l]=text
   if n%10==0:save_json(p,d);print('facts',n,'/',len(jobs),STATS,flush=True)
 save_json(p,d);print('FACTS COMPLETE',len(d['facts']),flush=True)

def source_hash(p):
 return hashlib.sha256(json.dumps([p['id'],p['title'],p['excerpt'],p['html'],p['updatedAt']],ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
def translate_post(source,target,key):
 soup=BeautifulSoup(source['html'],'html.parser');nodes=[x for x in soup.find_all(string=True) if x.strip() and x.parent.name not in ('script','style','code','pre')]
 attributes=[(tag,attr) for tag in soup.find_all(True) for attr in ['alt','title'] if tag.get(attr) and str(tag[attr]).strip()]
 texts=[source['title'],source['excerpt']]+[str(x) for x in nodes]+[str(t[a]) for t,a in attributes]
 # Direct Turkish -> Russian can hallucinate unrelated repeated prose in this
 # small model. Use one explicit English pivot for every non-English baseline.
 # Official fact paragraphs use their reviewed English text at the pivot.
 if source['language']!='en':
  english=translate_texts(texts,source['language'],'en')
  english=[FACT_EN.get(text.strip(),value) for text,value in zip(texts,english)]
  values=english if target=='en' else translate_texts(english,'en',target)
 else:values=translate_texts(texts,'en',target)
 values=[clean_text(v) for v in values]
 for node,value in zip(nodes,values[2:]):node.replace_with(NavigableString(value))
 for (tag,attr),value in zip(attributes,values[2+len(nodes):]):tag[attr]=value
 return {'id':str(uuid.uuid5(uuid.NAMESPACE_URL,'cliniga-journal:'+key+':'+target)),'topicKey':key,'language':target,'slug':source['slug'],'sourceId':source['id'],'sourceLanguage':source['language'],'sourceHash':source_hash(source),'title':values[0],'excerpt':values[1],'html':str(soup),'translationMethod':'M2M100-418M CT2 int8','translationRoute':ROUTE_VERSION if source['language']!='en' else 'direct-en','modelRevision':'d1eca4826e8939f93f1390bae9e71b473d8a18ff'}

def articles():
 base=json.loads((WORK/'reviewed-base.json').read_text());groups={}
 for p in base:groups.setdefault(p.get('translationId') or p['id'],[]).append(p)
 all_results={}
 for l in LANGS:
  f=ROOT/'src/data/journal/translations'/f'{l}.json';all_results[l]=json.loads(f.read_text()) if f.exists() else []
 jobs=[]
 for key,posts in groups.items():
  source=next((p for p in posts if p['language']=='en'),posts[0])
  existing={p['language'] for p in posts};h=source_hash(source)
  for l in LANGS:
   if l in existing:continue
   old=next((x for x in all_results[l] if x['topicKey']==key),None)
   if old and old['sourceHash']==h and (source['language']=='en' or old.get('translationRoute')==ROUTE_VERSION):continue
   jobs.append((source,l,key))
 print('FULL TRANSLATION JOBS',len(jobs),'groups',len(groups),flush=True)
 def run(job):return translate_post(*job)
 with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
  for n,item in enumerate(pool.map(run,jobs),1):
   l=item['language'];all_results[l]=[x for x in all_results[l] if x['topicKey']!=item['topicKey']]+[item]
   save_json(ROOT/'src/data/journal/translations'/f'{l}.json',all_results[l])
   print('article',n,'/',len(jobs),l,item['topicKey'],'elapsed',round(time.monotonic()-START),STATS,flush=True)
 print('TRANSLATIONS COMPLETE',sum(len(x) for x in all_results.values()),flush=True)
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('phase',choices=['facts','articles']);args=parser.parse_args()
 (facts if args.phase=='facts' else articles)()
