# 精細定位原型交付驗證

日期：2026-10-26。Repo：`f8qtn9kycq-crypto/soreness-map`。風險：Tier 1（獨立原型 UX）；沒有修改診斷、訓練、安全規則或正式資料格式。

## 範圍

新增 `/prototypes/detailed-locations.html` 試用頁與 README 入口。保留完整人體圖，選部位後聚焦並置中；細分圖文依相對位置排列，左右同步。全身圖只高亮選取的體表細格。全身原圖無可用手指／腳趾輪廓時，改用參考圖，不偽造精確解剖。

再次選取同位置會編輯並保留分數。明確區分待完成及已完成；評分後須按完成。手機評分面板固定於底部，可繼續選取或移除。相同側別、部位使用同一種定位精度；改精度、移除及清空可立即復原。開始評分或完成後不保留過期復原快照。

原型只留本次頁面記憶體；重新整理會清空。正式首頁、localStorage、JSON、CSV、歷史及來源人體圖未變更。參考資料只供方向與地標，格線不是臨床驗證的肌肉邊界；不是治療師或教練正式審核。

## 本機證據

- `node tests/phase1.test.cjs`：12 組既有資料與記錄契約通過。
- `node tests/female-map.test.cjs`：既有 37 類／74 keys、視角、左右與資料契約通過。
- `node --test tests/detailed-selection-state.test.cjs tests/detail-layout-projection.test.cjs`：8 個 Node 測試通過，含全身圖文配置、投影、精度互斥、評分、完成及復原。
- `scripts/detail-body-focus-qa.cjs`：Chromium 148.0.7778.96 與 WebKit 26.4 各通過 74 個聚焦部位及 688 組版面；含繁中／英文、淺／深色、手機與桌面、圖文同步、鍵盤與縮放保留選取。
- `scripts/detailed-location-browser-qa.cjs`：Chromium／WebKit，390×844：評分面板於可見視窗內、重選保留 3/10、完成與待完成計數、精度替換／移除／清空及復原、手指與足底參考圖、不偽投影、正式 storage sentinel 保留、無水平溢出或 JS 錯誤。

瀏覽器重跑：先於根目錄啟動靜態 HTTP server（預設 8766），安裝 Playwright 瀏覽器後執行上述兩支腳本。可用 `PLAYWRIGHT_MODULE_PATH` 指定既有 Playwright 模組、`PROTOTYPE_URL` 指定測試頁。沒有新增產品套件依賴或建置步驟。

CI 新增狀態／配置測試與目錄重建一致性檢查；CI、PR exact head 與部署觀察記錄於 PR，不能以本機測試代替。

## 人工驗收步驟與界線

1. 開啟試用頁，選右胸：完整人體聚焦，靠胸骨與靠腋下文字和圖對應；切到左側排列同步。
2. 選上方靠胸骨、評 3、按完成，再次選取：保留 3，沒有消失；摘要顯示已完成。
3. 改「僅上方」後立即復原：回到原細格與 3 分；移除／清空亦可復原。
4. 選手指或腳底：開啟參考圖，全身圖不畫成整手、整腳或錯誤足背位置。
5. 重新整理：原型清空，正式首頁歷史與備份功能不受影響。

真人、實體 iPhone Safari、螢幕閱讀器、物理治療師／教練逐項位置審核：**NOT VERIFIED**。本機 WebKit 不等於真機證據。

## 委派紀錄

- 指定 `gpt-6.1-sol / medium`；實際模型 NOT VERIFIED。範圍：純記憶體狀態模型與測試，子任務風險低、repo UX Tier 1。結果 7/7；父代理整合並以真實瀏覽器驗證，無模型重做。
- 指定 `gpt-6.1-sol / high`；實際模型 NOT VERIFIED。範圍：獨立唯讀審查 UI、狀態與契約；結果及父代理修正以 PR exact-head 審查紀錄為準。
