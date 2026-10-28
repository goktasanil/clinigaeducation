"""Discover licensed academic photographs without automatically publishing search results.

Usage:
  python3 scripts/fetch-journal-photography.py validate
  python3 scripts/fetch-journal-photography.py discover --country DE \
    --subject university-campus --query 'University of Heidelberg'

Discovery writes ignored candidate metadata only. A person/agent must inspect the
photo, verify its actual country and subject, and add the review fields before it
can enter photography.json. City-name matches alone are never accepted as an
academic photograph. There are no network requests during site generation.
"""
import argparse
import html
import json
import pathlib
import re
import time
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
SUBJECTS = ('university-campus', 'library', 'destination-cityscape', 'research-laboratory')
# A named campus can still host specimens, portraits, political events or car shows.
# These title matches reject those results before any manual image review.
UNRELATED = re.compile(
    r'\b(?:bird|zoo|wildlife|specimen|herbarium|botanical|rhododendron|ardea|'
    r'rotkehlchen|rhyticeros|calidris|anthophora|bombus|beetle|butterfly|'
    r'flower|skull|skeleton|fossil|coin|manuscript|catullus|horace|'
    r'portrait|bust|plaque|statue|sculpture|painting|drawing|fresco|'
    r'cemetery|crematorium|grave|memorial|football|rallye?|ferrari|'
    r'porsche|locomotive|aircraft|trolleybus|tram|map|diagram|logo|'
    r'coat.of.arms|postcard|engraving|stamp|president|minister|'
    r'ceremony|signing|parade|protest|award|meeting)\b', re.I,
)
ACADEMIC = re.compile(
    r'universit|universidad|universytet|univerz|college|campus|facult|'
    r'politecnic|polytechnic|rectorat|academic|library|bibliot|knihovn|'
    r'lesesaal|reading.room|lecture.hall|classroom|archiginnasio|eth.zürich|'
    r'sorbonne|sapienza|novoli|rettorato|studio.fiorentino', re.I,
)
LIBRARY = re.compile(r'library|bibliot|knihovn|lesesaal|reading.room|salle.de.lecture', re.I)
CITY = re.compile(
    r'panorama|cityscape|skyline|square|street|harbou?r|city|town|'
    r'palazzo.pubblico|palais|theatr|teatr|cathedral|catedral|kotor|'
    r'tórshavn|torshavn|monaco|san.marino|chi[sș]in|vatican', re.I,
)
RESEARCH = re.compile(
    r'laborator|pipett|centrifuge|biochem|dna.extract|microscope|'
    r'clinical.research|medical.technician|research.equipment', re.I,
)


def is_relevant_candidate(title, description, subject):
    """Conservative metadata gate; never a substitute for visual/location review."""
    if subject not in SUBJECTS or UNRELATED.search(title):
        return False
    text = title + ' ' + description
    positive = {'university-campus': ACADEMIC, 'library': LIBRARY,
                'destination-cityscape': CITY, 'research-laboratory': RESEARCH}[subject]
    return bool(positive.search(text))


def validate_catalog(photos):
    if not isinstance(photos, dict) or len(photos) != 377:
        raise ValueError('Expected all 377 distinct journal topic photographs')
    seen = set()
    for key, photo in photos.items():
        for field in ('title', 'url', 'sourceUrl', 'author', 'license', 'licenseUrl',
                      'countryCode', 'subject', 'selectionReason', 'reviewedAt'):
            if not isinstance(photo.get(field), str) or not photo[field].strip():
                raise ValueError(f'{key}: missing reviewed photograph field {field}')
        for field in ('url', 'sourceUrl', 'licenseUrl'):
            parsed = urllib.parse.urlparse(photo[field])
            if parsed.scheme != 'https' or not parsed.netloc or parsed.username:
                raise ValueError(f'{key}: invalid public HTTPS {field}')
        if photo['sourceUrl'] in seen:
            raise ValueError(f'{key}: duplicate photograph source')
        seen.add(photo['sourceUrl'])
        if not re.fullmatch(r'(?:[A-Z]{2}|GLOBAL)', photo['countryCode']):
            raise ValueError(f'{key}: invalid destination classification')
        if photo['subject'] not in SUBJECTS:
            raise ValueError(f'{key}: missing explicit photograph subject')
        if photo['width'] < 900 or photo['height'] < 400:
            raise ValueError(f'{key}: inadequate landscape photograph dimensions')
        # Selection notes bind the photograph to the reviewed editorial role.
        # Location-specific articles require location review even for campus names.
        if len(photo['selectionReason']) < 50:
            raise ValueError(f'{key}: incomplete subject/location rationale')
    return len(seen)


def _clean(value):
    return html.unescape(re.sub('<[^>]+>', '', value or '')).strip()


def discover(country, subject, query):
    params = {'action': 'query', 'format': 'json', 'generator': 'search',
              'gsrsearch': f'intitle:"{query}" filetype:bitmap', 'gsrnamespace': 6,
              'gsrlimit': 50, 'prop': 'imageinfo', 'iiprop': 'url|extmetadata|size',
              'iiurlwidth': 1280}
    url = 'https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(params)
    data = None
    for attempt in range(3):
        try:
            request = urllib.request.Request(url, headers={
                'User-Agent': 'CliniGAEducationEditorial/1.1 (https://www.clinigaeducation.com)'})
            with urllib.request.urlopen(request, timeout=40) as response:
                data = json.load(response)
            if data.get('error'):
                raise ValueError(data['error'])
            break
        except Exception:
            if attempt == 2:
                raise
            time.sleep(attempt + 1)
    candidates = []
    for page in data.get('query', {}).get('pages', {}).values():
        info = page.get('imageinfo', [{}])[0]
        metadata = info.get('extmetadata', {})
        value = lambda key: _clean(metadata.get(key, {}).get('value', ''))
        title = page['title'].removeprefix('File:')
        width, height = info.get('width', 0), info.get('height', 1)
        licence, description = value('LicenseShortName'), value('ImageDescription')
        if not re.search(r'CC BY(?:-SA)? [234]|CC0|Public domain|PDM', licence, re.I):
            continue
        if re.search(r'NC|ND', licence) or not re.search(r'\.(?:jpe?g|webp)$', title, re.I):
            continue
        if width < 1000 or height < 600 or not 1.18 < width / height < 2.65:
            continue
        if not is_relevant_candidate(title, description, subject):
            continue
        candidates.append({'title': title, 'url': info.get('thumburl', info.get('url', '')),
                           'sourceUrl': info['descriptionurl'], 'author': value('Artist'),
                           'license': licence, 'licenseUrl': value('LicenseUrl'),
                           'width': info.get('thumbwidth', width),
                           'height': info.get('thumbheight', height),
                           'countryCode': country, 'subject': subject,
                           'description': description, 'discoveryQuery': query})
    # No review date or selection rationale: candidates cannot masquerade as reviewed covers.
    directory = ROOT / 'src/data/journal/photo-candidates'
    directory.mkdir(parents=True, exist_ok=True)
    slug = re.sub(r'[^a-z0-9]+', '-', query.lower()).strip('-')
    path = directory / f'{country}-{subject}-{slug}.json'
    path.write_text(json.dumps(candidates, ensure_ascii=False, indent=2) + '\n')
    print(f'{len(candidates)} candidates saved for manual visual and location review: {path}')
    if not candidates:
        raise ValueError('No relevant licensed candidates; no fallback or catalogue update performed')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest='command', required=True)
    commands.add_parser('validate')
    discovery = commands.add_parser('discover')
    discovery.add_argument('--country', required=True)
    discovery.add_argument('--subject', choices=SUBJECTS, required=True)
    discovery.add_argument('--query', required=True)
    args = parser.parse_args()
    if args.command == 'validate':
        path = ROOT / 'src/data/journal/photography.json'
        count = validate_catalog(json.loads(path.read_text()))
        print(f'{count} reviewed distinct licensed journal photographs validated')
    else:
        if not re.fullmatch(r'(?:[A-Z]{2}|GLOBAL)', args.country):
            parser.error('country must be a destination code or GLOBAL')
        discover(args.country, args.subject, args.query)


if __name__ == '__main__':
    main()
