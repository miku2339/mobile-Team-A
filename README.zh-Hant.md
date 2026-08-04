# Melo — Pause. Breathe. Say it better.

[English README](README.md)

一個以 **Mental Wellness + Healthy Communication** 為核心的 React Native / Expo 比賽原型。

Melo 是一隻不會以飢餓、死亡或連續簽到向用戶施壓的虛擬寵物。它陪用戶完成一個短暫 pause，再把原本情緒化的訊息改寫成較冷靜、清楚和可執行的表達。

## 已完成的功能

- 四段主要流程：原訊息 → 情緒與對象 → 呼吸 pause → 改寫結果
- 虛擬寵物 Melo，會按流程改變表情與呼吸動畫
- Calm Stars：完成一次健康溝通流程即可獲得星星
- 無 streak 懲罰；寵物不會因為用戶沒有打開 App 而生病或難過
- 內建 OpenAI、Google AI Studio、阿里雲百鍊、DeepSeek、Kimi、MiniMax、智譜 BigModel 及自訂 OpenAI-compatible 連線預設；真實帳戶相容性仍需逐一驗證
- Melo 不提供模型服務、key、額度或預設模型；用戶自行填 API key、Base URL 和準確的 Model ID
- 阿里雲提供兩層選單：Plan（按量／Coding Plan／Token Plan）及該 Plan 支援的地區／伺服器
- 介面可在繁體中文、簡體中文、English 之間即時切換並保存
- iOS / Android 使用 Expo SecureStore 儲存設定；Web 只保留在目前瀏覽器分頁
- API 不可用或未填 key 時，自動使用標示清楚的離線改寫
- 只有收到可讀取的模型回覆才會標示為 AI 結果；離線模板不會冒充 Provider 回覆
- Provider 最長等待 30 秒，並分開顯示逾時、網絡、HTTP、回覆格式及本機設定錯誤
- 簡單危機字詞 guard：偵測到明顯自傷／傷人語句時停止一般改寫，改為建議尋求真實世界支援
- Before／After、Copy 可見回饋、Share，以及英文／繁中／簡中／廣東話輸出
- 支援 320 px 窄屏、跨平台 Safe Area 與 Reduce Motion

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

此分支已於 2026 年 8 月 4 日完成：

- TypeScript type-check 通過
- 33 項 deterministic regression tests 全部通過
- Expo Doctor 的 SDK 54 檢查 18／18 通過
- Web、iOS、Android production export 全部成功
- 以 390 × 844 手機尺寸完整操作離線黃金流程，包括三種介面語言、Provider 選擇、阿里雲 Plan／地區切換、Before／After、Copy 回饋與 Calm Stars
- 渲染端到端 Provider 測試成功接收一個刻意延遲 9 秒的 OpenAI-compatible 回覆，證明不再被舊版 8 秒 timeout 截斷；整次流程只發出 1 次 POST
- 渲染 HTTP 500 流程會顯示 `Offline fallback`、`AI rewrite did not complete` 及 `HTTP 500`，不會把本機確定性模板冒充為模型結果
- 經明確授權後，以合成且不含敏感資料的草稿，使用 `qwen3-coder-plus` 對阿里雲百鍊 Coding Plan 中國區完成一次真實 `rewriteMessage` adapter smoke test；結果為 `source: ai`，不是 fallback。憑證沒有寫入 repository 或文件
- 再以 Computer Use 在 iOS Simulator 走完整原生 UI，使用已設定且獲明確授權的阿里雲 Coding Plan 帳戶連續測試「溫和」與「直接」兩種語氣。兩段繁中模型輸出明顯不同，結果 badge 均顯示阿里雲 Coding Plan；Metro 每輪各有一行 `provider rewrite succeeded`，output length 分別為 62 與 53。測試沒有讀取或顯示已儲存 key

以上證明 source／離線 Demo 與原生模擬器 Provider UI 路徑已就緒；組員真機仍需在其自身網絡下完成一次可見確認。

## API provider 設定

按 App 右上角齒輪，先選擇介面語言，再以 BYOK 方式選擇 provider 並輸入：

- API key
- Base URL
- Model ID

程式只預填官方相容 endpoint，不會預填 Model ID：

| Provider | Base URL |
|---|---|
| [OpenAI](https://platform.openai.com/docs/api-reference/chat) | `https://api.openai.com/v1` |
| [Google AI Studio](https://ai.google.dev/gemini-api/docs/openai) | `https://generativelanguage.googleapis.com/v1beta/openai` |
| 阿里雲百鍊 | 由 Plan + 地區／伺服器選單決定 |
| [DeepSeek](https://api-docs.deepseek.com/) | `https://api.deepseek.com` |
| [Kimi](https://platform.kimi.com/docs/overview) | `https://api.moonshot.cn/v1` |
| [MiniMax](https://platform.minimaxi.com/docs/api-reference/text-chat-openai) | `https://api.minimaxi.com/v1` |
| 智譜 BigModel | `https://open.bigmodel.cn/api/paas/v4` |
| Custom provider | 使用者自行輸入 |

百鍊不同 Plan、地域及業務空間使用不同的 key 與 Base URL。切換 Plan 或地區會清除舊 key，避免誤用。Coding Plan／Token Plan 按用戶要求保留為可選項，但 App 會顯示阿里雲官方限制：它們只供支援的編程或 Agent 工具使用，不適用於自訂 App，違規使用可能停用套餐或 key。Melo 的自訂 App 調用應使用已授權的按量付費 API。參見[阿里雲 Base URL 官方文件](https://help.aliyun.com/zh/model-studio/base-url)。

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

離線 fallback 是確定性模板，所以相似輸入可能產生相同文字。結果頁現在會清楚說明文字來自模型還是 Melo 本機 fallback。

### Web 注意事項

部分供應商可能不允許瀏覽器直接跨域請求。比賽現場最穩定的演示方式是 Expo Go 原生 App；Web 版可使用本機 proxy 作後續擴充。

## 安全與私隱界線

這是比賽 prototype，不是心理治療、診斷或危機服務。

- 原始草稿只存在目前 App state，程式沒有刻意建立訊息歷史資料庫
- API key 沒有硬編碼在 source code
- 原生裝置以 SecureStore 保存 provider 設定
- 使用者草稿會直接傳送到其選擇的 AI provider
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
- 真實帳戶 smoke test 只覆蓋一次性本機程序內的 Provider adapter；尚未在真機完成設定到結果的整段流程
- Calm Star 目前只提供三個簡單配件門檻
- `npm audit` 目前回報 Expo 54 間接 build-tool chain 的 10 個 moderate 及 1 個 high advisory；自動 major-version 修復會把專案升回目前不符合真機 Expo Go 要求的 Expo 57，因此沒有盲目套用
- 尚未加入帳戶、雲端同步、分析儀表板或訊息歷史

## 專案結構

```text
App.tsx                       主流程與畫面
src/components/MeloPet.tsx   虛擬寵物與動畫
src/components/AISettingsModal.tsx
src/config/alibaba.ts            阿里雲 Plan／地區／endpoint 對照
src/config/providers.ts      Provider 預設值
src/i18n.ts                  三語介面文案
src/services/ai.ts           OpenAI-compatible API adapter
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
