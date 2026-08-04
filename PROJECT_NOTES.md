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
- 多 provider BYOK 可展示技術彈性
- Offline fallback 降低現場翻車風險
- 虛擬寵物令產品更有記憶點及 UX 亮點

限制：

- 目前是直接 client-to-provider request，正式產品不應照搬
- Web 可能遇到 CORS
- 安全 guard 只是關鍵字規則，不是可靠的危機識別模型
- 寵物成長目前只有星星和三個簡單配件階段
- 未加入測試、backend、帳戶、資料庫或分析儀表板
