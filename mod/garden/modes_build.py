from pathlib import Path
import json
root=Path(__file__).resolve().parent
rows=(root/'modes.menu').read_text(encoding='utf8').strip().splitlines()
plans=json.loads((root.parent/'sources/roster.json').read_text(encoding='utf8'))
ids={p['id'] for p in plans if p['id']!='imitater'}
assert len(rows)==len(ids)==191
found=set();names=set()
for row in rows:
    key,*items=row.split()
    assert key in ids and key not in found and len(items)==3
    found.add(key)
    rules=[]
    for item in items:
        title,route,action=item.split('/')
        assert title not in names
        names.add(title);rules.append((route,action))
    assert len(set(rules))==3
template=(root/'modes.runtime.js').read_text(encoding='utf8')
result=template.replace('  const routes =','  const MODE_DATA = '+json.dumps('\n'.join(rows),ensure_ascii=False)+';\n  const routes =')
(root/'modes.js').write_text(result,encoding='utf8')

