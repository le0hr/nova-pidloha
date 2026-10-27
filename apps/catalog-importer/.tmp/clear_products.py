import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app.config import Settings
from app.strapi.client import StrapiClient

client = StrapiClient(Settings())
folder = Path('import-runs') / ('delete-products-' + datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ'))
folder.mkdir(parents=True)
entities = ('product-variations', 'products')
snapshot = {}
for entity in entities:
    snapshot[entity] = {status: client.fetch(entity, status) for status in ('draft', 'published')}
(folder / 'snapshot.json').write_text(json.dumps(snapshot, ensure_ascii=False))
print('Snapshot:', folder, flush=True)
with (folder / 'deleted.jsonl').open('a') as journal:
    for entity in entities:
        ids = sorted({r['documentId'] for records in snapshot[entity].values() for r in records})
        print(entity, 'deleting', len(ids), flush=True)
        for i, doc_id in enumerate(ids, 1):
            response = client.http.delete('api/' + entity + '/' + quote(doc_id, safe=''))
            if not 200 <= response.status_code < 300:
                raise RuntimeError(f'{entity}/{doc_id}: HTTP {response.status_code}')
            journal.write(json.dumps({'entity': entity, 'documentId': doc_id}) + '\n')
            journal.flush()
            if i % 250 == 0 or i == len(ids):
                print(entity, i, '/', len(ids), flush=True)
for entity in entities:
    for status in ('draft', 'published'):
        total = client.request('GET', 'api/' + entity, params={'status': status, 'pagination[pageSize]': 1})['meta']['pagination']['total']
        print('Remaining:', entity, status, total, flush=True)
        if total:
            raise RuntimeError('Collection is not empty')
client.close()
