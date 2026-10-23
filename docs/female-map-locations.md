# 女性人體圖與既有位置對照

固定來源：`8ed39ac2ae9cb46fb79d77eedec7e5b029a75174`。37類／74左右key保持不變；依原本可見性共92個位置（正面44、背面48）。F/B共用key仍為同一觀察，不增加前後維度或改寫歷史。

左右一律是使用者本人的左右。來源左右欄位表示畫面位置，故正面來源left→本人R、right→本人L；背面來源left→本人L、right→本人R。不因圖像換成女性就猜測或更改歷史紀錄。

來源肌群碎片合併成既有位置；自繪橢圓只表示體表附近。髖前側、肩後側／旋轉肌群、肩胛內側、臀中肌、髂脛束附近、阿基里斯腱及脊柱相關位置均不主張精確組織邊界。中央或更細的位置仍使用備註。未經真人物理治療師／教練定位驗收。

| 穩定ID | 顯示名稱 | 可見面 | 路徑依據 |
|---|---|---|---|
| `scm` | 頸前側 | F | F:neck |
| `traps` | 頸肩上側（上斜方肌） | F | F:trapezius |
| `chest` | 胸肌 | F | F:chest |
| `deltoid` | 三角肌 | F | F:deltoids |
| `biceps` | 肱二頭肌 | F | F:biceps |
| `forearmF` | 前臂屈肌 | F | F:forearm |
| `abs` | 腹肌 | F | F:abs |
| `obliques` | 腹斜肌 | F | F:obliques |
| `hipFlexor` | 髖前側（髖屈肌） | F | F:自繪體表示意 |
| `quads` | 股四頭肌 | F | F:quadriceps |
| `adductors` | 大腿內側 | F | F:adductors |
| `itBand` | 大腿外側（髂脛束附近） | F | F:自繪體表示意 |
| `shin` | 小腿前側 | F | F:tibialis |
| `traps` | 頸肩上側（上斜方肌） | B | B:trapezius |
| `rhomboid` | 肩胛內側（菱形肌） | B | B:自繪體表示意 |
| `lats` | 背闊肌 | B | B:upper-back |
| `erector` | 脊柱兩側（豎脊肌） | B | B:lower-back |
| `rearDelt` | 後三角肌 | B | B:deltoids |
| `rotator` | 肩後側（旋轉肌群） | B | B:自繪體表示意 |
| `triceps` | 肱三頭肌 | B | B:triceps |
| `forearmE` | 前臂伸肌 | B | B:forearm |
| `gluteMax` | 臀大肌 | B | B:gluteal |
| `gluteMed` | 臀中肌 | B | B:自繪體表示意 |
| `hamstrings` | 腿後肌 | B | B:hamstring |
| `calf` | 小腿肌 | B | B:calves |
| `achilles` | 腳跟後側（阿基里斯腱） | B | B:自繪體表示意 |
| `jNeck` | 頸部 | FB | F:自繪體表示意 / B:自繪體表示意 |
| `jShoulder` | 肩關節 | FB | F:自繪體表示意 / B:自繪體表示意 |
| `jElbow` | 手肘 | FB | F:自繪體表示意 / B:自繪體表示意 |
| `jWrist` | 手腕 | FB | F:自繪體表示意 / B:自繪體表示意 |
| `jHand` | 手 | FB | F:自繪體表示意 / B:自繪體表示意 |
| `jThoracic` | 上背區域 | B | B:自繪體表示意 |
| `jLumbar` | 下背區域 | B | B:自繪體表示意 |
| `jSI` | 骨盆後側（薦髂附近） | B | B:自繪體表示意 |
| `jHip` | 髖關節 | F | F:自繪體表示意 |
| `jKnee` | 膝 | FB | F:自繪體表示意 / B:自繪體表示意 |
| `jAnkle` | 腳踝 | FB | F:自繪體表示意 / B:自繪體表示意 |
| `jFoot` | 足部 | FB | F:自繪體表示意 / B:自繪體表示意 |

## 可重現來源與限制

`python3 scripts/build-female-map.py` 從已固定的來源資產、舊位置定義與標示點修正檔產生圖形；不需網路。`scripts/source/label-points.json` 是瀏覽器原生 SVG 命中驗證後的分數標示點，只改顯示位置，不代表專業臨床校準。原生驗證亦不能證明位置的醫療正確性。

37個舊位置全部保留且各側可用文字清單選取。細碎或相疊熱區會提供候選，避免由頂層圖形任意決定。C版頭頸盤髮為裝飾，不參與點選命中，頸肩高亮放在其上方。圖形來源MIT授權見 `THIRD-PARTY-NOTICES.md`。
