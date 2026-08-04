# Melo — Pause. Breathe. Say It Better.

[繁體中文](README.zh-Hant.md)

Melo is a **React Native + Expo mental-wellness prototype** that helps students pause before sending an emotional message, identify what they are feeling, and rewrite the message in a calmer, clearer and more constructive way.

The project combines two ideas:

1. **Healthy communication support** — turning an impulsive draft into a message that expresses feelings, avoids blame and suggests a practical next step.
2. **A supportive virtual pet** — Melo guides the user through the pause, celebrates positive actions and makes the experience feel friendly rather than clinical.

> **Melo does not replace human connection. It creates a small pause that can protect that connection.**

## Project Goal

Students sometimes send messages at the peak of anger, stress, disappointment or anxiety. They may know what they want to communicate, but the wording can damage a friendship, family relationship or group project.

Melo is designed to support:

- **Emotional well-being** — recognising and slowing down strong emotions;
- **Social well-being** — communicating needs without unnecessary blame or hostility;
- **Psychological well-being** — making it easier to ask for support or explain a concern;
- **Cognitive well-being** — creating a short pause before an impulsive action.

This is a **functional competition prototype**, not a therapy, diagnosis or crisis-response service.

## Core User Flow

1. **Enter the original draft**  
   The user types or pastes the message they were about to send.

2. **Add emotional context**  
   The user selects their emotion, recipient, preferred tone and output language.

3. **Pause with Melo**  
   Melo guides the user through a short breathing cycle before the rewrite is generated.

4. **Review the calmer message**  
   The app returns a healthier version that keeps the original intention, reduces blame and includes a practical next step.

The user can then copy, share, retry with another tone or start again.

## Why a Virtual Pet?

Melo is not only a decorative mascot. The pet acts as a low-pressure guide throughout the wellness flow:

- listening while the user enters the original message;
- helping the user name an emotion;
- breathing together during the pause;
- celebrating a completed healthy-communication action;
- unlocking simple accessories through **Calm Stars**.

The design intentionally avoids guilt-based mechanics:

- no daily streak punishment;
- no hunger system;
- no pet illness or death;
- no message implying that the pet is sad because the user left.

Melo rewards positive actions without punishing absence.

## Current Features

- React Native application built with Expo and TypeScript
- Four-stage healthy-communication flow
- Animated virtual pet with multiple moods
- Twelve-second guided breathing interaction
- Calm Stars and simple accessory progression
- AI-assisted message rewriting
- Bring Your Own Key (**BYOK**) provider settings; Melo provides no model service, key, credits or default model
- OpenAI and Google AI Studio connection presets for compatible Chat Completions endpoints
- Alibaba Cloud Model Studio / Bailian with separate Pay-as-you-go, Coding Plan and Token Plan menus
- Alibaba Cloud plan-aware region/server selection
- DeepSeek, Kimi and MiniMax compatible endpoint presets
- Zhipu AI BigModel endpoint preset
- User-configured OpenAI-compatible endpoint
- User-editable API key, Base URL and model ID
- English, Traditional Chinese and Simplified Chinese interface switching
- English, Traditional Chinese, Simplified Chinese and written Cantonese output
- Before/After review, visible Copy feedback and a deterministic group-project demo
- Responsive 320 px layouts, cross-platform safe areas and Reduce Motion support
- Copy and native Share actions
- Offline rewrite fallback when no API key is available
- Basic prototype safety keyword guard
- Native secure settings storage through Expo SecureStore
- Web session-only API settings storage

## Quick Start

### Requirements

- Node.js — an LTS release is recommended
- npm
- Expo Go on an iPhone or Android device, or a local simulator/emulator

This demo intentionally targets **Expo SDK 54**. During the SDK 57 transition, Expo recommends SDK 54 for Expo Go on physical devices; see the [official Expo project guide](https://docs.expo.dev/get-started/create-a-project/).

### Install and run

```bash
git clone https://github.com/miku233333/mobile-Team-A.git
cd mobile-Team-A
npm install
npx expo start
```

After Expo starts:

- scan the QR code with **Expo Go** on iPhone or Android;
- press `i` to open the iOS Simulator;
- press `a` to open an Android emulator;
- press `w` to open the web version.

If Expo reports dependency-version mismatches, run:

```bash
npx expo install --fix
```

A full local quality check is available:

```bash
npm run typecheck
npm test
npx expo-doctor
```

## Validation Status

Verified on this branch on 4 August 2026:

- TypeScript type-check passes;
- all 19 deterministic regression tests pass;
- Expo Doctor passes all 18 SDK 54 checks;
- Web, iOS and Android production exports complete successfully;
- the complete offline golden path was exercised at a 390 × 844 mobile viewport, including three interface languages, provider selection, Alibaba plan/region switching, Before/After, Copy feedback and Calm Stars;
- one explicitly authorised Alibaba Cloud Coding Plan China smoke test passed through Melo's real `rewriteMessage` adapter with `qwen3-coder-plus`, a synthetic non-sensitive draft and `source: ai` rather than fallback. No credential was written to the repository or documentation.

These checks prove source/offline-demo readiness and the provider adapter's real-account path. A physical-device Expo Go run and the combined on-device provider UI flow still require visible confirmation.

## AI Provider Setup

Open the gear icon in the top-right corner of the app. Following a BYOK connection flow, choose the provider and enter:

- **API key**
- **Base URL**
- **Model ID**

Melo only supplies endpoint presets. It does **not** supply a model, API key, credits, proxy or default Model ID.

Configured provider endpoints:

| Provider | Preset Base URL | Model ID |
|---|---|---|
| [OpenAI](https://platform.openai.com/docs/api-reference/chat) | `https://api.openai.com/v1` | User supplied |
| [Google AI Studio](https://ai.google.dev/gemini-api/docs/openai) | `https://generativelanguage.googleapis.com/v1beta/openai` | User supplied |
| Alibaba Cloud Model Studio | Selected from plan + region menus | User supplied |
| [DeepSeek](https://api-docs.deepseek.com/) | `https://api.deepseek.com` | User supplied |
| [Kimi](https://platform.kimi.com/docs/overview) | `https://api.moonshot.cn/v1` | User supplied |
| [MiniMax](https://platform.minimaxi.com/docs/api-reference/text-chat-openai) | `https://api.minimaxi.com/v1` | User supplied |
| Zhipu AI BigModel | `https://open.bigmodel.cn/api/paas/v4` | User supplied |
| Custom provider | User supplied | User supplied |

### Alibaba Cloud plan and region selection

Alibaba Cloud is deliberately split into two selectors:

1. **Plan:** Pay-as-you-go, Coding Plan or Token Plan
2. **Region/server:** only endpoints available for that plan

Pay-as-you-go includes China (Beijing), Singapore, US (Virginia), and a workspace/custom endpoint. Coding Plan and Token Plan expose their documented China and international endpoints. Changing the plan or region clears the previous key because plan and regional credentials are not interchangeable.

Melo can reject an obvious standard-key versus `sk-sp-` plan-key mismatch. It cannot infer the exact Coding/Token plan or region from the key text; Alibaba Cloud remains the authority that validates the key's actual plan and regional scope.

Coding Plan and Token Plan remain selectable at the user's request, but the UI shows an important provider-policy warning: Alibaba Cloud documents these plans for supported interactive coding/agent tools, not custom applications. Using them outside that scope may suspend the plan or key. For Melo, Pay-as-you-go is the appropriate Alibaba Cloud option for an authorised custom-app API call. See the official [Alibaba Cloud Base URL overview](https://help.aliyun.com/en/model-studio/base-url) and [third-party tool connection policy](https://www.alibabacloud.com/help/en/model-studio/more-tools).

The app sends requests to:

```text
{Base URL}/chat/completions
```

The selected service therefore needs to provide an OpenAI-compatible Chat Completions endpoint.

Provider regions, accounts and workspaces may require a different Base URL or model name. Both fields remain editable inside the app.

### Important API-key rule

**Never commit a real API key to GitHub, source code, screenshots, issues or documentation.**

The current prototype stores settings as follows:

- **iOS / Android:** Expo SecureStore on the local device;
- **Web:** browser session storage, cleared when the browser session ends.

For this prototype, the app communicates directly with the provider selected by the user. A production application should use a trusted backend instead.

The provider flow is inspired by the separation used in Qoder's BYOK custom-model setup: provider first, then connection details supplied by the user. Unlike Qoder's hosted tiers, Melo offers no built-in model service. See [Qoder Custom Models](https://docs.qoder.com/user-guide/chat/custom-models).

## Offline Fallback

The app remains demonstrable without an API key or stable internet connection.

When an AI request is unavailable, Melo uses a local multilingual template that:

- converts blame into a first-person feeling statement;
- keeps the wording calm and concise;
- ends with a clear request or next step.

This fallback is important for a live competition demo because the core user journey still works if Wi-Fi, quota or provider availability fails.

## Suggested Live Demo

Use the built-in sample draft:

> You never do any work. I am done with this group project.

Choose:

- **Emotion:** Overwhelmed
- **Recipient:** Teammate
- **Tone:** Gentle
- **Output language:** English

Then demonstrate:

1. the original impulsive message;
2. Melo recognising the emotional context;
3. the breathing pause;
4. the rewritten message;
5. the explanation of the healthier wording;
6. Copy or Share;
7. the one-star reward, while explaining that accessories unlock at 3, 7 and 15 Calm Stars.

A demo-speed button can skip the full breathing wait while still showing the interaction.

## Example Product Pitch

> Students often send messages at the peak of anger, stress or disappointment. Melo is a virtual wellness companion that creates a short pause, helps the user identify what they feel, and rewrites the message in a healthier and more actionable way. It supports several AI providers, works offline as a fallback, and uses a virtual-pet reward system without guilt or streak pressure.

## Technical Overview

```text
React Native / Expo client
        │
        ├── User draft and emotional context
        ├── Guided breathing interaction
        ├── Basic safety keyword guard
        │
        ├── User-selected OpenAI-compatible provider
        │       └── POST /chat/completions
        │
        └── Local offline fallback when AI is unavailable
```

The provider adapter is intentionally shared across OpenAI, Google AI Studio, Alibaba Cloud, DeepSeek, Kimi, MiniMax, BigModel and custom compatible services. Provider-specific endpoint presets are stored separately from the rewrite logic, and every Model ID remains user supplied.

## Safety and Privacy Boundaries

Melo is a student prototype and must not be described as a therapist, clinical assessment tool, diagnosis system or emergency service.

Current boundaries:

- message drafts are kept in the current application state and are not intentionally stored in a message-history database;
- API keys are not hard-coded in the repository;
- native settings use Expo SecureStore;
- the user draft is sent directly to the AI provider selected by the user;
- the prototype safety guard is based on a small keyword list;
- a detected high-risk phrase stops the normal rewrite flow and recommends real-world support;
- the keyword guard is **not** a reliable clinical risk model.

A production version would require:

- a trusted backend;
- consent and clear data-retention controls;
- provider moderation and abuse protection;
- rate limiting;
- encrypted transport and secure secret management;
- regional support-resource localisation;
- professional safety, privacy and accessibility review.

## Project Structure

```text
App.tsx
  Main application state, screens and complete user flow

src/components/MeloPet.tsx
  Animated virtual pet, mood states and accessories

src/components/AISettingsModal.tsx
  Interface language and BYOK connection settings

src/config/alibaba.ts
  Alibaba Cloud plan, region and endpoint mappings

src/components/ChoiceChip.tsx
  Reusable option selector

src/components/PrimaryButton.tsx
  Reusable button component

src/config/providers.ts
  Provider names and endpoint presets; no default models

src/i18n.ts
  Type-safe English, Traditional Chinese and Simplified Chinese UI copy

src/services/ai.ts
  Prompt construction and OpenAI-compatible API adapter

src/services/storage.ts
  SecureStore and web session-storage helpers

src/services/safety.ts
  Prototype keyword-based safety pause

src/utils/fallback.ts
  Offline multilingual message templates

src/utils/providerUrl.ts
  HTTPS and localhost Base URL validation

src/utils/settingsValidation.ts
  Persisted provider-setting schema validation

src/utils/settingsTransitions.ts
  Credential-safe provider and Alibaba region transitions

tests/
  Deterministic provider, fallback, localisation and safety regression tests

.github/workflows/quality.yml
  Type-check, tests, Expo Doctor and Web/iOS/Android export gates

src/theme.ts
  Shared colour and spacing tokens

src/types.ts
  Shared TypeScript types

PROJECT_NOTES.md
  What changed, why it changed, goals, impact and current limitations

DEMO_SCRIPT.md
  A short English presentation and live-demo script

PITCH.md
  An 8–10 minute competition pitch and Q&A prompts

DESIGN_SYSTEM.md
  UI tokens, interaction rules, localisation and accessibility criteria
```

## Team Collaboration Guide

The repository is intended for the Hong Kong and Singapore team to work on together.

### Recommended workflow

```bash
git checkout main
git pull origin main
git checkout -b feature/short-feature-name
```

After making and testing a change:

```bash
git add .
git commit -m "feat: describe the change"
git push origin feature/short-feature-name
```

Then open a pull request or coordinate with the team before merging into `main`.

### Team rules

- Do not commit API keys, tokens or other secrets.
- Pull the latest `main` before starting new work.
- Use clear commit messages such as `feat:`, `fix:`, `docs:` or `refactor:`.
- For a meaningful feature change, update `PROJECT_NOTES.md` with:
  - what was changed;
  - why it was changed;
  - its purpose;
  - expected impact;
  - known limitations or next steps.
- Keep the live-demo flow stable before adding optional features.
- Avoid force-pushing shared branches.

## Current Limitations

- No physical-device Expo Go run has yet been completed on this branch.
- Direct client-to-provider API calls are suitable only for a prototype.
- Some providers may block browser requests because of CORS restrictions.
- The safety guard is intentionally basic and can miss or misclassify risk.
- The offline fallback recognises the fixed group-project demo and common patterns, but is not full natural-language understanding.
- The real-account smoke test covered the provider adapter in a one-off local process; it has not yet been repeated through the complete settings-to-result flow on a physical phone.
- `npm audit` currently reports 10 moderate and 1 high advisory in Expo 54's transitive build-tool chain. The automated major-version fix returns the project to Expo 57, which currently conflicts with the physical-device Expo Go requirement, so it has not been applied blindly.
- Calm Star progression currently unlocks only a few simple accessories.
- There is no account system, cloud synchronisation, analytics dashboard or message history.

## Development Priorities

1. Confirm that the SDK 54 app runs reliably in Expo Go on a physical phone.
2. Repeat the authorised provider test through the complete settings-to-result flow on that phone, then clear the saved key.
3. Add a **Test Connection** action to provider settings.
4. Improve the high-risk support screen and localise support resources.
5. Refine the pet visuals and accessory system without adding guilt mechanics.
6. Improve accessibility, including larger text and clearer contrast options.
7. Extend automated UI coverage beyond the current fallback, provider, localisation and safety regression suite.
8. Only consider accounts, cloud sync or long-term history after the competition prototype is stable.

## Competition Positioning

Melo should be presented as:

> **A virtual wellness companion for emotional regulation and healthier communication.**

It should not be presented as:

- an AI therapist;
- a mental-health diagnosis tool;
- a replacement for counselling;
- an emergency or crisis-response system.
