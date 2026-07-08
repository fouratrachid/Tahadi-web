# تحدّي (Tahadi) — Web Version

The web version of the Tahadi offline Arabic party trivia game: two contestants and one referee who holds the device, reads questions aloud, and judges answers. Fully client-side — no backend, no accounts, everything bundled.

This is a port of the React Native app in `../Tahadi`; the game logic (question selector, scoring, grapheme-safe word reversal) is shared with it. The web version has 8 categories (football, anime, movies, general, religion, geography, history, Tunisia) and ~1,400 bundled Arabic questions — more than the mobile app. The web version's rules also diverge from the mobile app: only **speed** is a timed per-team turn — every other challenge presents shared questions that either team may answer, and the referee credits whichever team actually answered:

- **whoAmI / ordering / reversed**: the referee reads/reveals the question, then taps the team that answered correctly (or ✗/skip if neither did).
- **bell**: a tabletop buzzer. Lay the phone flat on the table between the two teams — each team gets a full-width tap zone (the far zone is rotated 180° so it reads right-side up from across the table). The referee reads the question, opens the buzzer, and the first team to tap gets the question. A wrong answer hands a steal attempt to the other team.

## Stack

- **Vite 8 + React 19 + TypeScript (strict)**
- **Tailwind CSS v4** (via `@tailwindcss/vite`, theme tokens in `src/index.css`)
- **Zustand** — one strict state machine (`idle → roundIntro → playing → betweenTurns → roundResult → finished`); illegal transitions are no-ops
- Cairo font (Arabic subsets, self-hosted via `@fontsource/cairo`)
- Full **RTL** (`<html dir="rtl">` + logical Tailwind utilities)
- Sounds: synthesized WAVs in `public/sounds`, played via `HTMLAudioElement`
- Haptics: `navigator.vibrate` where supported (Android browsers)
- Persistence: `localStorage` (settings, last 20 games, used-question ids per pack)

## Responsive design

Mobile-first — the referee typically holds a phone:

- Game screens are a single fluid column (`max-w-xl/2xl`), controls ≥ 56px tall for fast tapping
- Setup, packs, and history switch to two-column grids from `sm:` up
- `min-h-dvh` layouts, no horizontal scroll at any width
- The countdown is timestamp-based (`Date.now()` + `requestAnimationFrame`) — no drift; switching tabs auto-pauses the timer and resumes with the exact remaining time

## Run

```bash
npm install
npm run dev       # http://localhost:5173
```

## Quality gates

```bash
npm run build     # tsc -b (strict) + vite build
npm run lint      # oxlint
```

## Deploy

`npm run build` produces a static `dist/` (relative base path, so it works from any subfolder). Host it on anything static — GitHub Pages, Netlify, Vercel, nginx.

## Layout

```
src/
  screens/        Home, Setup, GameFlow (intro/play/results/final), Packs, History, Settings
  components/     Button, CountdownRing, ScoreHeader, Confetti, ScreenHeader
  store/          gameStore (state machine) + settingsStore
  lib/            questionSelector, scoring, grapheme, packs, storage, soundManager, haptics
  i18n/ar.ts      every user-facing string (Arabic, MSA)
  assets/packs/   40 bundled question packs (JSON, imported at build time)
public/sounds/    6 synthesized WAV effects
```
