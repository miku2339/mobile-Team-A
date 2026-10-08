# Melo App QA Summary / App 驗收摘要

Date: 5 August 2026

Repository: `miku2339/mobile-Team-A`

Final `main` commit: the GitHub `main` commit containing this file

Earlier icon baseline: `5e16b41`

## Passed / 已通過

| Area | Evidence |
|---|---|
| Static and regression checks | TypeScript passed; deterministic suite 62/62 passed; Expo Doctor 18/18 passed. |
| Cross-platform build | Web, iOS and Android production export completed with the Melo-face icon configuration. |
| Web launcher | `npm run web` started Expo Web and the loopback Provider proxy together; the app returned HTTP 200 and proxy CORS preflight returned 204. |
| Interface languages | English, Traditional Chinese and Simplified Chinese switched immediately across Home, Chat and Settings. |
| Home Melo interaction | Tapping Melo changed its expression and local response without a provider request. |
| Guided Rewrite | Draft → Context → Pause → Before/After completed. A fresh authorised Alibaba Coding Plan request returned a non-fallback rewrite and the correct source badge. |
| Provider truth | Offline output is labelled `Offline fallback`; a readable model result records its provider and model. |
| Melo Chat | Existing bounded local history and exact model attribution were restored. A fresh request that reached the configured time limit added no fake assistant reply. |
| Image path | Same-source Simulator evidence shows a synthetic desk image selected, sent and described through an explicitly enabled image-capable model. |
| Responsive layout | Same-source evidence covers phone, iPad portrait/landscape and short phone landscape without clipping. |
| Presentation files | English and Traditional Chinese decks passed overflow and template-fidelity checks; every rendered slide was inspected. |

## Remaining external checks / 尚待外部驗收

1. Scan the latest LAN QR with a teammate's physical phone in Expo Go; do not rely on an old `exp.direct` bundle.
2. Save the authorised provider, plan, region and exact Model ID; close and reopen Settings.
3. Run the same synthetic message in Gentle and Direct tones and confirm different model output with correct attribution.
4. Send three Chat turns, attach a synthetic image and verify photo permission, thumbnail, reply and model label.
5. Restart Expo Go and confirm language, settings, Calm Stars and bounded Chat history persist.
6. Rotate the physical phone/tablet and verify Home, Settings, transcript and composer.
7. Test Android runtime if an Android device is available; the current Android evidence is export-level.

1. 組員在場地網絡以實體手機 Expo Go 掃最新 LAN QR，不要使用舊 `exp.direct` bundle。
2. 儲存已授權 Provider、Plan、地區與準確 Model ID；關閉並重開設定頁確認。
3. 同一段合成訊息分別用 Gentle 和 Direct，確認模型輸出不同且來源正確。
4. 連續三輪 Chat，再附加合成圖片，確認相簿權限、縮圖、回覆和模型標籤。
5. 重啟 Expo Go，確認語言、設定、Calm Stars 和有上限的 Chat 紀錄仍存在。
6. 旋轉實體手機／平板，確認首頁、設定、長對話及輸入框沒有裁切。
7. 如有 Android 裝置再補 runtime；目前 Android 證據只到 production export。

## Presentation-safe claims / 匯報可安全使用的說法

- Melo is a functional competition prototype for pausing before sending and communicating more constructively.
- AI is optional inside Guided Rewrite, and model attribution is visible.
- Melo Chat is provider-backed, local and bounded; it does not claim therapy or diagnosis.
- Engineering checks prove prototype functionality, not clinical effectiveness or production safety.

- Melo 是一個在發送訊息前停一停、協助更具建設性溝通的可運行比賽原型。
- AI 只是 Guided Rewrite 的可選實作層，模型來源會清楚顯示。
- Melo Chat 使用用戶設定的 Provider，記憶存在本機而且有上限；不宣稱治療或診斷。
- 工程測試只證明原型功能，不代表臨床成效或正式產品安全。
