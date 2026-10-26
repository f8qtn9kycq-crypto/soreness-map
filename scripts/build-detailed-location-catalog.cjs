// 由原型詞彙產生全身對照表，避免文件與選項各自維護。
const fs=require('node:fs'),path=require('node:path');
const catalog=require('../prototypes/detailed-locations.js');
const count=catalog.regions.reduce((n,r)=>n+r.options.length,0);
const refs=ids=>ids.map(id=>`[${catalog.sources[id].title}](${catalog.sources[id].url})`).join('、');
const rows=catalog.regions.map(r=>{
  const selection=r.cols?`${r.rows.map(x=>x.zh).join('／')} × ${r.cols.map(x=>x.zh).join('／')}；亦可只選單一方向`:r.options.map(x=>x.zh).join('／');
  return `| ${r.id} | ${r.zh} | ${selection} | ${r.options.length} | ${refs(r.sources)} |`;
}).join('\n');
const details=catalog.regions.map(r=>`### ${r.zh}（${r.id}）\n\n${r.context}\n\n${r.options.map(o=>`- \`${o.id}\`：${o.zh}（${o.en}）`).join('\n')}`).join('\n\n');
const doc=`# 全身痠痛位置細分對照表（互動原型）

日期：2026-10-26。原始回饋：右胸希望有內側、外側、上方、下方與中央，並對其他部位採用相同定位原則。

## 交付範圍與狀態

這是可操作的產品原型與位置詞彙提案，尚未整合正式紀錄、趨勢、匯入或匯出。涵蓋現有 37 類、74 個左右大部位；每側共有 ${count} 個細分選項，左右合計 ${count*2} 個細分位置，另每個大部位保留「整區」及「無法明確定位」。數量表示產品選項，不表示獨立肌肉、臨床定位精度或專業審核結果。

[開啟互動原型](../prototypes/detailed-locations.html)。在 repo 根目錄執行 \`python3 -m http.server 8766 --bind 127.0.0.1\`，瀏覽 \`http://127.0.0.1:8766/prototypes/detailed-locations.html\`。亦可直接開啟 HTML；所有資源均為本機相對路徑。

使用者旅程：選大部位／左右 → 依局部放大與文字選取多個細部位置 → 各位置獨立評分 → 在本頁摘要重新編輯。未操作滑桿或＋前不預填分數。再次點選已選位置會編輯並保留分數；評分後按完成。相同側別／部位的細格、列、欄、整區及無法定位互斥；替換、移除與清空可復原。

## 共通定位原則

1. 「相同指引」是每區都能細分，並不代表每區硬套相同格數。長形區域可用上中下段與地標，手腕用掌背／拇指／小指側，膝用膝蓋骨周圍與前後內外側。
2. 以使用者自己的左右為準；正面右在畫面左，背面右在畫面右。內／外側指靠近／遠離身體正中線，不是螢幕方向。
3. 胸部上中下 × 靠胸骨／中央／靠腋下是九種位置描述，不是九塊肌肉。所有雙方向格線另提供只知道其中一個方向的選項，例如「僅上方」，不要求猜測另一方向。主要畫面使用完整人體 SVG，選部位後只改變視窗並讓該部位置中，保留周圍身體作為參照。聚焦圖的細格可直接點選；文字方塊依圖形相對位置排列，左右切換時同步調整。不改動穩定的細分 ID 或編號。
4. 不把深層肌肉、肌頭、韌帶或病名當成可由表面點選確認的結果。選取資料僅表示主觀感覺位置。
5. 全身正中線及跨左右位置尚未新增；不把它偷偷歸入任一側。「中央高度／中央寬度」是選定單側區域的中央，不是身體正中線。
6. 保留原有大部位範圍：例如 \`traps\` 仍是上斜方肌附近，不擴大為整片上中下斜方肌；手指目前每指一個選項，足趾尚非逐趾／逐關節。
7. 全身圖只填入已選的細區；目前編輯的大部位以虛線輪廓表示。「整區」才填滿整區，「無法明確定位」不猜一個細格。當前視角看不到的膝後／足底等不硬畫到其他表面，改以提示與局部圖呈現。
8. 主要人體圖保留原輪廓與比例，提供「全身／聚焦所選部位／再放大」，不再使用步驟2的孤立部位圖。手掌／手背、足背／足底等無法同時從全身看見的面向，另放在預設收合的「其他視角參考」。全身細格透過原部位輪廓裁切，不能把示意分區當作專業解剖邊界。

## 全 37 類選項

下列來源提供解剖與地標參照；沒有任何一個來源被當作已驗證這組自訂格線或其手機操作精度。

| 既有大部位 ID | 部位 | 細分方式（左右各一組） | 每側數量 | 對照來源 |
|---|---|---|---:|---|
${rows}

## 每區語意邊界與穩定原型 ID

原型複合鍵為 \`region.side:detail\`，例如 \`chest.R:upper-inner\`。它是暫存 UI 識別碼，不可直接寫入目前的 \`bodymap.v1\` 或當成已定案的備份格式。

${details}

## 來源與開放授權

查核日期：2026-10-26。

${Object.values(catalog.sources).map(s=>`- [${s.title}](${s.url})：${s.status}。`).join('\n')}

OSU 的 2019 教材頁面標示 CC BY-SA 4.0（個別內容另有標示者除外）；本原型只連結來源、用原創文字描述位置，不搬用教材圖像、段落或運動處方。若未來重用或改作教材圖像，須依指定版本與單圖授權另行處理署名及相同方式分享義務。Physiopedia 公開頁面不自動代表可任意重用圖像。胸大肌的鎖骨部／胸肋部可由其搜尋摘要交叉核對；全文此次 403，不能標成完整閱讀或物理治療師審核。網站目前人體圖沿用 repo 既有 MIT 來源，見 [THIRD-PARTY-NOTICES](../THIRD-PARTY-NOTICES.md)。

## 正式整合的資料契約

此輪不修改 \`index.html\`、\`assets/female-map.js\`、\`bodymap.v1\`、\`bodymap.draft\`、\`bodymap.lang\` 或 JSON／CSV。舊 37 類／74 keys、92 個繪圖位置均保留；不將原資料自動猜成某一格。

正式實作須先固定可回復的版本策略：舊紀錄顯示「整區／未細分」，新細分位置獨立保存程度；舊版程式不可因新 ID 白名單不符而拒讀整份資料。需驗證新舊 JSON 備份 round-trip、草稿、清除、儲存失敗與損壞資料保護。分享 CSV 需可辨識大部位／側別／細分，仍預設排除自由文字；趨勢不得把未記錄補成 0，不得混算整區與細分分數。正式格式設計與遷移屬後續整合範圍，不能把本原型當作已完成儲存功能。

## 驗收與證據邊界

- 全 37 類／74 左右入口均能選細分；同側多位置各自評分，左右與不同大部位互不覆蓋。
- 切換分類、前背面或語言不改既選位置與程度；預設未評分，數值範圍維持 1–10。
- 大部位圖維持既有左右／視角／重疊候選機制；圖載入失敗仍有完整清單。
- 手機 320／375／390 寬及桌機 1280，繁中／英文、淺／深色皆無水平溢出；主要可點控制至少 48px 高。
- 鍵盤可操作位置、左右與程度；沒有必須拖曳才能完成的步驟。螢幕閱讀器、真人、真機與物理治療師／教練逐項審核需分別記錄，不能以自動化代稱。

## 實作檔案與風險

本輪新增 \`prototypes/detailed-locations.html\`、\`prototypes/detailed-locations-app.js\`、\`prototypes/detailed-locations.js\`、\`prototypes/detailed-location-image.js\`、\`prototypes/detailed-region-diagrams.js\`、本對照表及產生器、兩個瀏覽器 QA 腳本、定位投影回歸測試與 QA 紀錄。原型 UI 風險為 Tier 1；未進行儲存遷移、治療或安全規則決策。正式 storage 與匯出整合需重新依實際變更評級。

最新證據與驗證限制見 [交付 QA](qa/detailed-location-delivery.md)。手指與腳趾等無法對應原始全身輪廓的選項僅在參考圖呈現，不偽畫成全身圖的局部解剖。

本表由 \`node scripts/build-detailed-location-catalog.cjs\` 產生，修改詞彙後請重建。
`;
fs.writeFileSync(path.join(__dirname,'../docs/detailed-location-catalog.md'),doc);
console.log(`已產生 37 類／${count*2} 個左右細分位置的對照表。`);
