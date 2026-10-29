# 筆畫附近的解剖名稱與來源

本次以 `soreness-map` 的 `f1bf683e0ef7ba272ce40c765205821f71bb0c93` 為基底；名稱分析使用既有 `FEMALE_MAP` 的 37 類位置與原生 SVG 填色命中。名稱用來補充「圖上這段筆畫附近有哪些肌肉／關節」，不判定痠痛來源、受傷組織、疾病或治療方式。位置與分數仍由原始筆畫保留。

`docs/female-map-locations.md` 已記錄圖形來源、原創橢圓及定位限制。新增的文字來源只能支持解剖名稱與大略位置，不能把既有體表示意轉成精確組織邊界。特別是髖前側、肩胛內側、旋轉肌袖肌群、臀中肌與關節熱區，均維持「附近」語意。沒有臨床定位驗證。

## 查核來源

以下均為 OpenStax 原出版者的《Anatomy and Physiology 2e》頁面，於 2026-10-29 查核；只用來核對文字名稱，不下載、搬用或改繪書中圖片。中文為本專案臺灣繁體中文名稱整理，來源原文是英文。

- S1：[11.3 頭頸與背部軸向肌肉](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-3-axial-muscles-of-the-head-neck-and-back)：頸部的 sternocleidomastoid；背部 erector spinae 是肌群。
- S2：[11.4 腹壁與胸廓軸向肌肉](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-4-axial-muscles-of-the-abdominal-wall-and-thorax)：rectus abdominis、腹部 internal/external obliques。
- S3：[11.5 肩帶與上肢肌肉](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-5-muscles-of-the-pectoral-girdle-and-upper-limbs)：trapezius、rhomboids、pectoralis major、latissimus dorsi、deltoid、biceps/triceps，以及前臂屈／伸肌群。旋轉肌袖由數個肌肉及其肌腱共同構成，因此不由一個肩後側筆畫猜定單一肌肉。
- S4：[11.6 骨盆帶與下肢肌肉](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-6-appendicular-muscles-of-the-pelvic-girdle-and-lower-limbs)：髖屈肌、內收肌、股四頭肌、腿後肌、臀肌、脛前肌及小腿後側肌群；同頁區分 iliotibial tract 與 calcaneal/Achilles tendon。小腿後側不縮成腓腸肌單一名稱，髖前側也不縮成髂腰肌。
- S5：[9.6 特定滑液關節的解剖](https://openstax.org/books/anatomy-and-physiology-2e/pages/9-6-anatomy-of-selected-synovial-joints)：肩、肘、髖、膝、踝與脊椎關節；頸／胸／腰椎只列區域性的關節集合，不猜某一椎節。
- S6：[9.4 滑液關節](https://openstax.org/books/anatomy-and-physiology-2e/pages/9-4-synovial-joints)：手腕、手部與足部含不同關節；原圖熱區不足以指定某一指節或足部關節。
- S7：[8.3 骨盆帶與骨盆](https://openstax.org/books/anatomy-and-physiology-2e/pages/8-3-the-pelvic-girdle-and-pelvis)：薦髂關節的名稱與所在區域。

## 37 類對應

左右一律取既有位置的 `side`，不靠畫面左右猜測。名稱本身不含左右前綴；呼叫端依語系組字。正面 `deltoid` 與背面 `rearDelt` 共用 canonical ID `deltoid`，不拆前／中／後肌束。各側仍是獨立項目。

| 既有 ID | 類別與顯示名稱 | 文字依據／粒度限制 |
|---|---|---|
| `scm` | 肌肉：胸鎖乳突肌 | S1；頸前側附近，非全部頸部組織 |
| `traps` | 肌肉：斜方肌 | S3；不拆上／中／下束 |
| `chest` | 肌肉：胸大肌 | S3；不代表深層胸肌 |
| `deltoid` | 肌肉：三角肌 | S3；不拆肌束 |
| `biceps` | 肌肉：肱二頭肌 | S3；不拆長／短頭 |
| `forearmF` | 肌群：前臂屈肌群 | S3；不猜個別手腕或手指屈肌 |
| `abs` | 肌肉：腹直肌 | S2；不拆腹肌段 |
| `obliques` | 肌群：腹斜肌群 | S2；不猜內／外層 |
| `hipFlexor` | 肌群：髖屈肌群 | S4；原創髖前側體表示意，不指定深層單肌 |
| `quads` | 肌群：股四頭肌 | S4；不拆四個組成肌 |
| `adductors` | 肌群：大腿內收肌群 | S4；不拆單肌 |
| `itBand` | 區域 fallback | S4；髂脛束不是肌肉，保留大腿外側位置 |
| `shin` | 肌肉：脛前肌 | S4；既有 F:tibialis 路徑附近 |
| `rhomboid` | 肌群：菱形肌群 | S3；原創肩胛內側範圍，不拆大／小菱形肌 |
| `lats` | 肌肉：背闊肌 | S3；沿用既有背部路徑 |
| `erector` | 肌群：豎脊肌群 | S1；不拆細部或椎節 |
| `rearDelt` | 肌肉：三角肌 | S3；canonical ID 為 `deltoid` |
| `rotator` | 肌群：旋轉肌袖肌群 | S3；原創肩後側範圍，不指定肌腱或單肌 |
| `triceps` | 肌肉：肱三頭肌 | S3；不拆肌頭 |
| `forearmE` | 肌群：前臂伸肌群 | S3；不猜個別伸肌 |
| `gluteMax` | 肌肉：臀大肌 | S4；沿用既有臀部路徑 |
| `gluteMed` | 肌肉：臀中肌 | S4；原創體表示意，只表示附近 |
| `hamstrings` | 肌群：腿後肌群 | S4；不拆單肌 |
| `calf` | 肌群：小腿後側肌群 | S4；不縮成腓腸肌或比目魚肌單肌 |
| `achilles` | 區域 fallback | S4；阿基里斯腱是肌腱，保留腳跟後側位置 |
| `jNeck` | 關節：頸椎關節 | S5；區域集合，不指定椎節 |
| `jShoulder` | 關節：肩關節 | S5；不猜更細關節構造 |
| `jElbow` | 關節：肘關節 | S5 |
| `jWrist` | 關節：腕關節 | S6；不指定腕骨間關節 |
| `jHand` | 關節：手部關節 | S6；區域集合，不指定手指或指節 |
| `jThoracic` | 關節：胸椎關節 | S5；區域集合，不指定椎節 |
| `jLumbar` | 關節：腰椎關節 | S5；區域集合，不指定椎節 |
| `jSI` | 關節：薦髂關節 | S7；骨盆後側附近 |
| `jHip` | 關節：髖關節 | S5 |
| `jKnee` | 關節：膝關節 | S5 |
| `jAnkle` | 關節：踝關節 | S5 |
| `jFoot` | 關節：足部關節 | S6；區域集合，不指定足趾或單一關節 |

## 只讀分析與退回規則

`FREEHAND_ANATOMY.analyze(stroke, art, map, hit)` 回傳 `{muscles:[], joints:[]}`；每項為 `{id, side, zh, en}`。`art.inside(x,y)` 與 `hit(location,x,y)` 由呼叫端以相同原始視角的 SVG 原生命中提供。模組不依賴 DOM、localStorage 或目前畫面視角，不讀取既存 `part`／`location` 來臆測名稱，也不修改輸入。

- 只分析筆畫原始 `F`／`B`；腿部側面與投影不作為肌肉邊界。側面若要顯示位置，沿用既有區域 fallback。
- 把正規化座標轉回原圖座標，以折線弧長均勻取樣；短線至少17個中心、最多80個，單點維持1個中心。共線加點、事件密度與停留重複點不增加權重。
- 有筆寬時，每個中心加上半徑 0.5 的 4 點與半徑 0.85 的 8 點，共 13 點近似筆刷涵蓋；只計入原圖輪廓內樣本。這是有界的顯示取樣，並非面積積分或臨床測量。
- 面積證據：至少一半筆刷樣本在原圖輪廓內，且至少60%體內樣本命中已知位置。中心線證據：至少80%均勻中心樣本在輪廓內，且其中至少80%命中已知位置。至少一種證據成立才可提供名稱；窄部位可由明確中心線支持，避免寬筆刷的體外部分造成漏判。
- 每個canonical名稱／側別需在面積證據成立時涵蓋至少15%體內樣本且至少3個樣本，或在中心線證據成立時涵蓋至少30%體內中心樣本且至少3個中心樣本；總樣本少於3時採全部樣本數為下限。同名重疊路徑在同一樣本只計一次。
- 多區符合上述規則就保留多項，左右分列。多於6個候選時先只保留中心線支持者，仍多於6個則回傳空名稱；弧長大於1440原圖單位、未知視角、無覆蓋或不合法輸入也回傳空名稱，由呼叫端保留位置。
- 上述數字是保守的產品顯示規則，沒有臨床信心值意義。名稱只在呈現時重新計算，不新增儲存欄位、不遷移歷史資料、不改分數。

## 驗證與委派記錄

`node --test tests/freehand-anatomy.test.cjs`：13/13 通過。涵蓋 37 類與左右映射、UMD 無 DOM／storage 依賴、事件密度／順序、跨區域／側別、筆刷邊緣、輪廓外、未知／巨大範圍、原始資料不變、正背三角肌 canonical ID 與工作量上限。這些是模組測試；原生 SVG 與使用者畫面整合由主代理另行記錄，不能由矩形 fixture 測試推定臨床定位或真機結果。

委派：指定 `gpt-6-astra`／`high`，可驗證的實際模型 `NOT VERIFIED`；repo／子任務決策風險為 Tier 3 解剖名稱決策。範圍只含本來源文件、純分析模組與單元測試。選模理由為需要區分單肌、肌群、關節區域及非肌肉組織。父代理驗證與整合證據由主交付紀錄提供；醫療專家／實體裝置驗證 `NOT VERIFIED`。

## 介面整合驗收

主代理以附掛於body的獨立SVG做原生命中（不依賴目前正背面），並於finally清理。採筆畫物件WeakMap快取、path bounding box快篩；快取只含幾何衍生資訊，手動部位優先顯示，清除後即恢復幾何位置，不需重新載入。舊source RI/RO/LI/LO不以顯示投影推定新名稱。

`anatomy-labels-qa.cjs` Chromium／WebKit驗證：正背面肩與膝文字、畫完清單與總結、舊筆畫JSON逐值不寫回、0分保留、手動部位→清除的即時/重開一致、手機寬度與英文、鍵盤返回，以及臨時SVG清理。既有default7、自由塗畫/備份、手勢、滑桿、側面投影與趨勢回歸通過。獨立審查發現並修正一項P1快取顯示不一致；exact head結論以PR為準。真人、實體iPhone/Pixel及專家逐項臨床定位NOT VERIFIED。

主要區域矩陣、窄部位漏判修正、三類專業機構公開資料與真人專家待驗狀態，見[專業資料與覆蓋稽核](professional-coverage-audit.md)。中心線與面積門檻僅是工程規則，沒有臨床效度背書。
