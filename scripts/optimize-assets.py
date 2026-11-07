"""Deduplicate byte-identical downloaded assets without altering image or SVG data."""
import pathlib,hashlib,json
root=pathlib.Path(__file__).resolve().parents[1];directory=root/'public/assets'
mapping=json.loads((root/'docs/asset-downloads.json').read_text());canonical={};rename={}
for p in sorted(directory.iterdir()):
 if not p.stat().st_size:continue
 digest=hashlib.sha256(p.read_bytes()).hexdigest();name=canonical.setdefault((digest,p.suffix),p.name);rename[p.name]=name
for f in (root/'src/design/screens').glob('*.tsx'):
 s=f.read_text()
 for old,new in rename.items():
  if old!=new:s=s.replace('assets/'+old,'assets/'+new)
 f.write_text(s)
for p in list(directory.iterdir()):
 if not p.stat().st_size or rename[p.name]!=p.name:p.unlink()
mapping={url:rename.get(name,name) for url,name in mapping.items()}
(root/'docs/asset-downloads.json').write_text(json.dumps(mapping,indent=2))
(root/'.design-reference/asset-map.json').write_text(json.dumps(mapping))
report=[{'file':'assets/'+p.name,'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(directory.iterdir())]
(root/'docs/assets.json').write_text(json.dumps(report,indent=2))
print(json.dumps({'before':len(rename),'after':len(report)}))
