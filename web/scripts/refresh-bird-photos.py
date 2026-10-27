#!/usr/bin/env python3
"""Fetch explicitly licensed Commons species photographs and retain every attribution.

Wikipedia's species article is used only to choose its lead image. Commons imageinfo
is authoritative for the image creator, license, original URL and description page.
No downloaded image is altered. UI cropping must be disclosed with the attribution.
"""
import argparse
from datetime import datetime, timezone
import hashlib
import html
import json
from pathlib import Path
import re
import time
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
SPECIES = {
    'waved-albatross': 'Waved albatross', 'eastern-curlew': 'Far Eastern curlew', 'bar-tailed-godwit': 'Bar-tailed godwit',
    'ruddy-turnstone': 'Ruddy turnstone', 'sanderling': 'Sanderling', 'red-knot': 'Red knot', 'great-knot': 'Great knot',
    'curlew-sandpiper': 'Curlew sandpiper', 'sharp-tailed-sandpiper': 'Sharp-tailed sandpiper', 'whimbrel': 'Eurasian whimbrel',
    'common-tern': 'Common tern', 'arctic-tern': 'Arctic tern', 'barn-swallow': 'Barn swallow',
}


def fetch(url, path, offline=False):
    if path.exists():
        return path.read_bytes()
    if offline:
        raise ValueError(f'Missing cached source: {path}')
    for attempt in range(3):
        try:
            request = urllib.request.Request(url, headers={'User-Agent': 'BirdRadar/1.0 (educational open bird atlas; licensed image attribution)'})
            with urllib.request.urlopen(request, timeout=90) as response:
                result = response.read()
            path.write_bytes(result)
            return result
        except OSError:
            if attempt == 2:
                raise
            time.sleep(10 * (attempt + 1))


def plain(value):
    return ' '.join(html.unescape(re.sub('<[^>]+>', ' ', value)).split())


def update_catalog_photo_fields(credits):
    """Keep displayed credit and license aligned with the downloaded photograph."""
    path = ROOT / 'lib/birds.ts'
    source = path.read_text()
    fields = ('photo', 'photoCredit', 'photoLicense', 'photoLicenseUrl', 'photoSource')
    source = re.sub(r'\b(?:' + '|'.join(fields) + r'):\s*"(?:\\.|[^"\\])*",\s*', '', source)
    for credit in credits:
        bird_id = credit['speciesId']
        pattern = r'(?P<id>(?:id|"id"):\s*"' + re.escape(bird_id) + r'",)'
        additions = ' '.join(f'{field}: {json.dumps(credit[field], ensure_ascii=False)},' for field in fields)
        source, count = re.subn(pattern, lambda match: match['id'] + ' ' + additions, source, count=1)
        if count != 1:
            raise ValueError(f'Missing catalog profile for {bird_id}')
    path.write_text(source)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--cache', type=Path, default=Path('/tmp/birdradar-photo-cache'))
    parser.add_argument('--offline', action='store_true')
    args = parser.parse_args()
    args.cache.mkdir(parents=True, exist_ok=True)
    out = ROOT / 'public/assets/birds'
    out.mkdir(parents=True, exist_ok=True)
    credits = []
    for bird_id, title in SPECIES.items():
        article_url = 'https://en.wikipedia.org/api/rest_v1/page/summary/' + urllib.parse.quote(title.replace(' ', '_'))
        article = json.loads(fetch(article_url, args.cache / f'{bird_id}-article.json', args.offline))
        original = article['originalimage']['source'].split('?')[0]
        image_title = 'File:' + urllib.parse.unquote(original.split('/')[-2] if '/thumb/' in original else original.rsplit('/', 1)[1])
        meta_url = 'https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(dict(action='query', format='json', titles=image_title, prop='imageinfo', iiprop='url|extmetadata', iiurlwidth=960))
        metadata = json.loads(fetch(meta_url, args.cache / f'{bird_id}-commons.json', args.offline))
        page = next(iter(metadata['query']['pages'].values()))
        info = page['imageinfo'][0]
        fields = info['extmetadata']
        license_name = fields.get('LicenseShortName', {}).get('value', '')
        license_url = fields.get('LicenseUrl', {}).get('value', '')
        if not (license_name.startswith(('CC BY ', 'CC BY-SA ', 'CC0')) or license_name in ('Public domain', 'PDM')):
            raise ValueError(f'Unapproved photograph license for {bird_id}: {license_name}')
        image_url = info.get('thumburl', info['url']).split('?')[0]
        image = fetch(image_url, args.cache / f'{bird_id}.jpg', args.offline)
        if not image.startswith(b'\xff\xd8'):
            raise ValueError(f'Expected JPEG photograph for {bird_id}')
        target = out / f'{bird_id}.jpg'
        target.write_bytes(image)
        credit = dict(speciesId=bird_id, photo=f'/assets/birds/{bird_id}.jpg',
                      photoCredit=plain(fields.get('Artist', {}).get('value', 'Wikimedia Commons contributor')),
                      photoLicense=license_name, photoLicenseUrl=license_url, photoSource=info['descriptionurl'],
                      originalUrl=info['url'], downloadedUrl=image_url, sourceTitle=page['title'],
                      retrievedAt=datetime.fromtimestamp((args.cache / f'{bird_id}.jpg').stat().st_mtime, timezone.utc).isoformat(),
                      sha256=hashlib.sha256(image).hexdigest(), changes='Unaltered Wikimedia thumbnail; the application may crop the display to fit a stamp or hero.')
        credits.append(credit)
        print(f'{bird_id}: {len(image)} bytes, {license_name}, {credit["photoCredit"]}', flush=True)
        if not args.offline:
            time.sleep(1)
    update_catalog_photo_fields(credits)
    (ROOT / 'public/data/bird-photo-provenance.json').write_text(json.dumps(credits, indent=2, ensure_ascii=False) + '\n')


if __name__ == '__main__':
    main()
