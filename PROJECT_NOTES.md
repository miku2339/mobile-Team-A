# Project Notes — Melo Starter v0.1

## 修改內容

- 建立 Expo SDK 57 / React Native 0.86 TypeScript starter
- 完成 Mental Wellness 健康溝通核心流程
- 加入虛擬寵物 Melo、呼吸動畫及 Calm Stars
- 加入 OpenAI、阿里雲百鍊、智譜 BigModel、自訂相容服務設定
- 加入用戶自行輸入 API key、Base URL、Model ID 的 BYOK 設定頁
- 加入 native SecureStore 及 Web session-only storage
- 加入離線 fallback、Copy、Share、多語言輸出
- 加入簡單安全 guard 及非診斷聲明

## Demo readiness update

- 修正 Web 缺少 `react-dom`／`react-native-web`，現可輸出 Web、iOS、Android bundles
- 加入英文、繁體中文、簡體中文完整介面切換及持久保存；改寫輸出另保留廣東話
- 加入 Before／After、Calm Star 即時回饋和更準確的 demo 文案
- 擴充安全字詞、AI 輸出 guard、8 秒 timeout、provider URL 驗證及損壞設定 schema 驗證
- 離線 fallback 會保留固定小組項目示例的核心問題與具體下一步
- Provider 設定改為純 BYOK：Melo 不提供模型服務、key、額度或預設 Model ID
- 加入 OpenAI、Google AI Studio、DeepSeek、Kimi、MiniMax、智譜及自訂服務；阿里雲採 Plan + 地區／伺服器兩層選單
- 阿里雲支援按量付費、Coding Plan、Token Plan endpoint，並顯示套餐官方使用限制
- Provider 設定升級至 v2，避免恢復舊預設模型；重複點擊已選項不再清除 key／model，結果亦保留實際請求供應商
- 設定頁每次重開都會隱藏 API key；安全 guard 補上更多直接風險表達
- 加入 Reduce Motion、窄屏按鈕堆疊、較清楚的互動邊界與 600px 內容上限
- 改用跨平台 Safe Area 容器，避免 Android 狀態列與主介面重疊
- 加入自動化回歸測試、Expo Doctor／三平台 export CI、完整 Pitch 與 UI design system

## Safari Web Provider update — 2026-08-05

- 真實 Safari Web 直接呼叫阿里雲百鍊時，CORS preflight 在正式 Chat Completions POST 發出前收到 HTTP 401；這是瀏覽器跨域邊界，不是離線 fallback 或模型每次產生相同內容
- 加入只供 Web 使用的同機 loopback proxy；`npm run web` 現在同時啟動 Expo Web 與 proxy，`npm run web:proxy` 可單獨啟動 proxy，`npm run web:expo` 則只啟動 Expo Web
- Native iOS／Android 保留 direct-to-provider 路徑，不經此 Web proxy
- Proxy 預設綁定 `127.0.0.1`，只接受 loopback browser origin，並只轉送通過現有 endpoint allowlist 的 Provider／Base URL 組合
- Proxy 不持久保存或記錄 API key、Authorization header、訊息、圖片或 request body；操作 log 只顯示 Provider ID、upstream host、HTTP status 與耗時
- 真實 Safari 經 loopback proxy 使用已授權阿里雲帳戶，成功取得兩段不相同的 `qwen3.7-plus` 回覆；每則回覆均保留準確模型標示
- 已修正寬屏 Safari Web 顯示特別長真實回覆時的 message overflow；在 1440 × 900、390 × 844 及 1180 × 820 重測後，長回覆、模型標籤與輸入框均保持在 viewport 內
- Full suite passed：62／62 tests

## 修改原因

比賽要求 functional mobile / web prototype，Technical Implementation、Impact、UX 佔主要分數。單純 AI 改寫器容易顯得普通，因此加入虛擬寵物作情緒調節的引導角色；但功能仍控制在一個下午可完成的範圍。

## 目的

- 讓評委在 1 分鐘內理解問題和解決方案
- 讓核心流程即使沒有 API 或網絡亦可演示
- 讓 AI provider 不被單一平台綁定
- 以寵物提升參與感，但避免 streak、飢餓、死亡等 guilt-based mechanics
- 清楚界定產品不是心理治療或診斷工具

## 影響

正面影響：

- Demo 流程清晰，具有前後對比
- React Native 真機演示比普通網頁更有產品感
- 多 provider BYOK 可展示技術彈性，但不暗示 Melo 提供任何模型服務
- Offline fallback 降低現場翻車風險
- 虛擬寵物令產品更有記憶點及 UX 亮點

限制：

- Native 仍是直接 client-to-provider；Web 使用本機 loopback proxy。兩者都只適合 prototype，正式產品不應直接照搬
- Safari 直連阿里雲會在 CORS preflight 收到 HTTP 401；目前 proxy 只解決本機 Web 開發／演示，不是可公開部署的 backend
- 安全 guard 只是關鍵字規則，不是可靠的危機識別模型
- 寵物成長目前只有星星和三個簡單配件階段
- 已加入核心純邏輯測試；仍未加入 backend、帳戶、資料庫或分析儀表板
- Coding Plan／Token Plan 使用各自專屬 key 與地區 endpoint；Melo 只做類別配對，實際帳戶授權仍由阿里雲驗證
- 真實 Provider 已在 Simulator 與 Safari Web 驗證；仍需在場地網絡以組員實體手機完成 Expo Go 的完整設定到結果可見確認
