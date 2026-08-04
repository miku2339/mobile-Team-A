# Melo — Pause. Breathe. Say it better.

[English README](README.md)

一個以 **Mental Wellness + Healthy Communication** 為核心的 React Native / Expo 比賽原型。

Melo 是一隻不會以飢餓、死亡或連續簽到向用戶施壓的虛擬寵物。它陪用戶完成一個短暫 pause，再把原本情緒化的訊息改寫成較冷靜、清楚和可執行的表達。

## 已完成的 starter 功能

- 四段主要流程：原訊息 → 情緒與對象 → 呼吸 pause → 改寫結果
- 虛擬寵物 Melo，會按流程改變表情與呼吸動畫
- Calm Stars：完成一次健康溝通流程即可獲得星星
- 無 streak 懲罰；寵物不會因為用戶沒有打開 App 而生病或難過
- 支援 OpenAI、阿里雲百鍊、智譜 BigModel，以及自訂 OpenAI-compatible API
- 用戶可在 App 內自行填 API key、Base URL 和 Model ID
- iOS / Android 使用 Expo SecureStore 儲存設定；Web 只保留在目前瀏覽器分頁
- API 不可用或未填 key 時，自動使用離線安全模板
- 簡單危機字詞 guard：偵測到明顯自傷／傷人語句時停止一般改寫，改為建議尋求真實世界支援
- Copy、Share、中英文／廣東話輸出

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

## API provider 設定

按 App 右上角齒輪，選擇 provider，然後輸入：

- API key
- Base URL
- Model ID

預設值：

| Provider | Base URL | Model example |
|---|---|---|
| OpenAI | `https://api.openai.com/v1` | `gpt-5-mini` |
| 阿里雲百鍊 | `https://dashscope.aliyuncs.com/compatible-mode/v1` | `qwen-plus` |
| 智譜 BigModel | `https://open.bigmodel.cn/api/paas/v4` | `glm-5.2` |

百鍊不同地域及業務空間可能使用不同專屬域名，所以 App 允許自由修改 Base URL。

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
5. Calm Star 與寵物小配件解鎖

## 下一步開發優先次序

1. 先在真機跑通 Expo Go
2. 接入一個實際 API key 並測試 OpenAI / 百鍊 / BigModel
3. 為 provider 加入 Test Connection
4. 改善危機情境頁面與地區化支援資源
5. 加入真正的寵物房間／飾物，但保持無懲罰設計
6. 最後才加登入、雲端同步或長期紀錄

## 專案結構

```text
App.tsx                       主流程與畫面
src/components/MeloPet.tsx   虛擬寵物與動畫
src/components/AISettingsModal.tsx
src/config/providers.ts      Provider 預設值
src/services/ai.ts           OpenAI-compatible API adapter
src/services/storage.ts      SecureStore / Web session storage
src/services/safety.ts       Prototype risk keyword guard
src/utils/fallback.ts        離線訊息模板
PROJECT_NOTES.md             修改內容、原因、目的與影響
DEMO_SCRIPT.md               英文匯報及演示稿
```
