"""Read-only checks of an import journal against the local published catalog."""
import argparse
import json
import sqlite3
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('journal', type=Path)
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
with args.journal.open() as stream:
    plan = json.loads(next(stream))['plan']
    events = [json.loads(line) for line in stream]
assert events[-1]['event'] == 'completed', 'Import journal is not complete'
connection = sqlite3.connect(f'file:{root.parent / "cms/.tmp/data.db"}?mode=ro', uri=True)
connection.row_factory = sqlite3.Row
counts = {}
photos = 0
for entity in {op['entity'] for op in plan['operations']} - {'media'}:
    table = entity.replace('-', '_')
    rows = connection.execute(f'SELECT * FROM "{table}" WHERE published_at IS NOT NULL')
    remote = {row['external_id']: dict(row) for row in rows}
    wanted = [op for op in plan['operations'] if op['entity'] == entity]
    for op in wanted:
        key = op['external_id']
        assert key in remote, (entity, key, 'missing published record')
        record = remote[key]
        payload = op['payload']
        for field in ('name', 'catalog_attributes', 'attribute_definitions'):
            if field in payload:
                actual = record[field]
                if field in ('catalog_attributes', 'attribute_definitions'):
                    actual = json.loads(actual) if actual else None
                assert actual == payload[field], (entity, key, field)
        if entity == 'product-variations' and payload.get('image'):
            digest = payload['image']['$id']
            expected = plan['assets'][digest]['name']
            matches = connection.execute(
                "SELECT f.name FROM files f JOIN files_related_mph r ON r.file_id=f.id "
                "WHERE r.related_id=? AND r.related_type='api::product-variation.product-variation' "
                "AND r.field='image'", (record['id'],)
            ).fetchall()
            assert [row['name'] for row in matches] == [expected], (key, 'photo mismatch')
            photos += 1
    counts[entity] = len(wanted)
connection.close()
print(json.dumps({'verified_published': counts, 'verified_photos': photos}, ensure_ascii=False))
