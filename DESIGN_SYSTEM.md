# Melo UI System — Warm Desk Companion

Melo should feel like a small companion sitting beside a student's notebook: calm, authored and practical without looking clinical. The interface uses warm paper-like surfaces, one purple accent and quiet dividers instead of stacking pastel cards for every piece of information.

## Product principles

1. **One primary action per screen** — the purple button advances the wellness flow; provider configuration stays secondary.
2. **Explain data movement before generation** — offline and provider modes use different, explicit notices.
3. **Reward without pressure** — Calm Stars celebrate completed pauses, with no streak loss, hunger or guilt mechanics.
4. **Interface language is separate from message language** — English, Traditional Chinese and Simplified Chinese localise the app; Cantonese remains an optional rewrite output.
5. **Bring your own model** — Melo provides no API key, model access, credits or default Model ID.
6. **Hierarchy before decoration** — related status belongs in one divided list; colour is reserved for action, state and safety.

## Information architecture

```text
Home
  ├─ Start a calm rewrite
  ├─ Melo Chat
  └─ Settings
       ├─ Interface language
       └─ Model connection
            ├─ Service disclosure
            ├─ Alibaba Cloud only: Plan & server disclosure
            └─ Connection details disclosure
                 ├─ API key
                 ├─ Base URL
                 ├─ Model ID
                 └─ Image capability

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
| `background` | `#F6F3EC` | Warm paper canvas |
| `lavenderGlow` | `#EEE9FF` | Subtle top-of-screen brand atmosphere that fades into the warm canvas |
| `surface` | `#FFFEFA` | Controls and grouped information |
| `surfaceMuted` | `#F0EDE6` | Quiet secondary information |
| `primary` | `#6751C8` | Primary action and progress |
| `primaryDark` | `#4B3AA3` | Selected text and small section labels |
| `primarySoft` | `#EEEBF8` | Result emphasis where a fill is useful |
| `mint` | `#E7F0EA` | Restrained positive information |
| `success` | `#2B6E54` | Positive foreground |
| `peach` | `#F5E8DF` | Restrained warning background |
| `peachStrong` | `#86462E` | Warning foreground |
| `dangerSoft` | `#FFE3E7` | Safety pause background |
| `danger` | `#A82F42` | Safety foreground |
| `ink` | `#262232` | Main text |
| `inkMuted` | `#706A77` | Supporting text |
| `border` | `#DED8CC` | Warm divider and panel boundary |
| `borderStrong` | `#98909F` | Interactive-control boundary with at least 3:1 contrast on `surface` |

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
- Small radius: `8`
- Control radius: `12`
- Panel radius: `18`
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
- Selected state combines a heavier accent border, text colour and accessibility state without adding another large tinted surface.
- Labels may wrap; no fixed width.
- Settings uses a two-column tile variant for provider services; compact categorical choices may remain pills. Mutually exclusive groups expose `radiogroup` and `radio` semantics.

### Home status list

- Connection and Calm Stars share one surface with a thin divider.
- Home names the configured provider but does not expose the exact Model ID; exact attribution remains in Settings, results and successful Chat bubbles.
- Do not turn connection, rewards and privacy notes into separate coloured promotion cards.

### Plan option

- Full-width radio card with plan title and one-line purpose.
- Exactly one Alibaba plan is selected.
- Region choices update after the plan changes.
- Empty URLs and obvious standard-key versus plan-key mismatches are prevented before saving; exact Alibaba plan and region authorisation remains provider-side.
- Selected rows use border and radio state, not a large tinted fill.

### Settings form

- One page title with Language and Model connection as smaller sections; do not stack competing page titles.
- Service, Alibaba Plan & server, Connection details and About use progressive disclosure. A saved configuration opens in its compact summary state.
- The primary Save action stays in a fixed bottom dock; removing a key is a secondary destructive text action inside Connection details.
- Neutral grouped form on the warm canvas; explanatory notes stay concise.
- Use mint, peach or lavender fills only when semantic state requires them.
- Provider selection, plan selection and connection details must read in that order.

### Chat surface

- Chat owns a single header; the global Home header is hidden while chatting.
- Melo responses keep the avatar and white bubble. Provider and exact model attribution appears below the bubble as quiet metadata, never as a green success headline.
- The configured state uses a neutral purple marker because a saved key is not proof of live availability.
- Rewrite-latest and clear-history actions stay compact above the composer. Image guidance appears only when the user tries an unavailable attachment action.
- White controls and bubbles remain solid over a restrained lavender-to-warm-white background gradient.

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
