# coding: utf-8
"""由固定版本的 MIT 路徑與明確舊位置對照產生靜態圖形。無網路或產品相依套件。"""
import json,re,pathlib
root=pathlib.Path(__file__).resolve().parent.parent
source=root/'scripts/source'
SHA='8ed39ac2ae9cb46fb79d77eedec7e5b029a75174'
def read_model(filename):
 s=(source/filename).read_text().split('= [',1)[1].rsplit('];',1)[0]
 s=re.sub(r'//[^\n]*','',s);s=re.sub(r'\b(slug|color|path|common|left|right)\s*:',r'"\1":',s);s=re.sub(r',\s*([}\]])',r'\1',s)
 return json.loads(re.sub(r',\s*([}\]])',r'\1','['+s+']'))
models={'F':read_model('assets_bodyFemaleFront.ts'),'B':read_model('assets_bodyFemaleBack.ts')}
outlines=re.findall(r'\bd="([^"]+)"',(source/'components_SvgFemaleWrapper.tsx').read_text())
legacy=json.loads((source/'legacy-locations.json').read_text())
patch_file=source/'label-points.json';patches=json.loads(patch_file.read_text()) if patch_file.exists() else {}
view_boxes={'F':['-50 -40 734 1538','140 205 360 230','-35 285 710 525','180 295 280 410','175 560 290 500','190 965 260 500'],'B':['756 0 774 1448','960 205 360 230','785 285 710 525','1000 295 280 410','995 560 290 500','1010 965 260 500']}
def hair(view):
 # 原創簡潔盤髮：附圖僅為風格參考。背面髮際線在後頸收束，沒有鮑伯凹口。
 dx=0 if view=='F' else 820
 bun=f'M{288+dx} 44C{278+dx} 10 {296+dx} -4 {322+dx} -4C{348+dx} -4 {365+dx} 14 {353+dx} 45Z'
 cap=f'M{246+dx} 144C{234+dx} 65 {265+dx} 29 {320+dx} 29C{375+dx} 29 {405+dx} 67 {395+dx} 145L{391+dx} 205Q{385+dx} 228 {367+dx} 237Q{320+dx} 253 {273+dx} 237Q{255+dx} 228 {249+dx} 205Z'
 fringe=f'M{246+dx} 144C{234+dx} 65 {265+dx} 29 {320+dx} 29C{375+dx} 29 {405+dx} 67 {395+dx} 145L{383+dx} 147Q{378+dx} 112 {368+dx} 94Q{305+dx} 99 {260+dx} 72Q{251+dx} 102 {257+dx} 145Z'
 lines=([f'M{274+dx} 61Q{320+dx} 86 {368+dx} 94',f'M{294+dx} 15Q{325+dx} 1 {347+dx} 28'] if view=='F' else [f'M{265+dx} 89Q{320+dx} 157 {378+dx} 87',f'M{277+dx} 69Q{320+dx} 127 {368+dx} 67',f'M{295+dx} 18Q{320+dx} 4 {345+dx} 28'])
 return {'hairBack':bun,'hairFront':fringe if view=='F' else cap,'hairLines':lines}

views={view:{'viewBox':view_boxes[view][0],'outline':outlines[n],'art':[{'slug':a['slug'],'path':d} for a in models[view] if a['slug']=='head' for paths in a['path'].values() for d in paths],**hair(view)} for n,view in enumerate(['F','B'])}
def native(view,slug,side):
 # Upstream left/right are screen-side fragments. Convert to the recorder's anatomical side.
 src='left' if (view=='F')==(side=='R') else 'right'
 part=next(a for a in models[view] if a['slug']==slug)
 return ' '.join(re.sub(r'^\s*m', 'M', d) for d in part['path'].get(src,[]))
def ellipse(x,y,rx,ry):return f'M{x-rx} {y}a{rx} {ry} 0 1 0 {2*rx} 0a{rx} {ry} 0 1 0 {-2*rx} 0Z'
# Native-coordinate polygons/ellipses for locations not represented as distinct source muscles.
# Values describe body-surface recording areas, never a diagnosis or anatomical tissue boundary.
custom={
 ('F','hipFlexor'):(255,655,30,35),('F','itBand'):(212,810,13,100),
 ('B','rhomboid'):(1111,380,18,48),('B','rotator'):(1057,351,34,27),
 ('B','gluteMed'):(1056,632,32,26),('B','achilles'):(1105,1293,11,32),
 ('F','jNeck'):(294,273,26,31),('B','jNeck'):(1114,263,25,30),
 ('F','jShoulder'):(195,320,40,40),('B','jShoulder'):(1015,320,40,40),
 ('F','jElbow'):(150,484,34,35),('B','jElbow'):(970,484,34,35),
 ('F','jWrist'):(74,649,25,25),('B','jWrist'):(894,649,25,25),
 ('F','jHand'):(35,710,32,42),('B','jHand'):(855,710,32,42),
 ('B','jThoracic'):(1118,402,21,68),('B','jLumbar'):(1119,550,20,49),
 ('B','jSI'):(1107,615,22,23),('F','jHip'):(239,652,39,39),
 ('F','jKnee'):(246,991,34,34),('B','jKnee'):(1066,991,34,34),
 ('F','jAnkle'):(272,1324,25,28),('B','jAnkle'):(1092,1324,25,28),
 ('F','jFoot'):(264,1407,36,28),('B','jFoot'):(1084,1407,36,28),
}
# Source muscle slug and seed score marker. Native SVG tests refine only marker positions.
slugs={
 ('F','scm'):('neck',(302,280)),('F','traps'):('trapezius',(265,291)),('F','chest'):('chest',(267,371)),
 ('F','deltoid'):('deltoids',(207,330)),('F','biceps'):('biceps',(173,420)),('F','forearmF'):('forearm',(128,565)),
 ('F','abs'):('abs',(287,534)),('F','obliques'):('obliques',(249,537)),('F','quads'):('quadriceps',(248,810)),
 ('F','adductors'):('adductors',(291,817)),('F','shin'):('tibialis',(260,1152)),
 ('B','traps'):('trapezius',(1087,307)),('B','lats'):('upper-back',(1065,433)),
 ('B','erector'):('lower-back',(1111,545)),('B','rearDelt'):('deltoids',(1015,335)),
 ('B','triceps'):('triceps',(1009,430)),('B','forearmE'):('forearm',(951,562)),
 ('B','gluteMax'):('gluteal',(1078,714)),('B','hamstrings'):('hamstring',(1082,873)),('B','calf'):('calves',(1107,1096)),
}
locations=[];rows=[]
for z in legacy['Z']:
 id,visible=z[:2]
 for view in ['F','B']:
  if view not in visible:continue
  center=320 if view=='F' else 1140
  for side in ['R','L']:
   on_screen_left=(view=='F')==(side=='R')
   if (view,id) in slugs:
    slug,seed=slugs[view,id];path=native(view,slug,side);x,y=seed
    if not on_screen_left:x=2*center-x
   else:
    x,y,rx,ry=custom[view,id]
    if not on_screen_left:x=2*center-x
    path=ellipse(x,y,rx,ry)
   assert path,(view,id,side)
   key=f'{view}:{id}.{side}';point=patches.get(key,[x,y])
   locations.append({'id':id,'view':view,'side':side,'path':path,'labelPoint':point})
 name=legacy['N'][id][0];ref=' / '.join(f"{v}:{slugs[v,id][0] if (v,id) in slugs else '自繪體表示意'}" for v in ['F','B'] if v in visible)
 rows.append(f'| `{id}` | {name} | {visible} | {ref} |')
output={'source':{'repo':'https://github.com/HichamELBSI/react-native-body-highlighter','sha':SHA,'license':(source/'LICENSE').read_text()},'views':views,'locations':locations,'zooms':view_boxes}
(root/'assets/female-map.js').write_text('// F2 + H1. Generated by scripts/build-female-map.py. MIT notice embedded below.\nwindow.FEMALE_MAP = '+json.dumps(output,ensure_ascii=False,indent=2)+';\n')
doc='''# 女性人體圖與既有位置對照

固定來源：`8ed39ac2ae9cb46fb79d77eedec7e5b029a75174`。37類／74左右key保持不變；依原本可見性共92個位置（正面44、背面48）。F/B共用key仍為同一觀察，不增加前後維度或改寫歷史。

左右一律是使用者本人的左右。來源左右欄位表示畫面位置，故正面來源left→本人R、right→本人L；背面來源left→本人L、right→本人R。不因圖像換成女性就猜測或更改歷史紀錄。

來源肌群碎片合併成既有位置；自繪橢圓只表示體表附近。髖前側、肩後側／旋轉肌群、肩胛內側、臀中肌、髂脛束附近、阿基里斯腱及脊柱相關位置均不主張精確組織邊界。中央或更細的位置仍使用備註。未經真人物理治療師／教練定位驗收。

| 穩定ID | 顯示名稱 | 可見面 | 路徑依據 |
|---|---|---|---|
'''+ '\n'.join(rows)+'''

## 可重現來源與限制

`python3 scripts/build-female-map.py` 從已固定的來源資產、舊位置定義與標示點修正檔產生圖形；不需網路。`scripts/source/label-points.json` 是瀏覽器原生 SVG 命中驗證後的分數標示點，只改顯示位置，不代表專業臨床校準。原生驗證亦不能證明位置的醫療正確性。

37個舊位置全部保留且各側可用文字清單選取。細碎或相疊熱區會提供候選，避免由頂層圖形任意決定。H1髮型為裝飾，不參與點選命中，頸肩高亮放在其上方。圖形來源MIT授權見 `THIRD-PARTY-NOTICES.md`。
'''
(root/'docs/female-map-locations.md').write_text(doc)
print(f'{len(locations)} locations; {len({p["id"]+"."+p["side"] for p in locations})} unique keys')
