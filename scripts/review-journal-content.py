"""Apply source-backed editorial revisions without modifying the immutable Wix export.
Run after generating the original baseline and completing verified-facts translations.
"""
import collections,hashlib,html,json,pathlib,re,urllib.parse,subprocess
from bs4 import BeautifulSoup
ROOT=pathlib.Path(__file__).resolve().parents[1];DATA=ROOT/'src/data/journal'
LANGS=['tr','en','de','fr','es','it','hi','ar','ru','zh']
def read(p):return json.loads(p.read_text())
facts=read(DATA/'verified-facts.json')['facts'];assert all(set(f['text'])==set(LANGS) for f in facts)
expansions=read(DATA/'topic-expansions.json')
topics=read(DATA/'topics.json');labels=read(ROOT/'src/data/generated/country-names.json')
bootstrap="""import {readFile} from 'node:fs/promises'; import {compileWixArchive} from './scripts/build-wix-archive.mjs'; const read=async(p)=>JSON.parse(await readFile(p,'utf8')); const records=(await Promise.all(['tr','en','de','es','it'].map(l=>read('src/data/wix-archive/source/posts-'+l+'.json')))).flat(); const result=compileWixArchive(records,undefined,await read('src/data/wix-archive/editorial-overrides.json')); process.stdout.write(JSON.stringify(result.posts));"""
base=json.loads(subprocess.check_output(['node','--experimental-strip-types','--input-type=module','-e',bootstrap],cwd=ROOT,text=True))
copy={l:{k:v for k,v in []} for l in LANGS}
heads={'tr':'Başvuru koşulları ve güncel kaynaklar','en':'Application requirements and current sources','de':'Voraussetzungen und aktuelle Quellen','es':'Requisitos y fuentes actuales','it':'Requisiti e fonti aggiornate'}
sourceLabel={'tr':'Resmî kaynak','en':'Official source','de':'Offizielle Quelle','es':'Fuente oficial','it':'Fonte ufficiale'}
reviewed={};audit=[]
money=re.compile(r'(?:[€$£₺]|\b(?:EUR|CZK|PLN|RON|USD|TL|euro|euros|Euro)\b)',re.I)
years=re.compile(r'\b(?:201[5-9]|202[0-5])\b')
statistics=re.compile(r'(?:%\s*(?:[4-9]\d|100)|(?:[4-9]\d|100)\s*%)')
qualifiers={'tr':'Güncel koşulları ilgili kurumdan yazılı olarak doğrulayın.','en':'Confirm the current conditions in writing with the relevant institution.','de':'Lassen Sie sich die aktuellen Bedingungen von der zuständigen Stelle schriftlich bestätigen.','es':'Confirme las condiciones actuales por escrito con la institución competente.','it':'Confermate per iscritto le condizioni attuali con l’ente competente.'}
appointment_copy={
 'tr':'Randevu bulunabilirliğini yetkili kurumun güncel kanallarından takip edin. Belirli bir gün veya saatte kontenjan açılacağına dair genel bir garanti yoktur. Başvuru bilgilerinizi koruyun; doğrulanmamış aracıların kesin sonuç vaadine güvenmeyin.',
 'en':'Check appointment availability through the competent authority’s current channels. There is no general guarantee that new places will appear at a particular day or time. Protect your application details and do not rely on unverified intermediaries promising a guaranteed result.',
 'de':'Prüfen Sie Termine über die aktuellen Kanäle der zuständigen Stelle. Neue Plätze zu einem bestimmten Tag oder einer festen Uhrzeit sind nicht allgemein garantiert. Schützen Sie Ihre Antragsdaten und vertrauen Sie keinen ungeprüften Vermittlern mit Erfolgsgarantien.',
 'es':'Consulte la disponibilidad por los canales actuales de la autoridad competente. No existe una garantía general de nuevas citas en un día u hora fijos. Proteja sus datos y no confíe en intermediarios no verificados que prometan un resultado seguro.',
 'it':'Verificare la disponibilità tramite i canali attuali dell’autorità competente. Non esiste una garanzia generale di nuovi appuntamenti in giorni o orari fissi. Proteggere i dati della domanda e non affidarsi a intermediari non verificati che promettono un risultato certo.',
}
# These source articles require complete replacement of expired or legally incorrect core claims.
rewrite=set(k for f in facts for k in f.get('rewriteGroups',[]))|{'973ff7b9-f012-4419-8bcf-9bd8ea99f02a','c0bc035b-3985-4ebf-9471-0b4d0c420270','99d893f4-0793-402f-a37a-401011dcb2be','9895eb4b-fcb8-4ff4-89e5-c54c9d5e849f','cb8dfb46-7232-4000-afed-91e4a921c53a','875513fe-f698-4183-8282-3de28467962f','474ece94-384f-475f-8548-f1d205a30be1','8646c198-8e51-4ebe-acd1-49d1ca1ec50e'}
# Keep clinical case exercises and technical tables, but remove unsupported statistical assertions.
clinical=[k for k,v in topics.items() if v['topic']=='professional' and k not in {x['id'] for x in read(DATA/'legacy-posts.json')}]
for post in base:
 key=post.get('translationId') or post['id'];lang=post['language'];soup=BeautifulSoup(post['html'],'html.parser');removed=[]
 relevant=[f for f in facts if key in f['groups']]
 # Remove superseded form scans and procedural graphics; current primary instructions replace them.
 if key in {'973ff7b9-f012-4419-8bcf-9bd8ea99f02a','97d405b4-e990-41bd-aaa0-1d5a43ef5072','1217e3fa-8134-4fd8-b69f-68fe9108c22a','85bb7901-4c6e-4e93-b84d-fa7af30fe9d1','e585dec5-a96b-47b9-a44b-abd4d3985e6b','81b8489b-3255-4cbc-a7c3-b884f1f51bd6','22e27618-a5c6-4974-86d5-c76b678e73d9'}:
  for element in list(soup.find_all(['figure','img'])):
   if element.parent:element.decompose()
 # Eliminate duplicate source-cover art; the new photographic cover is supplied separately.
 for fig in list(soup.find_all('figure')):
  img=fig.find('img')
  if img and img.get('src','').split('?')[0].split('/v1/')[0]==(post.get('coverImage') or '').split('?')[0].split('/v1/')[0] and not fig.get_text(strip=True):fig.decompose()
 if key in rewrite:
  removed.append('Outdated core procedure replaced with independently checked facts')
  soup=BeautifulSoup('','html.parser')
 else:
  for table in list(soup.find_all('table')):
   text=table.get_text(' ',strip=True)
   if money.search(text) and key not in clinical:removed.append(text[:180]);table.decompose()
  for tag in list(soup.find_all(['p','li','td','th','h2','h3','h4'])):
   if not tag.parent or tag.find(['p','li','td','th','h2','h3','h4']):continue
   text=tag.get_text(' ',strip=True)
   if not text:continue
   if (key=='1ba8b08c-4efd-45e9-87d4-7678b1b5c3e4' and '03:00' in text) or (key=='e9105cce-56de-41f5-8253-e677bc0157d1' and re.search(r'8:00|10:00|11:00',text)):
    removed.append(text[:180]);tag.clear();tag.string=appointment_copy[lang];continue
   risky=(money.search(text) and re.search(r'\d',text) and key not in clinical) or (years.search(text) and key not in clinical) or (statistics.search(text) and (key not in clinical or re.search(r'201\d|202\d|stud|araştır|global|welt|mond|dünya',text,re.I)))
   if key=='a946d744-e052-40fb-873e-5371ae1e13ea' and re.search(r'90|30.?45',text):risky=True
   if key=='06cc5d16-bd60-4988-9a22-9a84638cb859' and '30' in text:risky=True
   if key=='c78e3968-1685-473b-8036-687e41066a06' and re.search(r'\b15\b',text):risky=True
   if key=='ca6c0dad-689d-421c-a3a6-1e29e6161ece' and re.search(r'ninety\s+percent|90\s*%|%\s*90',text,re.I):risky=True
   if key=='77203df5-38bd-40cd-b3bd-db46278309eb' and re.search(r'13[.,\s]?000',text):risky=True
   if re.search(r'120\s*(?:full|day|gün)|240\s*(?:half|day|gün)',text,re.I):risky=True
   if re.search(r'(?:80|90|95|100)\s*%|%\s*(?:80|90|95|100)',text) and re.search(r'garant|başarı|öğrenci|student|success|Erfolg|éxito|éxito|erfolgreich',text,re.I):risky=True
   if risky:removed.append(text[:180]);tag.decompose()
 # Technical screenshots are examples, not an authoritative up-to-date filing instruction.
 for img in soup.find_all('img'):img['loading']='lazy'
 # Remove empty formatting left by paragraph/table edits.
 for tag in reversed(list(soup.find_all(['h2','h3','h4','p','li','ul','ol']))):
  if tag.parent and not tag.get_text(strip=True) and not tag.find(['img','a']):tag.decompose()
 # Drop headings whose only following content was obsolete and removed.
 for heading in list(soup.find_all(['h2','h3','h4'])):
  level=int(heading.name[1]);has_content=False
  for sibling in heading.next_siblings:
   if getattr(sibling,'name',None) in ['h2','h3','h4'] and int(sibling.name[1])<=level:break
   if getattr(sibling,'name',None) and (sibling.get_text(strip=True) or sibling.find(['img','table'])):has_content=True;break
  if not has_content:heading.decompose()
 if relevant:
  block=BeautifulSoup('<section><h2>'+html.escape(heads[lang])+'</h2></section>','html.parser').section
  for f in relevant:
   para=soup.new_tag('p');para.string=f['text'][lang];block.append(para)
   for url in f['sources']:
    para=soup.new_tag('p');a=soup.new_tag('a',href=url);a.string=sourceLabel[lang]+' · '+urllib.parse.urlparse(url).hostname;para.append(a);block.append(para)
  soup.insert(0,block)
 # A price table without current quotes is replaced by a decision workflow, never invented inflation.
 if removed and not relevant:
  p=soup.new_tag('p');p.string=qualifiers[lang];soup.insert(0,p)
 if key in expansions:
  extra=BeautifulSoup(expansions[key]['html'][lang],'html.parser')
  soup.extend(list(extra.contents))
 title=re.sub(r'\s*[([]?202[0-5](?:[-–/]202[0-6])?[)\]]?\s*',' ',post['title']).strip()
 if key=='c0bc035b-3985-4ebf-9471-0b4d0c420270':title={'tr':'Japonya Öğrenci Vizesi ve COE Başvuru Rehberi','en':'Japan student visa and Certificate of Eligibility guide','de':'Japan: Studienvisum und Certificate of Eligibility','es':'Japón: visado de estudios y Certificate of Eligibility','it':'Giappone: visto per studio e Certificate of Eligibility'}[lang]
 if key=='f9b5b0be-84a9-4003-8eaa-4dcb515c1330':title={'tr':'Öğrenci Ulaşım İndirimleri: ESNcard ve AEGEE Koşulları','en':'Student transport discounts: ESNcard and AEGEE conditions','de':'Studentenrabatte im Verkehr: ESNcard und AEGEE','es':'Descuentos de transporte: condiciones ESNcard y AEGEE','it':'Sconti trasporti per studenti: condizioni ESNcard e AEGEE'}[lang]
 titleFixes={
 '18223c3a-1771-44fc-8349-08c07de60516':dict(zip(['tr','en','de','es','it'],['İspanya Öğrenci ve Erasmus Vizesi: Sık Yapılan Hatalar','Spain student and Erasmus visas: common application mistakes','Spanien: Häufige Fehler beim Studien- und Erasmus-Visum','España: errores frecuentes en visados de estudios y Erasmus','Spagna: errori frequenti nei visti per studio ed Erasmus'])),
 '7a07c8ba-25b0-4eab-a042-e5f98845c6b5':dict(zip(['tr','en','de','es','it'],['İspanya Öğrenci Vizesi: Belge ve Başvuru Kontrol Listesi','Spain student visa: document and application checklist','Spanisches Studienvisum: Checkliste für Unterlagen und Antrag','Visado de estudios en España: lista de documentos y solicitud','Visto studentesco in Spagna: documenti e lista di controllo'])),
 }
 if key in titleFixes:title=titleFixes[key][lang]
 if key in expansions:title=expansions[key]['title'][lang]
 sourceList=list(post.get('editorialSources',[]))
 if key in expansions:sourceList+=expansions[key]['sources']
 for f in relevant:
  sourceList += [{'label':urllib.parse.urlparse(url).hostname,'url':url,'checkedAt':'2026-10-28'} for url in f['sources']]
 # Additional current primary sources from the already source-checked country guides.
 code=topics[key]['countryCodes'][0]
 for guide in read(ROOT/'src/data/europe-blog/generated/en.json'):
  if guide['countryCode']==code and guide['topic']==topics[key]['topic']:
   sourceList += [{'label':x['label'],'url':x['url'],'checkedAt':x['checkedAt']} for x in guide['sources']];break
 sourceList=list({x['url']:x for x in sourceList}.values())
 text=soup.get_text(' ',strip=True)
 if len(text)<100 and not soup.find('img'):raise RuntimeError('Review emptied article '+key+' '+lang)
 # Excerpts describe the revised body and never keep stale numerical or marketing promises.
 excerpt=(title+' — '+(soup.find('p').get_text(' ',strip=True) if soup.find('p') else text))[:190].rsplit(' ',1)[0]
 reviewed[post['id']]={'title':title,'excerpt':excerpt,'html':str(soup),'updatedAt':'2026-10-28T00:00:00Z','editorialReason':'Source-backed 2026 revision; remove obsolete prices, dates and unsupported claims; country classification and photographic presentation.','editorialSources':sourceList}
 audit.append({'id':post['id'],'topicKey':key,'language':lang,'removedBlocks':removed,'factIds':[f['id'] for f in relevant],'bodyCharacters':len(text)})
# New complete source articles share the same publication provenance and country metadata.
for p in read(DATA/'legacy-posts.json'):
 p['editorialTopicKey']=p['id'];p['editorialSources']=[]
# Keep the original export and prior overrides untouched.
for language in ['tr','en','de','es','it']:
 selected={post['id']:reviewed[post['id']] for post in base if post['language']==language}
 (DATA/('revisions-'+language+'.json')).write_text(json.dumps(selected,ensure_ascii=False,indent=2)+'\n')
WORK=ROOT/'.journal-work';WORK.mkdir(exist_ok=True);(WORK/'review-audit.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'reviewed':len(reviewed),'groups':len({x['topicKey'] for x in audit}),'removedBlocks':sum(len(x['removedBlocks']) for x in audit),'appliedFactBlocks':sum(len(x['factIds']) for x in audit),'minimumBody':min(x['bodyCharacters'] for x in audit)}))
