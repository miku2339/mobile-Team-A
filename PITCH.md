# Melo — 8–10 Minute Competition Pitch

## 0:00–0:45 — The problem

> Imagine a student working on a group project. The workload feels unfair, they are overwhelmed, and they type: “You never do any work. I am done with this group project.” The concern may be real, but sending it at the emotional peak can turn a solvable problem into a damaged relationship.

> Students do not always need another chatbot. Sometimes they need a small interruption between feeling and sending.

## 0:45–1:30 — The solution

> Melo is a virtual wellness companion for emotional regulation and healthier communication. It helps a user pause, name the context, breathe, and turn an impulsive draft into a calmer and more actionable message.

> Melo is not a therapist, does not diagnose anyone, and does not replace professional or real-world support.

## 1:30–4:00 — Live demo

1. Open Melo and point out that the full demo is available offline.
2. Tap **Start a calm rewrite**.
3. Use the built-in group-project example.
4. Select **Overwhelmed**, **Teammate**, **Gentle**, and **English**.
5. Explain the data notice: offline mode keeps the draft in the current app session and makes no provider request.
6. Tap **Pause with Melo** and show the breathing state.
7. Use **Skip breathing for demo** after the audience sees the interaction.
8. Compare the original message with the rewritten message:

> “I’m feeling overwhelmed because the group-project workload seems uneven. Could we review the tasks and agree on the responsibilities together?”

9. Point out the changes: no personal attack, a clear feeling statement, and a concrete request.
10. Tap **Copy**. Show the earned Calm Star and explain that accessories unlock at 3, 7 and 15 stars; one run earns one star and does not unlock an accessory yet.
11. Briefly open Settings and show that the entire interface can switch between English, Traditional Chinese and Simplified Chinese without restarting the app.

## 4:00–5:15 — UX and ethical design

> The flow gives the user one task at a time: write, add context, pause, then review. The Before/After layout makes the impact visible immediately.

> Melo uses a virtual pet because a friendly guide feels less clinical for students. But we deliberately rejected guilt mechanics. There is no streak punishment, hunger, illness or message saying the pet is sad because the user left. Calm Stars reward a healthy action without pressuring the user to return.

> The app supports three interface languages and four message-output choices, including written Cantonese. Interface language and output language are separate because an international student may use one language for navigation and another for a real conversation.

## 5:15–7:00 — Technical implementation

> Melo is built with React Native, Expo and TypeScript, so the same codebase can run on iOS, Android and Web.

> The rewrite pipeline has three layers. First, a keyword guard pauses the normal flow for obvious high-risk phrases. Second, if the user connects their own compatible model provider, Melo sends one request with the selected emotion, recipient, tone and message language. Third, if no key is present, the provider fails, times out or returns unsafe output, a deterministic multilingual fallback keeps the demonstration working.

> Provider settings follow a Bring Your Own Key model. Melo does not provide API keys, model access, credits or a default model. The user selects a provider and enters the exact Model ID. Presets include OpenAI, Google AI Studio, DeepSeek, Kimi, MiniMax and Zhipu. Alibaba Cloud adds two explicit levels: billing plan and region/server; changing either clears the previous key, while Alibaba Cloud performs the final plan and region authorisation check.

> Keys are not committed to source code. Native builds store settings in Expo SecureStore; the Web preview keeps sensitive provider settings only for the browser session.

## 7:00–8:00 — Impact and usefulness

> Melo focuses on a common, concrete moment: the message a student is about to send to a teammate, friend, teacher or family member. The output is not just advice; it is a usable next action that can be copied or shared.

> This supports emotional well-being by helping users name and slow down a feeling, social well-being by reducing blame, and cognitive well-being by interrupting an impulsive action.

## 8:00–9:00 — Honest limits and next steps

> This is a functional competition prototype, not a production mental-health product. The safety guard is intentionally limited, direct browser provider calls can face CORS restrictions, and real deployment would require a trusted backend, consent, rate limiting, regional support resources and professional safety review.

> Our next validation gates are a physical-device Expo Go run and an end-to-end test with an authorised provider account. We separate those gates from the source-code and offline-demo readiness already shown today.

## 9:00–9:30 — Closing

> Melo does not replace human connection. It creates one small pause that can protect that connection.

## Likely Q&A

### Why not make a normal AI therapist chatbot?

Melo avoids diagnosis and open-ended therapy. It solves one bounded problem with a clear input, action and output: pause before sending, then communicate more constructively.

### What happens if the internet or API fails?

The same user flow returns a labelled deterministic offline rewrite. The app never labels that output as an AI response.

### How do you protect private messages?

Offline mode makes no provider request. AI mode names the selected provider before generation. The prototype does not create a message-history database, but a production version still needs a backend, consent and retention controls.

### Is the safety system reliable?

No clinical claim is made. It is a small prototype guard for obvious phrases. A detected phrase stops normal rewriting and encourages immediate real-world support.

### What is innovative about the pet?

The pet is part of the regulation loop, not decoration. Its mood follows the user's step, it breathes with the user, and it rewards completed pauses without guilt or streak pressure.

### Does Melo sell or include AI models?

No. It is BYOK only. Users supply the provider account, key and exact Model ID. The offline fallback is local product logic, not a hosted model service.
