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
# 已確認的 C 成對頭頸與盤髮；肩膀以下保留固定來源曲線。
def segments(s):
    tokens = list(re.finditer(r'[a-zA-Z]|[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?', s))
    x = y = 0
    i = 0
    command = ''
    result = []
    while i < len(tokens):
        if tokens[i][0].isalpha():
            command = tokens[i][0]
            i += 1
        if command == 'z':
            break
        count = {'m': 2, 'c': 6, 'l': 2, 'h': 1, 'v': 1, 'H': 1, 'V': 1}[command]
        start = tokens[i].start()
        nums = [float(t[0]) for t in tokens[i:i+count]]
        i += count
        if command in ('m', 'c', 'l'):
            x += nums[-2]
            y += nums[-1]
        elif command == 'h':
            x += nums[-1]
        elif command == 'v':
            y += nums[-1]
        elif command == 'H':
            x = nums[-1]
        elif command == 'V':
            y = nums[-1]
        result.append((start, x, y))
        if command == 'm':
            command = 'l'
    return result

f = segments(outlines[0])
b = segments(outlines[1])
assert abs(f[4][1]-353.24) < .001 and abs(f[237][1]-287.63) < .001
assert abs(b[3][1]-1175.41) < .001
b_end = next(i for i, (start, x, y) in enumerate(b) if outlines[1][start:].startswith('0.031,-0.22254'))
assert abs(b[b_end-1][1]-1109.73) < .001
body_f = 'M353.24 235.51 c ' + outlines[0][f[5][0]:f[238][0]].rstrip()
body_b = 'M1175.41 235.17 c ' + outlines[1][b[4][0]:b[b_end][0]].rstrip()
# Existing body/shoulder curves are copied unchanged between the neck-root anchors.
head_f = ' C288 223 286 214 278 205 C267 191 262 176 260 159 C252 163 248 158 248 150 C246 138 250 131 257 135 C254 90 272 48 320 45 C368 48 386 90 383 135 C390 131 394 138 392 150 C392 158 388 163 380 159 C378 178 373 192 362 205 C355 214 352 223 353.24 235.51 Z'
head_b = ' C1110 216 1105 200 1098 191 C1086 181 1080 166 1079 151 C1071 153 1067 145 1069 135 C1070 128 1073 127 1077 132 C1076 90 1094 48 1140 45 C1186 48 1204 90 1203 132 C1207 127 1210 128 1211 135 C1213 145 1209 153 1201 151 C1200 168 1193 183 1182 194 C1176 205 1174 221 1175.41 235.17 Z'
front_bun = 'M289 46 C289 31 302 22 320 22 C339 22 353 32 354 46 Z'
hair_f = 'M257 135 C250 85 272 42 320 42 C368 42 390 85 383 135 L375 134 Q374 113 368 103 C340 101 302 92 276 75 Q264 100 265 137 Z'
hair_b = 'M1077 132 C1074 89 1093 42 1140 42 C1187 42 1206 89 1203 132 C1200 166 1187 192 1165 211 C1156 209 1148 204 1140 204 C1132 204 1124 209 1115 211 C1093 192 1080 166 1077 132 Z'
bun = 'M1095 99 C1090 64 1109 44 1139 46 C1170 44 1188 64 1184 96 C1180 132 1159 151 1137 149 C1114 148 1100 129 1095 99 Z'
front_lines = ['M286 61 C310 82 337 96 366 101', 'M301 54 C325 68 352 90 369 96', 'M282 69 C303 85 328 95 352 98', 'M301 34 Q320 22 342 39']
back_lines = ['M1106 95 C1099 71 1115 51 1137 52 C1160 50 1177 69 1173 93 C1170 119 1152 137 1136 135', 'M1120 99 C1108 83 1122 61 1140 61 C1161 60 1166 84 1153 100', 'M1083 136 Q1101 168 1122 179', 'M1097 175 Q1105 192 1118 202', 'M1197 136 Q1179 168 1158 179', 'M1183 175 Q1175 192 1162 202', 'M1130 153 Q1134 178 1125 198', 'M1150 153 Q1146 178 1155 198']
chin = 'M278 205 C293 225 307 231 320 231 C333 231 347 225 362 205'

outlines=[body_f+head_f,body_b+head_b]
legacy=json.loads((source/'legacy-locations.json').read_text())
patch_file=source/'label-points.json';patches=json.loads(patch_file.read_text()) if patch_file.exists() else {}
view_boxes={'F':['-50 -40 734 1538','140 205 360 230','-35 285 710 525','180 295 280 410','175 560 290 500','190 965 260 500'],'B':['756 0 774 1448','960 205 360 230','785 285 710 525','1000 295 280 410','995 560 290 500','1010 965 260 500']}
def hair(view):
 if view=='F':
  return {'hairBack':front_bun,'hairFront':hair_f,'hairLines':front_lines}
 return {'hairBack':'','hairFront':hair_b+' '+bun,'hairLines':back_lines}

views={view:{'viewBox':view_boxes[view][0],'outline':outlines[n],'art':([{'slug':'head','path':chin}] if view=='F' else []),**hair(view)} for n,view in enumerate(['F','B'])}

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
(root/'assets/female-map.js').write_text('// F2 + C paired head and reference bun. Generated by scripts/build-female-map.py. MIT notice embedded below.\nwindow.FEMALE_MAP = '+json.dumps(output,ensure_ascii=False,indent=2)+';\n')
doc='''# 女性人體圖與既有位置對照

固定來源：`8ed39ac2ae9cb46fb79d77eedec7e5b029a75174`。37類／74左右key保持不變；依原本可見性共92個位置（正面44、背面48）。F/B共用key仍為同一觀察，不增加前後維度或改寫歷史。

左右一律是使用者本人的左右。來源左右欄位表示畫面位置，故正面來源left→本人R、right→本人L；背面來源left→本人L、right→本人R。不因圖像換成女性就猜測或更改歷史紀錄。

來源肌群碎片合併成既有位置；自繪橢圓只表示體表附近。髖前側、肩後側／旋轉肌群、肩胛內側、臀中肌、髂脛束附近、阿基里斯腱及脊柱相關位置均不主張精確組織邊界。中央或更細的位置仍使用備註。未經真人物理治療師／教練定位驗收。

| 穩定ID | 顯示名稱 | 可見面 | 路徑依據 |
|---|---|---|---|
'''+ '\n'.join(rows)+'''

## 可重現來源與限制

`python3 scripts/build-female-map.py` 從已固定的來源資產、舊位置定義與標示點修正檔產生圖形；不需網路。`scripts/source/label-points.json` 是瀏覽器原生 SVG 命中驗證後的分數標示點，只改顯示位置，不代表專業臨床校準。原生驗證亦不能證明位置的醫療正確性。

37個舊位置全部保留且各側可用文字清單選取。細碎或相疊熱區會提供候選，避免由頂層圖形任意決定。C版頭頸盤髮為裝飾，不參與點選命中，頸肩高亮放在其上方。圖形來源MIT授權見 `THIRD-PARTY-NOTICES.md`。
'''
(root/'docs/female-map-locations.md').write_text(doc)
print(f'{len(locations)} locations; {len({p["id"]+"."+p["side"] for p in locations})} unique keys')
