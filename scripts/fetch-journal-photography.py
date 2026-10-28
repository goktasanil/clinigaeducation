"""One-time Commons metadata discovery; no image editing or build-time network calls."""
import concurrent.futures,html,json,pathlib,re,time,urllib.parse,urllib.request
ROOT=pathlib.Path(__file__).resolve().parents[1]
CAT=json.loads((ROOT/'src/data/europe-blog/generated/catalog.json').read_text())
CITIES={'AL':'Tirana','AD':'Andorra la Vella','AT':'Vienna','BE':'Bruges','BA':'Sarajevo','BG':'Sofia','HR':'Dubrovnik','CY':'Nicosia','CZ':'Prague','EE':'Tallinn','FI':'Helsinki','DK':'Copenhagen','FR':'Paris','DE':'Heidelberg','GR':'Athens','HU':'Budapest','IS':'Reykjavik','IE':'Dublin','IT':'Florence','LV':'Riga','LI':'Vaduz','LT':'Vilnius','LU':'Luxembourg City','MT':'Valletta','MD':'Chisinau','MC':'Monaco','ME':'Kotor','NL':'Amsterdam','MK':'Skopje','NO':'Bergen','PL':'Krakow','PT':'Lisbon','RO':'Bucharest','SM':'San Marino','RS':'Belgrade','SK':'Bratislava','SI':'Ljubljana','ES':'Barcelona','SE':'Stockholm','CH':'Zurich','GB':'London','TR':'Istanbul','UA':'Lviv','VA':'Vatican','XK':'Pristina','BY':'Minsk','RU':'Saint Petersburg','GE':'Tbilisi','AM':'Yerevan','AZ':'Baku','JP':'Kyoto','GLOBAL':'library','EN':'London','SC':'Edinburgh','WA':'Cardiff','NI':'Belfast','GI':'Gibraltar'}
CACHE=ROOT/'src/data/journal/photo-candidates';CACHE.mkdir(exist_ok=True)
def fetch(code,city,extra=''):
 key=code+extra; dest=CACHE/(key+'.json')
 if dest.exists():return key,len(json.loads(dest.read_text()))
 query=f'intitle:"{city}" filetype:bitmap -intitle:map -intitle:flag -intitle:portrait -intitle:logo -intitle:diagram'
 params={'action':'query','format':'json','generator':'search','gsrsearch':query,'gsrnamespace':6,'gsrlimit':50,'prop':'imageinfo','iiprop':'url|extmetadata|size','iiurlwidth':1280}
 url='https://commons.wikimedia.org/w/api.php?'+urllib.parse.urlencode(params)
 for attempt in range(3):
  try:
   req=urllib.request.Request(url,headers={'User-Agent':'CliniGAEducationEditorial/1.0 (https://www.clinigaeducation.com)'})
   with urllib.request.urlopen(req,timeout=45) as r:d=json.loads(r.read())
   if d.get('error'):raise RuntimeError(str(d['error']))
   out=[]
   for p in sorted(d.get('query',{}).get('pages',{}).values(),key=lambda x:x.get('index',999)):
    x=p.get('imageinfo',[{}])[0];m=x.get('extmetadata',{});val=lambda k:html.unescape(re.sub('<[^>]+>','',m.get(k,{}).get('value',''))).strip()
    lic=val('LicenseShortName');w=x.get('width',0);h=x.get('height',1)
    if not re.search(r'CC BY(?:-SA)? [234]|CC0|Public domain|PDM',lic,re.I) or re.search(r'NC|ND|GFDL',lic):continue
    if w<900 or h<500 or not 1.1<w/h<3.2 or not re.search(r'\.(?:jpe?g|webp)$',p['title'],re.I):continue
    if re.search(r'(?i)flag|map of|coat of arms|politician|actress|actor|demonstration|protest|bus route|sketch|drawing|painting|portrait',p['title']):continue
    u=x.get('thumburl',x.get('url','')).split('?')[0]
    out.append({'title':p['title'].removeprefix('File:'),'url':u,'sourceUrl':x.get('descriptionurl'),'author':val('Artist'),'license':lic,'licenseUrl':val('LicenseUrl'),'width':x.get('thumbwidth',w),'height':x.get('thumbheight',h)})
   dest.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');return key,len(out)
  except Exception as e:
   if attempt==2:return key,'ERROR '+str(e)
   time.sleep(attempt+1)
extra=[('IT','Rome','-rome'),('IT','Bologna','-bologna'),('IT','Venice','-venice'),('IT','Turin','-turin'),('CZ','Brno','-brno'),('DE','Berlin','-berlin'),('FR','Lyon','-lyon'),('ES','Granada','-granada'),('GLOBAL','university library','-study')]
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
 futures=[pool.submit(fetch,c['code'],CITIES.get(c['code'],c['name'])) for c in CAT]
 if not any(c['code']=='JP' for c in CAT):futures.append(pool.submit(fetch,'JP','Kyoto'))
 futures.append(pool.submit(fetch,'GLOBAL','library'))
 futures += [pool.submit(fetch,*x) for x in extra]
 for f in concurrent.futures.as_completed(futures):print(*f.result(),flush=True)
