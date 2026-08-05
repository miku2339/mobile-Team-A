# Melo — Pause. Breathe. Say it better.

[English README](README.md)

一個以 **Mental Wellness + Healthy Communication** 為核心的 React Native / Expo 比賽原型。

Melo 是一隻不會以飢餓、死亡或連續簽到向用戶施壓的虛擬寵物。它陪用戶完成一個短暫 pause，再把原本情緒化的訊息改寫成較冷靜、清楚和可執行的表達。

## 已完成的功能

- 四段主要流程：原訊息 → 情緒與對象 → 呼吸 pause → 改寫結果
- 虛擬寵物 Melo，會按流程改變表情與呼吸動畫
- 類似 ChatGPT App 訊息形式的 Melo Chat，使用 Melo 自己的陪伴人格與真實已設定 Provider 回覆
- 每則成功的 AI 回覆都保存當時實際使用的 Provider 與模型；Chat 標題列顯示目前服務，每則回覆下只以安靜小字顯示準確 Model ID，之後更換設定也不會誤改舊歸屬
- Chat 最近 24 則訊息只保存在目前裝置／瀏覽器；每輪最多只把最近 8 則對話連同系統指示送到 Provider
- 圖片輸入預設關閉；只有用戶確認目前準確 Model ID 支援圖片後才可手動啟用
- 模型可以選擇 Melo 表情，但只限 `calm`、`listening`、`thinking`、`encouraging`、`concerned` 五種由 App 控制的狀態
- Calm Stars：完成一次健康溝通流程即可獲得星星
- 無 streak 懲罰；寵物不會因為用戶沒有打開 App 而生病或難過
- 內建 OpenAI、Google AI Studio、阿里雲百鍊、DeepSeek、Kimi、MiniMax、Z.ai BigModel 及自訂 OpenAI-compatible 連線預設；真實帳戶相容性仍需逐一驗證
- Melo 不提供模型服務、key、額度或已啟用的預設 Provider／模型；用戶自行選擇並填寫 API key、Base URL 和準確的 Model ID
- 阿里雲提供兩層選單：Plan（按量／Coding Plan／Token Plan）及該 Plan 支援的地區／伺服器
- 介面可在繁體中文、簡體中文、English 之間即時切換並保存
- iOS / Android 使用 Expo SecureStore 儲存設定；Web 只保留在目前瀏覽器分頁
- Guided Rewrite 在 API 不可用或未填 key 時會使用標示清楚的離線改寫；Melo Chat 不會偽造離線模型回覆
- 只有收到可讀取的模型回覆才會標示為 AI 結果；離線模板不會冒充 Provider 回覆
- Provider 最長等待 30 秒，並分開顯示逾時、網絡、HTTP、回覆格式及本機設定錯誤
- 簡單危機字詞 guard：偵測到明顯自傷／傷人語句時停止一般改寫，改為建議尋求真實世界支援
- Before／After、Copy 可見回饋、Share，以及英文／繁中／簡中／廣東話輸出
- 支援手機、平板橫直向與桌面版排版、跨平台 Safe Area 與 Reduce Motion
- 暖白紙張式 UI，加入克制的淡紫至暖白背景漸變，以單一主色、較收斂圓角和分隔資訊列取代多層彩色卡片
- 設定頁採漸進展開：模型服務、阿里雲方案／伺服器及技術連線欄位預設保持精簡，主要儲存按鈕固定在底部
- Melo Chat 使用單一標題列；目前模型服務留在標題列，每則回覆只保留較安靜的 Model ID 註記，輸入區工具也更精簡
- 首頁 Melo 可以觸控，會在本機切換表情、輕彈一下並輪流回應三句對應介面語言的短句，不會呼叫模型
- 「和 Melo 聊聊」改用淡薰衣草次要按鈕，與背景有清楚層次，同時保留改寫流程作為主要操作

## Melo Chat

Melo Chat 是一個獨立的全高對話畫面，包含訊息氣泡、固定輸入框、快捷開場、重試、清除本機對話及「轉到改寫」等操作。它只使用用戶自己設定並保存的相容 Provider 帳戶、API key 與準確 Model ID；沒有 key 或接口失敗時會誠實顯示原因，不會加入一段假裝由模型生成的助理訊息。

對話記憶刻意保持本機化及有上限：

- 只保存最近 **24 則訊息**；
- 每次接口請求最多傳送最近 **8 則對話訊息**，另加 Melo 的系統人格與安全指示；
- iOS／Android 的訊息文字使用 Expo SecureStore 並限制為只供目前裝置存取；
- Web 使用目前瀏覽器的 local storage；
- 沒有帳戶、雲端歷史或跨裝置同步，用戶可在 Chat 內清除本機紀錄。

圖片屬於 Model 級別的手動能力設定。用戶必須在設定中確認「這個 Model 支援圖片輸入」，Melo 才會開放附件按鈕；程式會先在本機縮放及標準化圖片。Provider 品牌本身有視覺模型，不代表目前填入的 Model ID 一定支援圖片。

成功回覆會保存 Provider 與模型歸屬，但訊息下方只顯示準確 Model ID，避免重複標題列的服務資訊。若相容接口回傳實際 served model，Melo 會保存該值；否則保存請求時填入的準確 Model ID。模型也可輸出一個表情狀態，App 再把它映射到首頁同一隻動態 Melo。模型不能傳入任意動畫、樣式或程式碼；不在白名單內的值會安全回退。Melo 只是一個溝通及自我整理伙伴，不是心理治療、診斷或危機服務。

## 開始使用

需要 Node.js 及 Expo Go。本 Demo 特意使用 **Expo SDK 54**；Expo 在 SDK 57 過渡期建議真機 Expo Go 專案使用 SDK 54，詳見 [Expo 官方說明](https://docs.expo.dev/get-started/create-a-project/)。

```bash
npm install
npx expo start
```

之後：

- iPhone / Android：用 Expo Go 掃描 QR code
- iOS Simulator：按 `i`
- Android Emulator：按 `a`
- Web：按 `w`

如 Expo 提示套件版本不一致：

```bash
npx expo install --fix
```

完整本機檢查：

```bash
npm run typecheck
npm test
npx expo-doctor
```

## 驗證狀態

此分支已於 2026 年 8 月 5 日完成：

- TypeScript type-check 通過
- deterministic regression suite 通過，並涵蓋 Provider 真實歸因、Chat 上下文上限、本機保存、安全邊界及圖片能力開關
- Expo Doctor 的 SDK 54 檢查 18／18 通過
- Web、iOS、Android production export 全部成功
- 以 390 × 844 手機尺寸完整操作離線黃金流程，包括三種介面語言、Provider 選擇、阿里雲 Plan／地區切換、Before／After、Copy 回饋與 Calm Stars
- 渲染端到端 Provider 測試成功接收一個刻意延遲 9 秒的 OpenAI-compatible 回覆，證明不再被舊版 8 秒 timeout 截斷；整次流程只發出 1 次 POST
- 渲染 HTTP 500 流程會顯示 `Offline fallback`、`AI rewrite did not complete` 及 `HTTP 500`，不會把本機確定性模板冒充為模型結果
- 經明確授權後，以合成且不含敏感資料的草稿，使用 `qwen3-coder-plus` 對阿里雲百鍊 Coding Plan 中國區完成一次真實 `rewriteMessage` adapter smoke test；結果為 `source: ai`，不是 fallback。憑證沒有寫入 repository 或文件
- 再以 Computer Use 在 iOS Simulator 走完整原生 UI，使用已設定且獲明確授權的阿里雲 Coding Plan 帳戶連續測試「溫和」與「直接」兩種語氣。兩段繁中模型輸出明顯不同，結果 badge 均顯示阿里雲 Coding Plan；Metro 每輪各有一行 `provider rewrite succeeded`，output length 分別為 62 與 53。測試沒有讀取或顯示已儲存 key
- Computer Use 亦以同一個已授權 Simulator 帳戶完成多輪 Melo Chat，使用 `qwen3.7-plus` 收到具上下文且不同的回覆；模型選擇 `encouraging` 表情，每則回覆以較安靜的 `模型 · qwen3.7-plus` 顯示 Model ID，完整重新載入 App 後本機對話與歸屬仍能還原
- Computer Use 已在 Expo Go 驗證單一標題列 Chat、漸進展開設定頁、固定儲存按鈕與淡紫至暖白背景；英文及繁體中文狀態均可正常操作，Metro 沒有 runtime error
- 測試用的全合成桌面圖片已匯入 iPhone 17 Simulator，經 Expo Go 原生相片選擇器加入用戶訊息並由真實設定的圖片對話路徑送出；`qwen3.7-plus` 正確描述盆栽、水瓶、耳機、紫色筆記本、鉛筆及手機，Metro 記錄 `Melo provider chat succeeded`、`historyMessages: 8`、`expression: calm` 及相同 Model ID
- Computer Use 已把 iPad mini Simulator 在橫屏及直屏之間切換，驗證首頁、響應式設定頁，以及使用本機合成 OpenAI-compatible 測試服務的六輪長對話。Chat 的 800 px 內容欄保持置中，長訊息可正常捲動，標題列與輸入框固定且沒有裁切；首頁 Melo 觸控反應與新版「和 Melo 聊聊」按鈕也已在橫屏驗證。另一次 iPhone 17 短橫屏測試亦確認緊湊標題列、長對話、圖片訊息與輸入框均保持可見且沒有裁切

以上證明 source／離線 Demo 與原生模擬器 Provider UI 路徑已就緒；組員真機仍需在其自身網絡下完成一次可見確認。

## API provider 設定

按 App 右上角齒輪，先選擇介面語言，再以 BYOK 方式選擇 provider 並輸入：

- API key
- Base URL
- Model ID
- 目前準確 Model ID 是否支援圖片輸入

程式只提供 endpoint 預設，不會提供或啟用任何 Provider 帳戶、模型服務、key、額度或預設 Model ID。畫面最初顯示的 Provider preset 並不等於已完成設定；用戶仍須明確選擇並保存自己的連線資料：

| Provider | Base URL |
|---|---|
| [OpenAI](https://platform.openai.com/docs/api-reference/chat) | `https://api.openai.com/v1` |
| [Google AI Studio](https://ai.google.dev/gemini-api/docs/openai) | `https://generativelanguage.googleapis.com/v1beta/openai` |
| 阿里雲百鍊 | 由 Plan + 地區／伺服器選單決定 |
| [DeepSeek](https://api-docs.deepseek.com/) | `https://api.deepseek.com` |
| [Kimi](https://platform.kimi.com/docs/overview) | `https://api.moonshot.cn/v1` |
| [MiniMax](https://platform.minimaxi.com/docs/api-reference/text-chat-openai) | `https://api.minimaxi.com/v1` |
| Z.ai BigModel | `https://open.bigmodel.cn/api/paas/v4` |
| Custom provider | 使用者自行輸入 |

百鍊不同 Plan、地域及業務空間使用不同的 key 與 Base URL。設定分成兩層選單：按量付費、Coding Plan 或 Token Plan；再選擇該 Plan 顯示的地區／伺服器。按量付費提供中國（北京）、新加坡、美國（維珍尼亞）及自訂業務空間 endpoint；Coding Plan 與 Token Plan 提供中國（北京）及新加坡 endpoint。切換 Plan 或地區會清除舊 key，避免誤用。

所選 Plan 與地區／伺服器會決定 Guided Rewrite 及 Melo Chat 實際使用的 endpoint；帳戶權限、模型可用性及準確的 Plan／地域範圍最終仍由阿里雲驗證。

Melo 可以攔截一般 key 與 `sk-sp-` 套餐 key 這種明顯不相符，但不能從 key 文字判斷其確切 Coding／Token Plan 或地域；最終方案及地域授權仍由阿里雲伺服器驗證。

具名 Provider 只接受該供應商的官方兼容 host；其他 OpenAI-compatible 服務必須選擇 **Custom API**。Adapter 同時接受 Base URL 或完整 `/chat/completions` endpoint，不會重複拼接路徑；如 Provider 明確標示回覆被截斷或未正常完成，亦不會冒充成功的 AI 結果。

### Provider 結果與接口診斷

Melo 最長等待 Provider 30 秒。只有 Chat Completions 回覆含有可讀訊息，結果頁才會顯示所選 Provider；本機模板一律標示為 **離線改寫／Offline fallback**。

失敗情況會分成：

- 本機設定錯誤（沒有發出網絡請求）
- 裝置／網絡無法連線
- Provider timeout
- HTTP 拒絕；安全地顯示 status，以及通過嚴格格式檢查的 Provider error code
- HTTP 成功但回覆為空或格式不相容
- 回覆未通過原型輸出 guard

程式不會把 Provider 原始 body／error message、草稿、API key 或 Authorization header 寫入結果或診斷 log；如有安全的 request ID，則可顯示供用戶向 Provider 追查。

離線 fallback 是確定性模板，所以相似輸入可能產生相同文字。結果頁現在會清楚說明文字來自模型還是 Melo 本機 fallback。這個 fallback 只適用於結構化 Guided Rewrite；Melo Chat 必須使用已設定 Provider，不會在 key 缺失或請求失敗時生成假對話。

### Web 注意事項

部分供應商可能不允許瀏覽器直接跨域請求。比賽現場最穩定的演示方式是 Expo Go 原生 App；Web 版可使用本機 proxy 作後續擴充。

## 安全與私隱界線

這是比賽 prototype，不是心理治療、診斷或危機服務。

- Guided Rewrite 草稿只存在目前 App state；Melo Chat 則刻意只在目前裝置／瀏覽器保存最近 24 則訊息，並提供清除本機紀錄操作
- API key 沒有硬編碼在 source code
- 原生裝置以 SecureStore 保存 Provider 設定及 Chat 訊息文字；Web 設定只在目前 session 保存，而 Web Chat 使用 local storage
- Guided Rewrite 輸入，以及最多最近 8 則 Melo Chat 訊息與用戶明確啟用的附件，會直接傳送到其選擇的 AI Provider
- Chat 沒有帳戶、雲端歷史或跨裝置同步
- 正式產品應加入可信任 backend、速率限制、provider moderation、同意流程、資料保留政策及完整安全評估
- `src/services/safety.ts` 只是簡單 prototype keyword guard，不應被描述成臨床風險偵測模型

## 比賽 Demo 建議

使用 App 內的 demo example：

> You never do any work. I am done with this group project.

選擇：

- Emotion: Overwhelmed
- Recipient: Teammate
- Tone: Gentle
- Output: English

完成 12 秒呼吸或按「Skip breathing for demo」，展示：

1. 原始衝動訊息
2. Melo 陪伴 pause
3. 較健康的改寫訊息
4. Copy / Share
5. 顯示本次獲得 1 顆 Calm Star，並說明配件會在 3／7／15 顆時解鎖
6. 在設定中即時切換繁中／簡中／英文介面

## 下一步開發優先次序

1. 先在真機跑通 SDK 54 Expo Go
2. 在該真機重跑已授權 Provider 的設定到結果完整流程，之後清除已儲存 key
3. 為 provider 加入 Test Connection
4. 改善危機情境頁面與地區化支援資源
5. 加入真正的寵物房間／飾物，但保持無懲罰設計
6. 改善大字體、對比選項及其他 accessibility 驗證
7. 擴充自動化 UI coverage
8. 最後才加登入、雲端同步或長期紀錄

## 目前限制

- 此分支尚未完成任何 Expo Go 真機驗證
- 直接由 client 呼叫 Provider 只適合 prototype；Web 亦可能受到 CORS 限制
- 安全 guard 只是關鍵字規則，可能漏判或誤判，不能作臨床風險評估
- 離線 fallback 只對固定小組項目 Demo 及常見模式有較具體的理解，不是完整自然語言模型
- 已授權真實帳戶已在 iOS Simulator UI 完成 Guided Rewrite 與 Melo Chat 路徑，但尚未在實體手機完成設定到結果的整段流程
- Calm Star 目前只提供三個簡單配件門檻
- `npm audit` 目前回報 Expo 54 間接 build-tool chain 的 10 個 moderate 及 1 個 high advisory；自動 major-version 修復會把專案升回目前不符合真機 Expo Go 要求的 Expo 57，因此沒有盲目套用
- 尚未加入帳戶、雲端同步或分析儀表板；Chat 訊息歷史刻意只存本機並限制為最近 24 則

## 專案結構

```text
App.tsx                       主流程與畫面
src/components/MeloPet.tsx   虛擬寵物與動畫
src/components/MeloChat.tsx  對話畫面、訊息氣泡、附件及本機紀錄操作
src/components/MeloChatAvatar.tsx  重用首頁 Melo 的對話頭像
src/components/AISettingsModal.tsx
src/config/alibaba.ts            阿里雲 Plan／地區／endpoint 對照
src/config/providers.ts      Provider 預設值
src/i18n.ts                  三語介面文案
src/services/ai.ts           Guided Rewrite 與共用 Provider adapter 整合
src/services/chat.ts         Melo 人格、有限上下文、表情解析、圖片及安全邊界
src/services/providerClient.ts  共用 OpenAI-compatible transport 與安全診斷
src/services/chatStorage.ts  SecureStore／Web local storage 對話保存
src/services/chatImages.ts   圖片挑選、縮放、限制及清理
src/services/storage.ts      SecureStore / Web session storage
src/services/safety.ts       Prototype risk keyword guard
src/utils/fallback.ts        離線訊息模板
src/utils/providerUrl.ts     Base URL 安全驗證
src/utils/settingsValidation.ts
src/utils/settingsTransitions.ts
tests/                       Provider、fallback、i18n、安全回歸測試
.github/workflows/quality.yml
PROJECT_NOTES.md             修改內容、原因、目的與影響
DEMO_SCRIPT.md               英文匯報及演示稿
PITCH.md                     8–10 分鐘完整 Pitch 及 Q&A
DESIGN_SYSTEM.md             UI token、互動、三語及無障礙規範
```
