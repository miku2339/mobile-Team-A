# Melo UI System — Soft Pause Companion

Melo should feel calm, young and supportive without looking clinical. The interface gives the user one clear decision at a time, while the pet provides continuity across the flow.

## Product principles

1. **One primary action per screen** — the purple button advances the wellness flow; provider configuration stays secondary.
2. **Explain data movement before generation** — offline and provider modes use different, explicit notices.
3. **Reward without pressure** — Calm Stars celebrate completed pauses, with no streak loss, hunger or guilt mechanics.
4. **Interface language is separate from message language** — English, Traditional Chinese and Simplified Chinese localise the app; Cantonese remains an optional rewrite output.
5. **Bring your own model** — Melo provides no API key, model access, credits or default Model ID.

## Information architecture

```text
Home
  ├─ Start a calm rewrite
  └─ Settings
       ├─ Interface language
       └─ Model connection
            ├─ Provider
            ├─ Alibaba Cloud only: Plan
            ├─ Alibaba Cloud only: Region / server
            ├─ API key
            ├─ Base URL
            └─ Model ID

Rewrite
  Draft → Context → Pause → Before / After
```

Alibaba Cloud uses two explicit levels so credentials are not mixed:

- Plan: Pay-as-you-go, Coding Plan or Token Plan
- Region/server: only endpoints supported by the selected plan

Changing an Alibaba plan or region clears the previous key. Coding Plan and Token Plan display the provider's official usage restriction.

## Tokens

### Colour

| Token | Value | Use |
|---|---|---|
| `background` | `#F7F5FF` | App canvas |
| `surface` | `#FFFFFF` | Primary panels |
| `surfaceMuted` | `#F0EDFF` | Secondary information |
| `primary` | `#6C5CE7` | Primary action and progress |
| `primaryDark` | `#5041C9` | Selected text |
| `primarySoft` | `#E9E4FF` | Selected controls and result |
| `mint` | `#DFF7EC` | Positive information |
| `success` | `#2B6E54` | Positive foreground |
| `peach` | `#FFE9DE` | Important warning background |
| `peachStrong` | `#91482C` | Warning foreground |
| `dangerSoft` | `#FFE3E7` | Safety pause background |
| `danger` | `#A82F42` | Safety foreground |
| `ink` | `#24213A` | Main text |
| `inkMuted` | `#6F6A83` | Supporting text |
| `borderStrong` | `#8F86AE` | Interactive-control boundary |

### Type

Use the platform system font so English and both Chinese scripts render reliably.

- Hero: `28/35`, weight `800`
- Page title: `26/32`, weight `800`
- Body: `15/22`, regular
- Control: `16`, weight `700`
- Supporting text: `12/18`

Avoid negative letter spacing on Chinese text. Do not communicate state through colour alone.

### Spacing and shape

- Spacing scale: `4, 8, 12, 16, 20, 24, 32`
- Control radius: `16`
- Panel radius: `24`
- Pill radius: `999`
- Minimum interactive height: `44`
- Main content maximum width: `600`

## Components and states

### Primary button

- Purple is reserved for the main action.
- Secondary, ghost and danger variants must keep the same minimum target size.
- Disabled and loading states expose accessibility state and keep an accessible label.
- At widths below 380 px, paired actions stack vertically.

### Choice chip

- Uses a visible border in the unselected state.
- Selected state combines border, fill and accessibility state.
- Labels may wrap; no fixed width.

### Plan option

- Full-width radio card with plan title and one-line purpose.
- Exactly one Alibaba plan is selected.
- Region choices update after the plan changes.
- Empty URLs and obvious standard-key versus plan-key mismatches are prevented before saving; exact Alibaba plan and region authorisation remains provider-side.

### Feedback states

- **Offline:** show that no network request will be made.
- **AI:** name the selected external provider before the draft is sent.
- **Loading:** show the breathing/generation state and prevent duplicate requests.
- **Error:** fall back locally when possible; never present a failed provider call as AI output.
- **Safety pause:** stop the normal rewrite, provide a non-diagnostic boundary and encourage real-world support.
- **Result:** show Before, After, actions, reward and a concise “What changed” explanation in that order.

## Localisation rules

- Supported interface locales: `en`, `zh-Hant`, `zh-Hans`.
- Supported rewrite outputs: English, Traditional Chinese, Simplified Chinese and written Cantonese.
- Switching interface language must not erase the current draft, result, step or provider form.
- A new rewrite defaults to the current interface language; the user may override it.
- Provider brands, API key, Base URL, and Model ID are never translated.
- Alerts, accessibility labels, privacy text and safety text are part of the localisation scope.

## Accessibility and responsive acceptance

- Verify `320×568` and `390×844`, plus a tablet/desktop layout.
- Keep text contrast at WCAG AA where practical for the prototype.
- Preserve 44 pt touch targets and visible selected states.
- Respect the operating system's Reduce Motion setting; the pet stops continuous bobbing and breathing animation.
- Test large text for button wrapping, the provider key row and the result header.
- Ensure the complete flow remains operable with screen-reader labels.
