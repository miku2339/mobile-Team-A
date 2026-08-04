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
- Bring Your Own Key (**BYOK**) provider settings
- OpenAI support
- Alibaba Cloud Model Studio / Bailian support
- Zhipu AI BigModel support
- Custom OpenAI-compatible endpoint support
- User-editable API key, Base URL and model ID
- English, Traditional Chinese and written Cantonese output
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

A TypeScript check is also available:

```bash
npm run typecheck
```

## AI Provider Setup

Open the gear icon in the top-right corner of the app, choose a provider, and enter:

- **API key**
- **Base URL**
- **Model ID**

Configured examples:

| Provider | Default Base URL | Example model |
|---|---|---|
| OpenAI | `https://api.openai.com/v1` | `gpt-5-mini` |
| Alibaba Cloud Model Studio / Bailian | `https://dashscope.aliyuncs.com/compatible-mode/v1` | `qwen-plus` |
| Zhipu AI BigModel | `https://open.bigmodel.cn/api/paas/v4` | `glm-5.2` |
| Custom provider | User supplied | User supplied |

The app sends requests to:

```text
{Base URL}/chat/completions
```

The selected service therefore needs to provide an OpenAI-compatible Chat Completions endpoint.

Provider regions, accounts and workspaces may require a different Base URL or model name. Both fields are editable inside the app.

### Important API-key rule

**Never commit a real API key to GitHub, source code, screenshots, issues or documentation.**

The current prototype stores settings as follows:

- **iOS / Android:** Expo SecureStore on the local device;
- **Web:** browser session storage, cleared when the browser session ends.

For this prototype, the app communicates directly with the provider selected by the user. A production application should use a trusted backend instead.

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
7. the Calm Star reward and pet progression.

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

The provider adapter is intentionally shared across OpenAI, Bailian, BigModel and custom compatible services. Provider-specific defaults are stored separately from the rewrite logic.

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
  BYOK provider, API key, Base URL and model settings

src/components/ChoiceChip.tsx
  Reusable option selector

src/components/PrimaryButton.tsx
  Reusable button component

src/config/providers.ts
  Provider names, default URLs and example models

src/services/ai.ts
  Prompt construction and OpenAI-compatible API adapter

src/services/storage.ts
  SecureStore and web session-storage helpers

src/services/safety.ts
  Prototype keyword-based safety pause

src/utils/fallback.ts
  Offline multilingual message templates

src/theme.ts
  Shared colour and spacing tokens

src/types.ts
  Shared TypeScript types

PROJECT_NOTES.md
  What changed, why it changed, goals, impact and current limitations

DEMO_SCRIPT.md
  A short English presentation and live-demo script
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

- The project has not yet been fully validated on every physical device.
- Direct client-to-provider API calls are suitable only for a prototype.
- Some providers may block browser requests because of CORS restrictions.
- The safety guard is intentionally basic and can miss or misclassify risk.
- The offline fallback does not deeply interpret the original message.
- Calm Star progression currently unlocks only a few simple accessories.
- There is no account system, cloud synchronisation, analytics dashboard or message history.

## Development Priorities

1. Confirm that the app runs reliably in Expo Go on a physical phone.
2. Test at least one real provider end-to-end.
3. Add a **Test Connection** action to provider settings.
4. Improve the high-risk support screen and localise support resources.
5. Refine the pet visuals and accessory system without adding guilt mechanics.
6. Improve accessibility, including larger text and clearer contrast options.
7. Add automated tests for fallback, provider parsing and safety logic.
8. Only consider accounts, cloud sync or long-term history after the competition prototype is stable.

## Competition Positioning

Melo should be presented as:

> **A virtual wellness companion for emotional regulation and healthier communication.**

It should not be presented as:

- an AI therapist;
- a mental-health diagnosis tool;
- a replacement for counselling;
- an emergency or crisis-response system.
