# 已確認 Demo 的正式整合

2026-10-29；Tier 3：顯示投影及位置分類，沒有資料遷移。使用者確認簡化 Demo 並授權審查、修正與通過後合併／Vercel production。

- 記錄僅正背面全身圖，不再提供腿部單獨入口；縮放仍保留全身周邊。
- 總結與已存歷史均顯示全身正背面筆畫；投影使用917列原生SVG輪廓幾何表，source band與全身輪廓雙重裁切；新 F/B 路徑與筆寬保持原值。舊腿面以已確認 Demo 的高度錨點與原圖輪廓投影，明示為位置示意。只是顯示副本，原始 points/view/width/0/null 不改寫；評分修改仍更新原筆畫。
- 總結筆畫可點擊／Enter／Space返回全身圖修改；各筆位置、程度與附近肌肉／關節分開呈現。
- 名稱範圍沿用確認 Demo：大腿內側→內收肌群，小腿外側→腓骨肌群，膝／踝→關節區域。其他位置不猜肌肉，不聲稱辨識所有組織。
- 全身正面小腿以同側該高度的實際輪廓中線描述內外側，8圖形單位中線留白，筆刷邊緣跨中線不標內外；這是圖形定位規則，不是臨床驗證。
- 正式站不帶 Demo 選單、範例、記憶體替代儲存或清空操作。保留必要舊資料、備份與選填修正入口於次要收合控制。

## 解剖依據與證據界線

[OpenStax 11.6 下肢肌肉](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-6-appendicular-muscles-of-the-pelvic-girdle-and-lower-limbs)：大腿內側內收肌群與小腿外側腓骨肌群的區室名稱；[OpenStax 9.6 滑液關節](https://openstax.org/books/anatomy-and-physiology-2e/pages/9-6-anatomy-of-selected-synovial-joints)：膝踝關節。僅參考文字命名，沒有搬用圖像。表面筆畫不能確認疼痛組織或病因。

## 驗證

Node資料、位置、趨勢及新投影測試；雙瀏覽器auto-summary、freehand-browser、gesture、slider-tabs、trend-overview。覆蓋全身筆形顏色寬度一致、舊側面不改原值、鍵盤與修改、保存重開、0分、備份匯入與拒寫、正背面、小螢幕雙語深淺色。結果與精確head記錄在PR。

委派：指定sol/high／實際模型NOT VERIFIED，依既定Demo實作純投影與附近名稱模組，父代理檢查差異與測試；獨立Astra/high／實際模型NOT VERIFIED審查整合。無遞迴委派。真人、真機iPhone、讀屏與專家位置對照 NOT VERIFIED。

獨立審查修正：舊RO膝部160,500有效圓點曾被裁光，以及160,200→280,200原圖外尾段重新顯示。改為同高度實際腿部區間投影、保留原source裁切遮罩，並新增projection-boundary-qa雙引擎原生點擊／四側面／膝踝及體外尾段測試。生成表附outline SHA256，CI重建比對以防陳舊。

WebKit原生點擊測試另發現浮點中心被MouseEvent截斷到整數像素，極細單點難命中；新增同一裁切範圍內的透明summary-hit，不放大可見筆畫。清單44px按鈕保留每筆的明確替代入口。
