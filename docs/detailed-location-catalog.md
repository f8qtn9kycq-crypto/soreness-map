# 全身痠痛位置細分對照表（互動原型）

日期：2026-10-26。原始回饋：右胸希望有內側、外側、上方、下方與中央，並對其他部位採用相同定位原則。

## 交付範圍與狀態

這是可操作的產品原型與位置詞彙提案，尚未整合正式紀錄、趨勢、匯入或匯出。涵蓋現有 37 類、74 個左右大部位；每側共有 321 個細分選項，左右合計 642 個細分位置，另每個大部位保留「整區」及「無法明確定位」。數量表示產品選項，不表示獨立肌肉、臨床定位精度或專業審核結果。

[開啟互動原型](../prototypes/detailed-locations.html)。在 repo 根目錄執行 `python3 -m http.server 8766 --bind 127.0.0.1`，瀏覽 `http://127.0.0.1:8766/prototypes/detailed-locations.html`。亦可直接開啟 HTML；所有資源均為本機相對路徑。

使用者旅程：選大部位／左右 → 依局部放大與文字選取多個細部位置 → 各位置獨立評分 → 在本頁摘要重新編輯。未操作滑桿或＋前不預填分數。再次點選已選位置會編輯並保留分數；評分後按完成。相同側別／部位的細格、列、欄、整區及無法定位互斥；替換、移除與清空可復原。

## 共通定位原則

1. 「相同指引」是每區都能細分，並不代表每區硬套相同格數。長形區域可用上中下段與地標，手腕用掌背／拇指／小指側，膝用膝蓋骨周圍與前後內外側。
2. 以使用者自己的左右為準；正面右在畫面左，背面右在畫面右。內／外側指靠近／遠離身體正中線，不是螢幕方向。
3. 胸部上中下 × 靠胸骨／中央／靠腋下是九種位置描述，不是九塊肌肉。所有雙方向格線另提供只知道其中一個方向的選項，例如「僅上方」，不要求猜測另一方向。主要畫面使用完整人體 SVG，選部位後只改變視窗並讓該部位置中，保留周圍身體作為參照。聚焦圖的細格可直接點選；文字方塊依圖形相對位置排列，左右切換時同步調整。不改動穩定的細分 ID 或編號。
4. 不把深層肌肉、肌頭、韌帶或病名當成可由表面點選確認的結果。選取資料僅表示主觀感覺位置。
5. 全身正中線及跨左右位置尚未新增；不把它偷偷歸入任一側。「中央高度／中央寬度」是選定單側區域的中央，不是身體正中線。
6. 保留原有大部位範圍：例如 `traps` 仍是上斜方肌附近，不擴大為整片上中下斜方肌；手指目前每指一個選項，足趾尚非逐趾／逐關節。
7. 全身圖只填入已選的細區；目前編輯的大部位以虛線輪廓表示。「整區」才填滿整區，「無法明確定位」不猜一個細格。當前視角看不到的膝後／足底等不硬畫到其他表面，改以提示與局部圖呈現。
8. 主要人體圖保留原輪廓與比例，提供「全身／聚焦所選部位／再放大」，不再使用步驟2的孤立部位圖。手掌／手背、足背／足底等無法同時從全身看見的面向，另放在預設收合的「其他視角參考」。全身細格透過原部位輪廓裁切，不能把示意分區當作專業解剖邊界。

## 全 37 類選項

下列來源提供解剖與地標參照；沒有任何一個來源被當作已驗證這組自訂格線或其手機操作精度。

| 既有大部位 ID | 部位 | 細分方式（左右各一組） | 每側數量 | 對照來源 |
|---|---|---|---:|---|
| scm | 頸前側 | 上段（耳下）／中段／下段（鎖骨） | 3 | [OSU 2e 11.4：頭、頸與背部肌肉](https://open.oregonstate.education/anatomy2e/chapter/axial-muscles-head-neck-back/) |
| traps | 頸肩上側（上斜方肌） | 靠頸根／頸肩之間／靠肩峰 | 3 | [OSU 11.6：肩帶與上肢肌肉](https://open.oregonstate.education/anatomy/chapter/11-6-muscles-of-the-pectoral-girdle-and-upper-limbs/)、[Physiopedia / Rehab My Patient：Trapezius](https://exercises.physio-pedia.com/shoulder/trapezius) |
| chest | 胸肌 | 上方／中央高度／下方 × 靠胸骨／中央寬度／靠腋下；亦可只選單一方向 | 15 | [OSU 11.6：肩帶與上肢肌肉](https://open.oregonstate.education/anatomy/chapter/11-6-muscles-of-the-pectoral-girdle-and-upper-limbs/)、[Physiopedia：Pectoralis major](https://www.physio-pedia.com/Pectoralis_major) |
| deltoid | 三角肌 | 上段（肩峰）／中段／下段（上臂） × 前側／外側；亦可只選單一方向 | 11 | [OSU 11.6：肩帶與上肢肌肉](https://open.oregonstate.education/anatomy/chapter/11-6-muscles-of-the-pectoral-girdle-and-upper-limbs/) |
| biceps | 肱二頭肌 | 上段（肩）／中段／下段（肘） × 內側／中央／外側；亦可只選單一方向 | 15 | [OSU 11.6：肩帶與上肢肌肉](https://open.oregonstate.education/anatomy/chapter/11-6-muscles-of-the-pectoral-girdle-and-upper-limbs/) |
| forearmF | 前臂屈肌 | 上段（肘）／中段／下段（手腕） × 靠拇指側／中央／靠小指側；亦可只選單一方向 | 15 | [OSU 11.6：肩帶與上肢肌肉](https://open.oregonstate.education/anatomy/chapter/11-6-muscles-of-the-pectoral-girdle-and-upper-limbs/) |
| abs | 腹肌 | 肚臍上方／肚臍同高／肚臍下方 | 3 | [OSU 11.5：腹壁與胸廓肌肉](https://open.oregonstate.education/anatomy/chapter/11-5-axial-muscles-of-the-abdominal-wall-and-thorax/) |
| obliques | 腹斜肌 | 上段（肋骨下緣）／中段／下段（骨盆上緣） × 靠腹前側／身體側邊；亦可只選單一方向 | 11 | [OSU 11.5：腹壁與胸廓肌肉](https://open.oregonstate.education/anatomy/chapter/11-5-axial-muscles-of-the-abdominal-wall-and-thorax/) |
| hipFlexor | 髖前側（髖屈肌） | 髖前摺痕靠內側／髖前摺痕中央／髖前摺痕靠外側／摺痕下方、靠大腿 | 4 | [OSU 11.7：骨盆帶與下肢肌肉](https://open.oregonstate.education/anatomy/chapter/11-7-appendicular-muscles-of-the-pelvic-girdle-and-lower-limbs/) |
| quads | 股四頭肌 | 上段（髖）／中段／下段（膝） × 內側／中央／外側；亦可只選單一方向 | 15 | [OSU 11.7：骨盆帶與下肢肌肉](https://open.oregonstate.education/anatomy/chapter/11-7-appendicular-muscles-of-the-pelvic-girdle-and-lower-limbs/) |
| adductors | 大腿內側 | 上段（鼠蹊）／中段／下段（膝內側） × 偏前側／內側面／偏後側；亦可只選單一方向 | 15 | [OSU 11.7：骨盆帶與下肢肌肉](https://open.oregonstate.education/anatomy/chapter/11-7-appendicular-muscles-of-the-pelvic-girdle-and-lower-limbs/) |
| itBand | 大腿外側（髂脛束附近） | 上段（髖外側）／中段／下段（膝外側） | 3 | [OSU 11.7：骨盆帶與下肢肌肉](https://open.oregonstate.education/anatomy/chapter/11-7-appendicular-muscles-of-the-pelvic-girdle-and-lower-limbs/) |
| shin | 小腿前側 | 上段（膝）／中段／下段（腳踝） × 靠脛骨前緣／脛骨前緣外側；亦可只選單一方向 | 11 | [OSU 11.7：骨盆帶與下肢肌肉](https://open.oregonstate.education/anatomy/chapter/11-7-appendicular-muscles-of-the-pelvic-girdle-and-lower-limbs/) |
| rhomboid | 肩胛內側（菱形肌） | 肩胛內緣上段／肩胛內緣中段／肩胛內緣下段 | 3 | [OSU 11.6：肩帶與上肢肌肉](https://open.oregonstate.education/anatomy/chapter/11-6-muscles-of-the-pectoral-girdle-and-upper-limbs/) |
| lats | 背闊肌 | 上段（腋後）／中段／下段（腰側） × 靠背中央／靠身體側邊；亦可只選單一方向 | 11 | [OSU 11.6：肩帶與上肢肌肉](https://open.oregonstate.education/anatomy/chapter/11-6-muscles-of-the-pectoral-girdle-and-upper-limbs/) |
| erector | 脊柱兩側（豎脊肌） | 上背高度／下胸背高度／腰部高度 × 靠脊柱旁／較外側；亦可只選單一方向 | 11 | [OSU 2e 11.4：頭、頸與背部肌肉](https://open.oregonstate.education/anatomy2e/chapter/axial-muscles-head-neck-back/) |
| rearDelt | 後三角肌 | 上段（肩後上方）／中段／下段（上臂後外側） | 3 | [OSU 11.6：肩帶與上肢肌肉](https://open.oregonstate.education/anatomy/chapter/11-6-muscles-of-the-pectoral-girdle-and-upper-limbs/) |
| rotator | 肩後側（旋轉肌群） | 肩後上方／肩後中央／肩後下方／肩後靠外側 | 4 | [OSU 11.6：肩帶與上肢肌肉](https://open.oregonstate.education/anatomy/chapter/11-6-muscles-of-the-pectoral-girdle-and-upper-limbs/) |
| triceps | 肱三頭肌 | 上段（肩）／中段／下段（肘） × 內側／中央／外側；亦可只選單一方向 | 15 | [OSU 11.6：肩帶與上肢肌肉](https://open.oregonstate.education/anatomy/chapter/11-6-muscles-of-the-pectoral-girdle-and-upper-limbs/) |
| forearmE | 前臂伸肌 | 上段（肘）／中段／下段（手腕） × 靠拇指側／中央／靠小指側；亦可只選單一方向 | 15 | [OSU 11.6：肩帶與上肢肌肉](https://open.oregonstate.education/anatomy/chapter/11-6-muscles-of-the-pectoral-girdle-and-upper-limbs/) |
| gluteMax | 臀大肌 | 上段（骨盆後側）／中段／下段（臀下摺痕） × 靠臀溝／中央／靠髖外側；亦可只選單一方向 | 15 | [OSU 11.7：骨盆帶與下肢肌肉](https://open.oregonstate.education/anatomy/chapter/11-7-appendicular-muscles-of-the-pelvic-girdle-and-lower-limbs/) |
| gluteMed | 臀中肌 | 髖外側上方（靠骨盆緣）／髖外側中央／髖外側下方 | 3 | [OSU 11.7：骨盆帶與下肢肌肉](https://open.oregonstate.education/anatomy/chapter/11-7-appendicular-muscles-of-the-pelvic-girdle-and-lower-limbs/) |
| hamstrings | 腿後肌 | 上段（臀下）／中段／下段（膝後） × 內側／中央／外側；亦可只選單一方向 | 15 | [OSU 11.7：骨盆帶與下肢肌肉](https://open.oregonstate.education/anatomy/chapter/11-7-appendicular-muscles-of-the-pelvic-girdle-and-lower-limbs/) |
| calf | 小腿肌 | 上段（膝後）／中段／下段（腳跟上方） × 內側／中央／外側；亦可只選單一方向 | 15 | [OSU 11.7：骨盆帶與下肢肌肉](https://open.oregonstate.education/anatomy/chapter/11-7-appendicular-muscles-of-the-pelvic-girdle-and-lower-limbs/) |
| achilles | 腳跟後側（阿基里斯腱） | 腳跟上方／腳跟後方中央／腳跟後內側／腳跟後外側 | 4 | [OSU 11.7：骨盆帶與下肢肌肉](https://open.oregonstate.education/anatomy/chapter/11-7-appendicular-muscles-of-the-pelvic-girdle-and-lower-limbs/) |
| jNeck | 頸部 | 上段（頭底）／中段／下段（肩頸交界） × 前側／側面／後側；亦可只選單一方向 | 15 | [OSU 2e 11.4：頭、頸與背部肌肉](https://open.oregonstate.education/anatomy2e/chapter/axial-muscles-head-neck-back/) |
| jShoulder | 肩關節 | 肩前方／肩頂／肩外側／肩後方 | 4 | [OSU 9.6：特定滑液關節解剖](https://open.oregonstate.education/anatomy/chapter/9-6-anatomy-of-selected-synovial-joints/)、[OSU 11.6：肩帶與上肢肌肉](https://open.oregonstate.education/anatomy/chapter/11-6-muscles-of-the-pectoral-girdle-and-upper-limbs/) |
| jElbow | 手肘 | 肘前摺痕／肘後尖端／肘內側／肘外側 | 4 | [OSU 9.6：特定滑液關節解剖](https://open.oregonstate.education/anatomy/chapter/9-6-anatomy-of-selected-synovial-joints/)、[OSU 11.6：肩帶與上肢肌肉](https://open.oregonstate.education/anatomy/chapter/11-6-muscles-of-the-pectoral-girdle-and-upper-limbs/) |
| jWrist | 手腕 | 掌側／手背側／拇指側／小指側 | 4 | [OSU 9.6：特定滑液關節解剖](https://open.oregonstate.education/anatomy/chapter/9-6-anatomy-of-selected-synovial-joints/)、[OSU 11.6：肩帶與上肢肌肉](https://open.oregonstate.education/anatomy/chapter/11-6-muscles-of-the-pectoral-girdle-and-upper-limbs/) |
| jHand | 手 | 掌側靠拇指／手掌中央／掌側靠小指／手背／拇指／食指／中指／無名指／小指 | 9 | [OSU 11.6：肩帶與上肢肌肉](https://open.oregonstate.education/anatomy/chapter/11-6-muscles-of-the-pectoral-girdle-and-upper-limbs/) |
| jThoracic | 上背區域 | 上段（頸根下方）／中段／下段（胸背下緣） × 靠脊柱旁／靠肩胛側；亦可只選單一方向 | 11 | [OSU 2e 11.4：頭、頸與背部肌肉](https://open.oregonstate.education/anatomy2e/chapter/axial-muscles-head-neck-back/) |
| jLumbar | 下背區域 | 上段（肋骨下緣）／中段／下段（骨盆上方） × 靠脊柱旁／靠腰側；亦可只選單一方向 | 11 | [OSU 2e 11.4：頭、頸與背部肌肉](https://open.oregonstate.education/anatomy2e/chapter/axial-muscles-head-neck-back/) |
| jSI | 骨盆後側（薦髂附近） | 骨盆後側上方／骨盆後側中央／骨盆後側下方／骨盆後側偏外側 | 4 | [OSU 11.7：骨盆帶與下肢肌肉](https://open.oregonstate.education/anatomy/chapter/11-7-appendicular-muscles-of-the-pelvic-girdle-and-lower-limbs/)、[OSU 2e 11.4：頭、頸與背部肌肉](https://open.oregonstate.education/anatomy2e/chapter/axial-muscles-head-neck-back/) |
| jHip | 髖關節 | 髖前內側（鼠蹊附近）／髖前側／髖外側／髖後側 | 4 | [OSU 9.6：特定滑液關節解剖](https://open.oregonstate.education/anatomy/chapter/9-6-anatomy-of-selected-synovial-joints/)、[OSU 11.7：骨盆帶與下肢肌肉](https://open.oregonstate.education/anatomy/chapter/11-7-appendicular-muscles-of-the-pelvic-girdle-and-lower-limbs/) |
| jKnee | 膝 | 膝蓋骨前方／膝蓋骨上方／膝蓋骨下方／膝內側／膝外側／膝後方 | 6 | [OSU 9.6：特定滑液關節解剖](https://open.oregonstate.education/anatomy/chapter/9-6-anatomy-of-selected-synovial-joints/)、[OSU 11.7：骨盆帶與下肢肌肉](https://open.oregonstate.education/anatomy/chapter/11-7-appendicular-muscles-of-the-pelvic-girdle-and-lower-limbs/) |
| jAnkle | 腳踝 | 踝前側／內踝周圍／外踝周圍／踝後側 | 4 | [OSU 9.6：特定滑液關節解剖](https://open.oregonstate.education/anatomy/chapter/9-6-anatomy-of-selected-synovial-joints/)、[OSU 11.7：骨盆帶與下肢肌肉](https://open.oregonstate.education/anatomy/chapter/11-7-appendicular-muscles-of-the-pelvic-girdle-and-lower-limbs/) |
| jFoot | 足部 | 足背／腳底前掌／腳底內側足弓／腳底外側／腳底腳跟／大拇趾／其餘腳趾 | 7 | [OSU 11.7：骨盆帶與下肢肌肉](https://open.oregonstate.education/anatomy/chapter/11-7-appendicular-muscles-of-the-pelvic-girdle-and-lower-limbs/) |

## 每區語意邊界與穩定原型 ID

原型複合鍵為 `region.side:detail`，例如 `chest.R:upper-inner`。它是暫存 UI 識別碼，不可直接寫入目前的 `bodymap.v1` 或當成已定案的備份格式。

### 頸前側（scm）

只描述頸前側表面位置，不以選點確認胸鎖乳突肌或深層組織。

- `upper`：上段（耳下）（Upper (near ear)）
- `middle`：中段（Middle）
- `lower`：下段（鎖骨）（Lower (near collarbone)）

### 頸肩上側（上斜方肌）（traps）

維持既有上斜方肌範圍；不將此舊ID擴大為整片上、中、下斜方肌。

- `neck`：靠頸根（Near base of neck）
- `middle`：頸肩之間（Between neck and shoulder）
- `shoulder`：靠肩峰（Near shoulder tip）

### 胸肌（chest）

九格是主觀感覺定位，不是九塊胸肌；上／下與內／外可同時描述。

- `upper-inner`：上方・靠胸骨（Upper · Near sternum）
- `upper-central`：上方・中央寬度（Upper · Mid-width）
- `upper-outer`：上方・靠腋下（Upper · Near armpit）
- `middle-inner`：中央高度・靠胸骨（Mid-height · Near sternum）
- `middle-central`：中央高度・中央寬度（Mid-height · Mid-width）
- `middle-outer`：中央高度・靠腋下（Mid-height · Near armpit）
- `lower-inner`：下方・靠胸骨（Lower · Near sternum）
- `lower-central`：下方・中央寬度（Lower · Mid-width）
- `lower-outer`：下方・靠腋下（Lower · Near armpit）
- `row-upper`：僅上方（Upper only）
- `row-middle`：僅中央高度（Mid-height only）
- `row-lower`：僅下方（Lower only）
- `col-inner`：僅靠胸骨（Near sternum only）
- `col-central`：僅中央寬度（Mid-width only）
- `col-outer`：僅靠腋下（Near armpit only）

### 三角肌（deltoid）

後側三角肌沿用既有「後三角肌」入口，避免同一部位新增重複ID。

- `upper-front`：上段（肩峰）・前側（Upper (near shoulder tip) · Front）
- `upper-side`：上段（肩峰）・外側（Upper (near shoulder tip) · Side）
- `middle-front`：中段・前側（Middle · Front）
- `middle-side`：中段・外側（Middle · Side）
- `lower-front`：下段（上臂）・前側（Lower (near upper arm) · Front）
- `lower-side`：下段（上臂）・外側（Lower (near upper arm) · Side）
- `row-upper`：僅上段（肩峰）（Upper (near shoulder tip) only）
- `row-middle`：僅中段（Middle only）
- `row-lower`：僅下段（上臂）（Lower (near upper arm) only）
- `col-front`：僅前側（Front only）
- `col-side`：僅外側（Side only）

### 肱二頭肌（biceps）

上臂前側的體表分區，不能由內外側判定長頭或短頭。

- `upper-inner`：上段（肩）・內側（Upper (near shoulder) · Medial）
- `upper-central`：上段（肩）・中央（Upper (near shoulder) · Central）
- `upper-outer`：上段（肩）・外側（Upper (near shoulder) · Lateral）
- `middle-inner`：中段・內側（Middle · Medial）
- `middle-central`：中段・中央（Middle · Central）
- `middle-outer`：中段・外側（Middle · Lateral）
- `lower-inner`：下段（肘）・內側（Lower (near elbow) · Medial）
- `lower-central`：下段（肘）・中央（Lower (near elbow) · Central）
- `lower-outer`：下段（肘）・外側（Lower (near elbow) · Lateral）
- `row-upper`：僅上段（肩）（Upper (near shoulder) only）
- `row-middle`：僅中段（Middle only）
- `row-lower`：僅下段（肘）（Lower (near elbow) only）
- `col-inner`：僅內側（Medial only）
- `col-central`：僅中央（Central only）
- `col-outer`：僅外側（Lateral only）

### 前臂屈肌（forearmF）

以手掌朝前的解剖姿勢描述；使用拇指／小指側，避免手臂旋轉造成內外混淆。

- `upper-thumb`：上段（肘）・靠拇指側（Upper (near elbow) · Thumb side）
- `upper-central`：上段（肘）・中央（Upper (near elbow) · Central）
- `upper-little`：上段（肘）・靠小指側（Upper (near elbow) · Little-finger side）
- `middle-thumb`：中段・靠拇指側（Middle · Thumb side）
- `middle-central`：中段・中央（Middle · Central）
- `middle-little`：中段・靠小指側（Middle · Little-finger side）
- `lower-thumb`：下段（手腕）・靠拇指側（Lower (near wrist) · Thumb side）
- `lower-central`：下段（手腕）・中央（Lower (near wrist) · Central）
- `lower-little`：下段（手腕）・靠小指側（Lower (near wrist) · Little-finger side）
- `row-upper`：僅上段（肘）（Upper (near elbow) only）
- `row-middle`：僅中段（Middle only）
- `row-lower`：僅下段（手腕）（Lower (near wrist) only）
- `col-thumb`：僅靠拇指側（Thumb side only）
- `col-central`：僅中央（Central only）
- `col-little`：僅靠小指側（Little-finger side only）

### 腹肌（abs）

左右腹部各自記錄；跨身體正中線仍需另外的中央資料設計，不把左右紀錄合併。

- `upper`：肚臍上方（Above navel）
- `navel`：肚臍同高（At navel level）
- `lower`：肚臍下方（Below navel）

### 腹斜肌（obliques）

側腹體表定位，不能由表面區分腹內斜肌或腹外斜肌。

- `upper-front`：上段（肋骨下緣）・靠腹前側（Upper (near lower ribs) · Toward front）
- `upper-side`：上段（肋骨下緣）・身體側邊（Upper (near lower ribs) · Side of trunk）
- `middle-front`：中段・靠腹前側（Middle · Toward front）
- `middle-side`：中段・身體側邊（Middle · Side of trunk）
- `lower-front`：下段（骨盆上緣）・靠腹前側（Lower (near pelvic rim) · Toward front）
- `lower-side`：下段（骨盆上緣）・身體側邊（Lower (near pelvic rim) · Side of trunk）
- `row-upper`：僅上段（肋骨下緣）（Upper (near lower ribs) only）
- `row-middle`：僅中段（Middle only）
- `row-lower`：僅下段（骨盆上緣）（Lower (near pelvic rim) only）
- `col-front`：僅靠腹前側（Toward front only）
- `col-side`：僅身體側邊（Side of trunk only）

### 髖前側（髖屈肌）（hipFlexor）

是髖前側位置，不能從點選判定髂腰肌等深層肌肉。

- `crease-inner`：髖前摺痕靠內側（Inner front hip crease）
- `crease-center`：髖前摺痕中央（Center of front hip crease）
- `crease-outer`：髖前摺痕靠外側（Outer front hip crease）
- `below`：摺痕下方、靠大腿（Below crease toward thigh）

### 股四頭肌（quads）

內／中／外為大腿前側位置，不提供無法由體表辨識的股中間肌選項。

- `upper-inner`：上段（髖）・內側（Upper (near hip) · Medial）
- `upper-central`：上段（髖）・中央（Upper (near hip) · Central）
- `upper-outer`：上段（髖）・外側（Upper (near hip) · Lateral）
- `middle-inner`：中段・內側（Middle · Medial）
- `middle-central`：中段・中央（Middle · Central）
- `middle-outer`：中段・外側（Middle · Lateral）
- `lower-inner`：下段（膝）・內側（Lower (near knee) · Medial）
- `lower-central`：下段（膝）・中央（Lower (near knee) · Central）
- `lower-outer`：下段（膝）・外側（Lower (near knee) · Lateral）
- `row-upper`：僅上段（髖）（Upper (near hip) only）
- `row-middle`：僅中段（Middle only）
- `row-lower`：僅下段（膝）（Lower (near knee) only）
- `col-inner`：僅內側（Medial only）
- `col-central`：僅中央（Central only）
- `col-outer`：僅外側（Lateral only）

### 大腿內側（adductors）

不以位置確定個別內收肌或肌腱。

- `upper-front`：上段（鼠蹊）・偏前側（Upper (near groin) · Toward front）
- `upper-inner`：上段（鼠蹊）・內側面（Upper (near groin) · Inner surface）
- `upper-back`：上段（鼠蹊）・偏後側（Upper (near groin) · Toward back）
- `middle-front`：中段・偏前側（Middle · Toward front）
- `middle-inner`：中段・內側面（Middle · Inner surface）
- `middle-back`：中段・偏後側（Middle · Toward back）
- `lower-front`：下段（膝內側）・偏前側（Lower (near inner knee) · Toward front）
- `lower-inner`：下段（膝內側）・內側面（Lower (near inner knee) · Inner surface）
- `lower-back`：下段（膝內側）・偏後側（Lower (near inner knee) · Toward back）
- `row-upper`：僅上段（鼠蹊）（Upper (near groin) only）
- `row-middle`：僅中段（Middle only）
- `row-lower`：僅下段（膝內側）（Lower (near inner knee) only）
- `col-front`：僅偏前側（Toward front only）
- `col-inner`：僅內側面（Inner surface only）
- `col-back`：僅偏後側（Toward back only）

### 大腿外側（髂脛束附近）（itBand）

髂脛束是筋膜組織；此入口描述附近位置，不稱為獨立肌肉或病因。

- `upper`：上段（髖外側）（Upper (near outer hip)）
- `middle`：中段（Middle）
- `lower`：下段（膝外側）（Lower (near outer knee)）

### 小腿前側（shin）

以骨性地標描述，不把脛骨前緣誤標為肌肉。

- `upper-ridge`：上段（膝）・靠脛骨前緣（Upper (near knee) · Near shin ridge）
- `upper-outer`：上段（膝）・脛骨前緣外側（Upper (near knee) · Lateral to shin ridge）
- `middle-ridge`：中段・靠脛骨前緣（Middle · Near shin ridge）
- `middle-outer`：中段・脛骨前緣外側（Middle · Lateral to shin ridge）
- `lower-ridge`：下段（腳踝）・靠脛骨前緣（Lower (near ankle) · Near shin ridge）
- `lower-outer`：下段（腳踝）・脛骨前緣外側（Lower (near ankle) · Lateral to shin ridge）
- `row-upper`：僅上段（膝）（Upper (near knee) only）
- `row-middle`：僅中段（Middle only）
- `row-lower`：僅下段（腳踝）（Lower (near ankle) only）
- `col-ridge`：僅靠脛骨前緣（Near shin ridge only）
- `col-outer`：僅脛骨前緣外側（Lateral to shin ridge only）

### 肩胛內側（菱形肌）（rhomboid）

以肩胛內緣定位，不能判定菱形肌或覆蓋其上的斜方肌。

- `upper`：肩胛內緣上段（Upper medial scapular border）
- `middle`：肩胛內緣中段（Middle medial scapular border）
- `lower`：肩胛內緣下段（Lower medial scapular border）

### 背闊肌（lats）

以背外側的表面位置記錄。

- `upper-inner`：上段（腋後）・靠背中央（Upper (near back of armpit) · Toward center of back）
- `upper-outer`：上段（腋後）・靠身體側邊（Upper (near back of armpit) · Toward side of trunk）
- `middle-inner`：中段・靠背中央（Middle · Toward center of back）
- `middle-outer`：中段・靠身體側邊（Middle · Toward side of trunk）
- `lower-inner`：下段（腰側）・靠背中央（Lower (near side of waist) · Toward center of back）
- `lower-outer`：下段（腰側）・靠身體側邊（Lower (near side of waist) · Toward side of trunk）
- `row-upper`：僅上段（腋後）（Upper (near back of armpit) only）
- `row-middle`：僅中段（Middle only）
- `row-lower`：僅下段（腰側）（Lower (near side of waist) only）
- `col-inner`：僅靠背中央（Toward center of back only）
- `col-outer`：僅靠身體側邊（Toward side of trunk only）

### 脊柱兩側（豎脊肌）（erector）

左右脊柱旁分開；脊柱正中線不自動歸入左右肌肉。

- `upper-near`：上背高度・靠脊柱旁（Upper-back level · Near spine）
- `upper-away`：上背高度・較外側（Upper-back level · Farther from spine）
- `middle-near`：下胸背高度・靠脊柱旁（Lower-thoracic level · Near spine）
- `middle-away`：下胸背高度・較外側（Lower-thoracic level · Farther from spine）
- `lower-near`：腰部高度・靠脊柱旁（Lumbar level · Near spine）
- `lower-away`：腰部高度・較外側（Lumbar level · Farther from spine）
- `row-upper`：僅上背高度（Upper-back level only）
- `row-middle`：僅下胸背高度（Lower-thoracic level only）
- `row-lower`：僅腰部高度（Lumbar level only）
- `col-near`：僅靠脊柱旁（Near spine only）
- `col-away`：僅較外側（Farther from spine only）

### 後三角肌（rearDelt）

與前側三角肌、肩後旋轉肌群入口分開，不推論組織。

- `upper`：上段（肩後上方）（Upper (near upper back shoulder)）
- `middle`：中段（Middle）
- `lower`：下段（上臂後外側）（Lower (near back outer upper arm)）

### 肩後側（旋轉肌群）（rotator）

此處無法由表面判定棘上肌、棘下肌、小圓肌或肩胛下肌。

- `upper`：肩後上方（Upper back shoulder）
- `center`：肩後中央（Central back shoulder）
- `lower`：肩後下方（Lower back shoulder）
- `outer`：肩後靠外側（Outer back shoulder）

### 肱三頭肌（triceps）

上臂後側位置，不讓使用者從表面判定三個肌頭。

- `upper-inner`：上段（肩）・內側（Upper (near shoulder) · Medial）
- `upper-central`：上段（肩）・中央（Upper (near shoulder) · Central）
- `upper-outer`：上段（肩）・外側（Upper (near shoulder) · Lateral）
- `middle-inner`：中段・內側（Middle · Medial）
- `middle-central`：中段・中央（Middle · Central）
- `middle-outer`：中段・外側（Middle · Lateral）
- `lower-inner`：下段（肘）・內側（Lower (near elbow) · Medial）
- `lower-central`：下段（肘）・中央（Lower (near elbow) · Central）
- `lower-outer`：下段（肘）・外側（Lower (near elbow) · Lateral）
- `row-upper`：僅上段（肩）（Upper (near shoulder) only）
- `row-middle`：僅中段（Middle only）
- `row-lower`：僅下段（肘）（Lower (near elbow) only）
- `col-inner`：僅內側（Medial only）
- `col-central`：僅中央（Central only）
- `col-outer`：僅外側（Lateral only）

### 前臂伸肌（forearmE）

以手背側的前臂表面與拇指／小指地標描述。

- `upper-thumb`：上段（肘）・靠拇指側（Upper (near elbow) · Thumb side）
- `upper-central`：上段（肘）・中央（Upper (near elbow) · Central）
- `upper-little`：上段（肘）・靠小指側（Upper (near elbow) · Little-finger side）
- `middle-thumb`：中段・靠拇指側（Middle · Thumb side）
- `middle-central`：中段・中央（Middle · Central）
- `middle-little`：中段・靠小指側（Middle · Little-finger side）
- `lower-thumb`：下段（手腕）・靠拇指側（Lower (near wrist) · Thumb side）
- `lower-central`：下段（手腕）・中央（Lower (near wrist) · Central）
- `lower-little`：下段（手腕）・靠小指側（Lower (near wrist) · Little-finger side）
- `row-upper`：僅上段（肘）（Upper (near elbow) only）
- `row-middle`：僅中段（Middle only）
- `row-lower`：僅下段（手腕）（Lower (near wrist) only）
- `col-thumb`：僅靠拇指側（Thumb side only）
- `col-central`：僅中央（Central only）
- `col-little`：僅靠小指側（Little-finger side only）

### 臀大肌（gluteMax）

臀部表面九區，不以內外側確認深層梨狀肌。

- `upper-inner`：上段（骨盆後側）・靠臀溝（Upper (near back pelvis) · Near gluteal cleft）
- `upper-central`：上段（骨盆後側）・中央（Upper (near back pelvis) · Central）
- `upper-outer`：上段（骨盆後側）・靠髖外側（Upper (near back pelvis) · Toward outer hip）
- `middle-inner`：中段・靠臀溝（Middle · Near gluteal cleft）
- `middle-central`：中段・中央（Middle · Central）
- `middle-outer`：中段・靠髖外側（Middle · Toward outer hip）
- `lower-inner`：下段（臀下摺痕）・靠臀溝（Lower (near gluteal fold) · Near gluteal cleft）
- `lower-central`：下段（臀下摺痕）・中央（Lower (near gluteal fold) · Central）
- `lower-outer`：下段（臀下摺痕）・靠髖外側（Lower (near gluteal fold) · Toward outer hip）
- `row-upper`：僅上段（骨盆後側）（Upper (near back pelvis) only）
- `row-middle`：僅中段（Middle only）
- `row-lower`：僅下段（臀下摺痕）（Lower (near gluteal fold) only）
- `col-inner`：僅靠臀溝（Near gluteal cleft only）
- `col-central`：僅中央（Central only）
- `col-outer`：僅靠髖外側（Toward outer hip only）

### 臀中肌（gluteMed）

只記錄髖外上側，不能以此區分臀中肌與臀小肌。

- `upper`：髖外側上方（靠骨盆緣）（Upper outer hip near pelvic rim）
- `middle`：髖外側中央（Central outer hip）
- `lower`：髖外側下方（Lower outer hip）

### 腿後肌（hamstrings）

大腿後側分區，不用點選判定個別腿後肌或肌腱。

- `upper-inner`：上段（臀下）・內側（Upper (near gluteal fold) · Medial）
- `upper-central`：上段（臀下）・中央（Upper (near gluteal fold) · Central）
- `upper-outer`：上段（臀下）・外側（Upper (near gluteal fold) · Lateral）
- `middle-inner`：中段・內側（Middle · Medial）
- `middle-central`：中段・中央（Middle · Central）
- `middle-outer`：中段・外側（Middle · Lateral）
- `lower-inner`：下段（膝後）・內側（Lower (near back of knee) · Medial）
- `lower-central`：下段（膝後）・中央（Lower (near back of knee) · Central）
- `lower-outer`：下段（膝後）・外側（Lower (near back of knee) · Lateral）
- `row-upper`：僅上段（臀下）（Upper (near gluteal fold) only）
- `row-middle`：僅中段（Middle only）
- `row-lower`：僅下段（膝後）（Lower (near back of knee) only）
- `col-inner`：僅內側（Medial only）
- `col-central`：僅中央（Central only）
- `col-outer`：僅外側（Lateral only）

### 小腿肌（calf）

體表位置不等於腓腸肌／比目魚肌的可靠區分。

- `upper-inner`：上段（膝後）・內側（Upper (near back of knee) · Medial）
- `upper-central`：上段（膝後）・中央（Upper (near back of knee) · Central）
- `upper-outer`：上段（膝後）・外側（Upper (near back of knee) · Lateral）
- `middle-inner`：中段・內側（Middle · Medial）
- `middle-central`：中段・中央（Middle · Central）
- `middle-outer`：中段・外側（Middle · Lateral）
- `lower-inner`：下段（腳跟上方）・內側（Lower (near above heel) · Medial）
- `lower-central`：下段（腳跟上方）・中央（Lower (near above heel) · Central）
- `lower-outer`：下段（腳跟上方）・外側（Lower (near above heel) · Lateral）
- `row-upper`：僅上段（膝後）（Upper (near back of knee) only）
- `row-middle`：僅中段（Middle only）
- `row-lower`：僅下段（腳跟上方）（Lower (near above heel) only）
- `col-inner`：僅內側（Medial only）
- `col-central`：僅中央（Central only）
- `col-outer`：僅外側（Lateral only）

### 腳跟後側（阿基里斯腱）（achilles）

依腳跟地標定位，不以分區判定肌腱病變或附著處診斷。

- `above`：腳跟上方（Above heel）
- `back`：腳跟後方中央（Center back of heel）
- `inner`：腳跟後內側（Inner back of heel）
- `outer`：腳跟後外側（Outer back of heel）

### 頸部（jNeck）

左右沿用既有資料；正前／正後中央需另列未來正中線需求。

- `upper-front`：上段（頭底）・前側（Upper (near base of skull) · Front）
- `upper-side`：上段（頭底）・側面（Upper (near base of skull) · Side）
- `upper-back`：上段（頭底）・後側（Upper (near base of skull) · Back）
- `middle-front`：中段・前側（Middle · Front）
- `middle-side`：中段・側面（Middle · Side）
- `middle-back`：中段・後側（Middle · Back）
- `lower-front`：下段（肩頸交界）・前側（Lower (near neck-shoulder junction) · Front）
- `lower-side`：下段（肩頸交界）・側面（Lower (near neck-shoulder junction) · Side）
- `lower-back`：下段（肩頸交界）・後側（Lower (near neck-shoulder junction) · Back）
- `row-upper`：僅上段（頭底）（Upper (near base of skull) only）
- `row-middle`：僅中段（Middle only）
- `row-lower`：僅下段（肩頸交界）（Lower (near neck-shoulder junction) only）
- `col-front`：僅前側（Front only）
- `col-side`：僅側面（Side only）
- `col-back`：僅後側（Back only）

### 肩關節（jShoulder）

關節周圍的感覺位置，不指定關節內構造。

- `front`：肩前方（Front of shoulder）
- `top`：肩頂（Top of shoulder）
- `outer`：肩外側（Outer shoulder）
- `back`：肩後方（Back of shoulder）

### 手肘（jElbow）

依肘前後及內外側地標描述，不使用疾病名稱。

- `front`：肘前摺痕（Front elbow crease）
- `back`：肘後尖端（Back elbow tip）
- `inner`：肘內側（Inner elbow）
- `outer`：肘外側（Outer elbow）

### 手腕（jWrist）

以手掌、手背與指側地標避免旋轉姿勢混淆。

- `palm`：掌側（Palm side）
- `back`：手背側（Back side）
- `thumb`：拇指側（Thumb side）
- `little`：小指側（Little-finger side）

### 手（jHand）

手指先以整指記錄；每指關節與掌背面細分另列後續規格，不宣稱已涵蓋所有指節。

- `palm-thumb`：掌側靠拇指（Palm near thumb）
- `palm-center`：手掌中央（Center of palm）
- `palm-little`：掌側靠小指（Palm near little finger）
- `back`：手背（Back of hand）
- `thumb`：拇指（Thumb）
- `index`：食指（Index finger）
- `middle`：中指（Middle finger）
- `ring`：無名指（Ring finger）
- `little`：小指（Little finger）

### 上背區域（jThoracic）

上背區域與肌肉入口可重疊；紀錄保留各自來源，不合併或加總。

- `upper-near`：上段（頸根下方）・靠脊柱旁（Upper (near below neck base) · Near spine）
- `upper-outer`：上段（頸根下方）・靠肩胛側（Upper (near below neck base) · Toward scapula）
- `middle-near`：中段・靠脊柱旁（Middle · Near spine）
- `middle-outer`：中段・靠肩胛側（Middle · Toward scapula）
- `lower-near`：下段（胸背下緣）・靠脊柱旁（Lower (near lower thoracic back) · Near spine）
- `lower-outer`：下段（胸背下緣）・靠肩胛側（Lower (near lower thoracic back) · Toward scapula）
- `row-upper`：僅上段（頸根下方）（Upper (near below neck base) only）
- `row-middle`：僅中段（Middle only）
- `row-lower`：僅下段（胸背下緣）（Lower (near lower thoracic back) only）
- `col-near`：僅靠脊柱旁（Near spine only）
- `col-outer`：僅靠肩胛側（Toward scapula only）

### 下背區域（jLumbar）

下背左右分開，中央脊柱不自動歸入任何一側。

- `upper-near`：上段（肋骨下緣）・靠脊柱旁（Upper (near lower ribs) · Near spine）
- `upper-outer`：上段（肋骨下緣）・靠腰側（Upper (near lower ribs) · Toward flank）
- `middle-near`：中段・靠脊柱旁（Middle · Near spine）
- `middle-outer`：中段・靠腰側（Middle · Toward flank）
- `lower-near`：下段（骨盆上方）・靠脊柱旁（Lower (near above pelvis) · Near spine）
- `lower-outer`：下段（骨盆上方）・靠腰側（Lower (near above pelvis) · Toward flank）
- `row-upper`：僅上段（肋骨下緣）（Upper (near lower ribs) only）
- `row-middle`：僅中段（Middle only）
- `row-lower`：僅下段（骨盆上方）（Lower (near above pelvis) only）
- `col-near`：僅靠脊柱旁（Near spine only）
- `col-outer`：僅靠腰側（Toward flank only）

### 骨盆後側（薦髂附近）（jSI）

僅描述薦髂附近區域，不能以選點確認薦髂關節病因。

- `upper`：骨盆後側上方（Upper back pelvis）
- `middle`：骨盆後側中央（Central back pelvis）
- `lower`：骨盆後側下方（Lower back pelvis）
- `outer`：骨盆後側偏外側（Outer back pelvis）

### 髖關節（jHip）

延續髖關節大部位ID；前面圖只作入口，細部文字可描述髖後側。

- `front-inner`：髖前內側（鼠蹊附近）（Front inner hip near groin）
- `front`：髖前側（Front hip）
- `outer`：髖外側（Outer hip）
- `back`：髖後側（Back hip）

### 膝（jKnee）

這些是膝周圍位置，不以選點判定半月板、韌帶或肌腱。

- `front`：膝蓋骨前方（Front of kneecap）
- `above`：膝蓋骨上方（Above kneecap）
- `below`：膝蓋骨下方（Below kneecap）
- `inner`：膝內側（Inner knee）
- `outer`：膝外側（Outer knee）
- `back`：膝後方（Back of knee）

### 腳踝（jAnkle）

以踝部骨性地標描述；與腳跟後側入口重疊時不推論組織。

- `front`：踝前側（Front ankle）
- `inner`：內踝周圍（Around inner ankle bone）
- `outer`：外踝周圍（Around outer ankle bone）
- `back`：踝後側（Back ankle）

### 足部（jFoot）

腳底、足背與腳趾分開；不以足弓選點判定足底筋膜。

- `top`：足背（Top of foot）
- `sole-front`：腳底前掌（Ball of foot）
- `arch-inner`：腳底內側足弓（Inner arch of sole）
- `sole-outer`：腳底外側（Outer sole）
- `heel-sole`：腳底腳跟（Underside of heel）
- `big-toe`：大拇趾（Big toe）
- `lesser-toes`：其餘腳趾（Other toes）

## 來源與開放授權

查核日期：2026-10-26。

- [OSU 11.6：肩帶與上肢肌肉](https://open.oregonstate.education/anatomy/chapter/11-6-muscles-of-the-pectoral-girdle-and-upper-limbs/)：已讀取；解剖與地標參考，未驗證本原型分區。
- [OSU 11.7：骨盆帶與下肢肌肉](https://open.oregonstate.education/anatomy/chapter/11-7-appendicular-muscles-of-the-pelvic-girdle-and-lower-limbs/)：已讀取；解剖與地標參考，未驗證本原型分區。
- [OSU 11.5：腹壁與胸廓肌肉](https://open.oregonstate.education/anatomy/chapter/11-5-axial-muscles-of-the-abdominal-wall-and-thorax/)：已讀取；解剖與地標參考，未驗證本原型分區。
- [OSU 2e 11.4：頭、頸與背部肌肉](https://open.oregonstate.education/anatomy2e/chapter/axial-muscles-head-neck-back/)：已讀取；解剖與地標參考，未驗證本原型分區。
- [OSU 9.6：特定滑液關節解剖](https://open.oregonstate.education/anatomy/chapter/9-6-anatomy-of-selected-synovial-joints/)：搜尋摘要可讀；本文讀取受限，待逐項補查。
- [Physiopedia：Pectoralis major](https://www.physio-pedia.com/Pectoralis_major)：搜尋摘要可讀；本文403，僅補充胸大肌分部，不作全身分區驗證。
- [Physiopedia / Rehab My Patient：Trapezius](https://exercises.physio-pedia.com/shoulder/trapezius)：已讀取；僅補充上中下命名，不作臨床審核。

OSU 的 2019 教材頁面標示 CC BY-SA 4.0（個別內容另有標示者除外）；本原型只連結來源、用原創文字描述位置，不搬用教材圖像、段落或運動處方。若未來重用或改作教材圖像，須依指定版本與單圖授權另行處理署名及相同方式分享義務。Physiopedia 公開頁面不自動代表可任意重用圖像。胸大肌的鎖骨部／胸肋部可由其搜尋摘要交叉核對；全文此次 403，不能標成完整閱讀或物理治療師審核。網站目前人體圖沿用 repo 既有 MIT 來源，見 [THIRD-PARTY-NOTICES](../THIRD-PARTY-NOTICES.md)。

## 正式整合的資料契約

此輪不修改 `index.html`、`assets/female-map.js`、`bodymap.v1`、`bodymap.draft`、`bodymap.lang` 或 JSON／CSV。舊 37 類／74 keys、92 個繪圖位置均保留；不將原資料自動猜成某一格。

正式實作須先固定可回復的版本策略：舊紀錄顯示「整區／未細分」，新細分位置獨立保存程度；舊版程式不可因新 ID 白名單不符而拒讀整份資料。需驗證新舊 JSON 備份 round-trip、草稿、清除、儲存失敗與損壞資料保護。分享 CSV 需可辨識大部位／側別／細分，仍預設排除自由文字；趨勢不得把未記錄補成 0，不得混算整區與細分分數。正式格式設計與遷移屬後續整合範圍，不能把本原型當作已完成儲存功能。

## 驗收與證據邊界

- 全 37 類／74 左右入口均能選細分；同側多位置各自評分，左右與不同大部位互不覆蓋。
- 切換分類、前背面或語言不改既選位置與程度；預設未評分，數值範圍維持 1–10。
- 大部位圖維持既有左右／視角／重疊候選機制；圖載入失敗仍有完整清單。
- 手機 320／375／390 寬及桌機 1280，繁中／英文、淺／深色皆無水平溢出；主要可點控制至少 48px 高。
- 鍵盤可操作位置、左右與程度；沒有必須拖曳才能完成的步驟。螢幕閱讀器、真人、真機與物理治療師／教練逐項審核需分別記錄，不能以自動化代稱。

## 實作檔案與風險

本輪新增 `prototypes/detailed-locations.html`、`prototypes/detailed-locations-app.js`、`prototypes/detailed-locations.js`、`prototypes/detailed-location-image.js`、`prototypes/detailed-region-diagrams.js`、本對照表及產生器、兩個瀏覽器 QA 腳本、定位投影回歸測試與 QA 紀錄。原型 UI 風險為 Tier 1；未進行儲存遷移、治療或安全規則決策。正式 storage 與匯出整合需重新依實際變更評級。

最新證據與驗證限制見 [交付 QA](qa/detailed-location-delivery.md)。手指與腳趾等無法對應原始全身輪廓的選項僅在參考圖呈現，不偽畫成全身圖的局部解剖。

本表由 `node scripts/build-detailed-location-catalog.cjs` 產生，修改詞彙後請重建。
