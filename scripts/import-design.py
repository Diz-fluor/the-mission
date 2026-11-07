"""Convert captured Figma JSX to local assets and plain CSS; no Tailwind runtime."""
import pathlib, json, re, hashlib, concurrent.futures, subprocess, time

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / 'src/design/screens'
OUT.mkdir(parents=True, exist_ok=True)
ASSETS = ROOT / 'public/assets'
ASSETS.mkdir(parents=True, exist_ok=True)
classes, assets, screens = {}, {}, []
cache_path=ROOT/'.design-reference/asset-map.json'
asset_cache=json.loads(cache_path.read_text()) if cache_path.exists() else {}
basic = {
 'relative':'position:relative','absolute':'position:absolute','block':'display:block',
 'flex':'display:flex','inline-grid':'display:inline-grid','grid':'display:grid',
 'flex-col':'flex-direction:column','flex-wrap':'flex-wrap:wrap','flex-none':'flex:none',
 'shrink-0':'flex-shrink:0','items-start':'align-items:flex-start','items-center':'align-items:center',
 'justify-center':'justify-content:center','justify-between':'justify-content:space-between','justify-end':'justify-content:flex-end',
 'content-stretch':'align-content:stretch','content-center':'align-content:center','content-start':'align-content:flex-start',
 'place-items-start':'place-items:start','col-1':'grid-column-start:1','row-1':'grid-row-start:1',
 'overflow-clip':'overflow:clip','overflow-hidden':'overflow:hidden','overflow-x-clip':'overflow-x:clip',
 'overflow-y-clip':'overflow-y:clip','overflow-y-auto':'overflow-y:auto','overflow-x-auto':'overflow-x:auto',
 'size-full':'width:100%;height:100%','w-full':'width:100%','h-full':'height:100%',
 'min-w-full':'min-width:100%','min-w-px':'min-width:1px','min-h-px':'min-height:1px','max-w-none':'max-width:none',
 'h-px':'height:1px','leading-none':'line-height:1','text-left':'text-align:left','text-center':'text-align:center',
 'text-right':'text-align:right','text-white':'color:#fff','font-normal':'font-weight:400','font-semibold':'font-weight:600',
 'font-bold':'font-weight:700','font-light':'font-weight:300','font-medium':'font-weight:500','not-italic':'font-style:normal',
 'whitespace-nowrap':'white-space:nowrap','whitespace-pre-wrap':'white-space:pre-wrap','object-cover':'object-fit:cover',
 'cursor-pointer':'cursor:pointer','pointer-events-none':'pointer-events:none','border':'border-width:1px',
 'border-2':'border-width:2px','border-b':'border-bottom-width:1px','border-b-2':'border-bottom-width:2px',
 'border-solid':'border-style:solid','text-ellipsis':'text-overflow:ellipsis','underline':'text-decoration-line:underline',
 'decoration-from-font':'text-decoration-thickness:from-font','decoration-solid':'text-decoration-style:solid',
 'bg-gradient-to-t':'background-image:linear-gradient(to top,var(--gradient-from),var(--gradient-to))',
}
props={'w':'width','h':'height','top':'top','left':'left','right':'right','bottom':'bottom','gap':'gap','gap-y':'row-gap',
 'leading':'line-height','tracking':'letter-spacing','rounded':'border-radius','rounded-tl':'border-top-left-radius',
 'rounded-tr':'border-top-right-radius','rounded-bl':'border-bottom-left-radius','rounded-br':'border-bottom-right-radius',
 'flex':'flex','grid-cols':'grid-template-columns','grid-rows':'grid-template-rows','mt':'margin-top','ml':'margin-left',
 'mb':'margin-bottom','min-w':'min-width','min-h':'min-height','opacity':'opacity'}
transform='transform:translate(var(--design-tx,0),var(--design-ty,0)) rotate(var(--design-rotate,0deg)) scaleX(var(--design-sx,1)) scaleY(var(--design-sy,1))'
def decl(token):
 if token in basic:return basic[token]
 if token.startswith('[') and token.endswith(']'):return token[1:-1].replace('_',' ')
 negative=token.startswith('-');token=token[1:] if negative else token
 m=re.match(r'^(.*?)\-\[(.*)\]$',token)
 if m:
  key,value=m.groups();value=value.replace('_',' ')
  value=re.sub(r'(?<=[\d%.)])([+-])(?=[\d.])',r' \1 ',value)
 else:
  key,value=token.rsplit('-',1)
  value={'0':'0px','1/2':'50%','full':'100%'}.get(value,value)
  if key in ['rotate']:value+='deg'
  elif key.startswith('scale-'):value=str(float(value)/100)
  elif key in ['mb','ml','mt','top','left','right','bottom','inset'] and re.match(r'^\d+$',value):value=str(float(value)*4)+'px'
 if negative:value='-'+value
 if key in props:return props[key]+':'+value
 if key in ['p','px','py','pt','pb','pl','pr']:
  ps={'p':['padding'],'px':['padding-left','padding-right'],'py':['padding-top','padding-bottom'],'pt':['padding-top'],'pb':['padding-bottom'],'pl':['padding-left'],'pr':['padding-right']}[key]
  return ';'.join(p+':'+value for p in ps)
 if key=='size':return 'width:'+value+';height:'+value
 if key=='inset':return 'inset:'+value
 if key=='font':return 'font-family:"'+value.strip("'\"").split(':')[0]+'",sans-serif'
 if key=='text':
  if value.startswith('color:'):return 'color:'+value[6:]
  if re.match(r'^-?[\d.]+(px|rem|em|%)$',value):return 'font-size:'+value
  return 'color:'+value
 if key=='bg':return ('background-image:' if 'gradient(' in value else 'background-color:')+value
 if key=='border':return ('border-width:' if value.endswith('px') else 'border-color:')+value
 if key=='shadow':return 'box-shadow:'+value
 if key=='blur':return 'filter:blur('+value+')'
 if key in ['from','to']:return '--gradient-'+key+':'+value
 if key in ['translate-x','translate-y','rotate','scale-x','scale-y']:
  name={'translate-x':'tx','translate-y':'ty','rotate':'rotate','scale-x':'sx','scale-y':'sy'}[key]
  return '--design-'+name+':'+value+';'+transform
 raise ValueError('Unknown design utility: '+token)
def convert(value):
 result=[]
 for t in value.split():
  if t not in classes:classes[t]=('d'+hashlib.sha1(t.encode()).hexdigest()[:10],decl(t))
  result.append(classes[t][0])
 return ' '.join(result)
for file in sorted((ROOT/'.design-reference').glob('*.json')):
 d=json.loads(file.read_text())
 if 'content' not in d or 'id' not in d:continue
 code=next((c['text'] for c in d['content'] if 'export default function' in c['text']),None)
 if code is None:continue # Quota-blocked states are listed explicitly in the coverage report.
 for url in re.findall(r'https://www\.figma\.com/api/mcp/asset/[\w.-]+',code):assets[url]=asset_cache.get(url,url.rsplit('/',1)[-1])
 code=re.sub(r'"(https://www\.figma\.com/api/mcp/asset/[\w.-]+)"',lambda m:'asset("assets/'+assets[m[1]]+'")',code)
 code=re.sub(r'className="([^"]*)"',lambda m:'className="'+convert(m[1])+'"',code)
 code=re.sub(r'className \|\| "([^"]*)"',lambda m:'className || "'+convert(m[1])+'"',code)
 code='// Generated from the matching Figma screen; behavior lives in src/prototype.\nconst asset = (path: string) => import.meta.env.BASE_URL + path;\n'+code+'\n'
 (OUT/(file.stem+'.tsx')).write_text(code)
 screens.append({'id':d['id'],'module':file.stem,'name':d.get('name',d['id'])})
(ROOT/'src/design/generated.css').write_text('\n'.join('.'+name+'{'+value+'}' for name,value in classes.values())+'\n')
(ROOT/'src/design/registry.ts').write_text('export const screens = {\n'+',\n'.join(json.dumps(s['id'])+': () => import("./screens/'+s['module']+'")' for s in screens)+'\n};\n')
(ROOT/'docs/asset-downloads.json').write_text(json.dumps(assets,indent=2))
print(json.dumps({'screens':len(screens),'cssUtilities':len(classes),'assets':len(assets)}))
if '--download' in __import__('sys').argv:
 def download(item):
  url,name=item;path=ASSETS/name
  if path.exists() and path.stat().st_size>0:return name
  temporary=path.with_suffix(path.suffix+'.part')
  for attempt in range(5):
   result=subprocess.run(['curl','-fsSL','--retry','3',url,'-o',str(temporary)])
   if result.returncode==0 and temporary.exists() and temporary.stat().st_size>0:
    temporary.replace(path)
    return name
   temporary.unlink(missing_ok=True)
   time.sleep(2)
  raise RuntimeError('Asset service returned an empty file: '+name)
 with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:list(pool.map(download,assets.items()))
 print('Downloaded all design assets')
