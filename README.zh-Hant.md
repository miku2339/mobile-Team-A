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
- 簡單危機字詞 guard：偵測到明顯自傷／傷人語句時停止一般改寫，改為建議尋求真實世界支援
- Before／After、Copy 可見回饋、Share，以及英文／繁中／簡中／廣東話輸出
- 支援 320 px 窄屏、跨平台 Safe Area 與 Reduce Motion

## 開始使用

需要 Node.js 及 Expo Go。

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
- 19 項 deterministic regression tests 全部通過
- Expo Doctor 20／20 通過
- Web、iOS、Android production export 全部成功
- 以 390 × 844 手機尺寸完整操作離線黃金流程，包括三種介面語言、Provider 選擇、阿里雲 Plan／地區切換、Before／After、Copy 回饋與 Calm Stars

以上證明 source 與離線 Demo 已就緒；**尚未**代表 Expo Go 真機或任何真實 Provider 帳戶已完成端到端驗證，這兩項仍是清楚分開的 release gates。

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

1. 先在真機跑通 Expo Go
2. 以一個已授權的按量付費 Provider 帳戶完成端到端測試
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
- 此分支尚未以真實 Provider 帳戶完成端到端驗證
- Calm Star 目前只提供三個簡單配件門檻
- `npm audit` 目前回報 Expo 間接 build-tool chain 的 10 個 moderate advisories；建議的強制修復會降級 Expo，因此沒有套用
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
