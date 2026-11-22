"""Ship native ZombieFeatures codenames/Chinese names with the challenge field guide."""
import json
from pathlib import Path
import fixed_rank

HERE = Path(__file__).resolve().parent

def native_species():
    config=json.loads((fixed_rank.ASSETS/'config.json').read_text(encoding='utf8'))
    index=next(i for i,p in config['paths'].items() if p[0]=='json/Features/ZombieFeatures')
    data=next(v['ZOMBIES'] for v in fixed_rank.nodes(fixed_rank.asset(config,index)) if isinstance(v,dict) and 'ZOMBIES' in v)
    return [[z['CODENAME'],z.get('OBTAINWORLD',''),z['NAME'].get('zh',z['CODENAME'])] for z in data]

def helper():
    return 'const gardenWorldSpecies='+json.dumps(native_species(),ensure_ascii=False,separators=(',',':'))+';\n'+(HERE/'world-veterans.js').read_text(encoding='utf8')

def apply(source):
    from fairplay import once
    return once(source,'gardenChallenge.resetBody(B,t),','gardenChallenge.resetBody(B,t),gardenWorldVeterans.reset(B,t),')
