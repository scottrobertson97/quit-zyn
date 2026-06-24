# Zyn / Nicotine Pouch Quit App — Codex Handoff

## Project Working Title

**Pouchless**

Alternative names:

- Delay
- Quit Pouches
- NoPouch
- Off Zyn
- Break the Pouch Loop
- The Last Pouch

## One-Sentence Product Summary

A mobile-friendly web app that helps users quit Zyns/nicotine pouches by tracking use, delaying cravings, identifying triggers, and turning slips into useful quitting data instead of failure.

## Product Philosophy

This should **not** be a generic streak tracker.

Nicotine pouches are habit-heavy because they are fast, discreet, repeatable, and easy to use without ceremony. The app's job is to create a small interruption between urge and action.

The core behavior loop is:

```text
Craving appears → user opens app → app gives a small intervention → user delays/skips/logs use → app learns the pattern
```

The app should feel calm, practical, and non-judgmental.

Avoid language like:

```text
You failed.
You broke your streak.
Start over.
```

Prefer language like:

```text
Logged. That is data.
You created space between urge and action.
One pouch does not erase the pattern you're building.
```

## Core Insight

The app is not only helping the user quit nicotine.

It is helping the user train this skill:

> I can want something and not immediately obey the want.

That should shape the UX, copy, and product decisions.

---

# MVP Scope

Build a local-first Progressive Web App that works well on mobile and can later be wrapped with Capacitor for Android/iOS.

## MVP Must-Haves

1. Onboarding
2. Today dashboard
3. Log pouch use
4. Craving/delay flow
5. Daily limit tracking
6. Basic insights
7. Local persistence
8. Responsive mobile-first layout
9. PWA install support

## Explicitly Out of Scope for MVP

Do **not** build these yet:

- User accounts
- Social features
- AI coach
- Doctor/clinician portal
- Subscriptions
- App Store packaging
- Wearables
- Community feed
- Complex gamification
- Push notifications
- Medical recommendations

The MVP question is:

> Does opening this app during a craving help someone delay or avoid one pouch?

Everything else is secondary.

---

# Recommended Tech Stack

## Frontend

- React
- Vite
- TypeScript
- Tailwind CSS

## State

Use one of:

- Zustand, preferred for simple app-wide state
- Or React context if keeping dependency count very low

## Local Database

Use IndexedDB through Dexie.

Reasoning:

- Works offline
- Better than localStorage for structured logs
- Good fit for future sync
- Easy to migrate later

## Charts / Visuals

For MVP, avoid heavy chart libraries unless needed.

Use:

- Simple computed stat cards
- Lightweight SVG bars
- CSS progress bars

Add a charting library later only if insights become more complex.

## Mobile Strategy

Phase 1:

- Build as responsive web app
- Add PWA manifest
- Add service worker
- Make it installable to home screen

Phase 2:

- Wrap with Capacitor for Android/iOS
- Add native notifications later

---

# Suggested App Structure

```text
src/
  app/
    App.tsx
    routes.tsx
  components/
    Button.tsx
    Card.tsx
    MetricCard.tsx
    ProgressBar.tsx
    EmptyState.tsx
  features/
    onboarding/
      OnboardingScreen.tsx
      onboardingStore.ts
    today/
      TodayScreen.tsx
      TodayStats.tsx
    craving/
      CravingScreen.tsx
      CravingTimer.tsx
      TriggerSelector.tsx
      InterventionSelector.tsx
    pouchLog/
      LogPouchScreen.tsx
      PouchLogList.tsx
    plan/
      PlanScreen.tsx
      TaperPlan.tsx
    insights/
      InsightsScreen.tsx
      TriggerBreakdown.tsx
      RiskWindows.tsx
    journal/
      JournalScreen.tsx
  data/
    db.ts
    repositories/
      settingsRepository.ts
      pouchLogRepository.ts
      cravingLogRepository.ts
      journalRepository.ts
  domain/
    types.ts
    calculations.ts
    planEngine.ts
    insightEngine.ts
    copy.ts
  hooks/
    useToday.ts
    useSettings.ts
    useCravingFlow.ts
  styles/
    globals.css
  main.tsx
```

Keep domain logic out of components where possible.

The UI should call small hooks/services. Calculations should live in `domain/`.

---

# Core Data Types

Create these in `src/domain/types.ts`.

```ts
export type QuitMode =
  | "cold_turkey"
  | "taper"
  | "delay"
  | "awareness";

export type Trigger =
  | "stress"
  | "boredom"
  | "focus"
  | "driving"
  | "after_food"
  | "social"
  | "morning"
  | "night"
  | "other";

export type Intervention =
  | "water"
  | "walk"
  | "breathing"
  | "gum"
  | "brush_teeth"
  | "journal"
  | "delay_timer"
  | "message_someone";

export type CravingOutcome =
  | "skipped"
  | "used"
  | "still_waiting";

export type UserSettings = {
  id: "default";
  quitMode: QuitMode;
  pouchStrengthMg: number;
  baselinePouchesPerDay: number;
  dailyLimit: number;
  quitDate?: string;
  costPerCan?: number;
  pouchesPerCan?: number;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PouchLog = {
  id: string;
  timestamp: string;
  strengthMg: number;
  trigger?: Trigger;
  planned: boolean;
  note?: string;
};

export type CravingLog = {
  id: string;
  startedAt: string;
  endedAt?: string;
  intensity: number;
  trigger: Trigger;
  outcome: CravingOutcome;
  intervention?: Intervention;
  note?: string;
};

export type JournalEntry = {
  id: string;
  timestamp: string;
  prompt: string;
  body: string;
  relatedCravingId?: string;
};
```

---

# IndexedDB Schema

Create `src/data/db.ts`.

Use Dexie tables:

```ts
settings: UserSettings
pouchLogs: PouchLog
cravingLogs: CravingLog
journalEntries: JournalEntry
```

Suggested Dexie setup:

```ts
import Dexie, { Table } from "dexie";
import type {
  UserSettings,
  PouchLog,
  CravingLog,
  JournalEntry,
} from "../domain/types";

export class PouchlessDb extends Dexie {
  settings!: Table<UserSettings, string>;
  pouchLogs!: Table<PouchLog, string>;
  cravingLogs!: Table<CravingLog, string>;
  journalEntries!: Table<JournalEntry, string>;

  constructor() {
    super("pouchless_db");

    this.version(1).stores({
      settings: "id, quitMode, onboardingCompleted, updatedAt",
      pouchLogs: "id, timestamp, trigger, planned",
      cravingLogs: "id, startedAt, trigger, outcome, intensity",
      journalEntries: "id, timestamp, relatedCravingId",
    });
  }
}

export const db = new PouchlessDb();
```

---

# Screens

## 1. Onboarding Screen

Purpose:

Collect enough information to create a starting plan.

Fields:

- Average pouches per day
- Usual nicotine strength in mg
- Cost per can, optional
- Pouches per can, optional, default 15
- Quit mode
- Daily limit
- Optional quit date
- Main triggers

Quit mode options:

```text
Awareness — Track first, no pressure.
Delay — Increase the time between urge and pouch.
Taper — Reduce daily pouch count over time.
Cold turkey — Quit fully and track nicotine-free time.
```

Acceptance criteria:

- User can complete onboarding in under 2 minutes.
- Settings persist locally.
- App routes to Today screen after onboarding.
- If onboarding is completed, app should skip onboarding on reload.

---

## 2. Today Dashboard

Purpose:

This is the home screen and daily command center.

Display:

- Time since last pouch
- Pouches used today
- Daily limit
- Remaining pouches today
- Pouches avoided, estimated
- Estimated money saved
- Primary button: `I want one`
- Secondary button: `Log pouch`

Suggested layout:

```text
[Time since last pouch]
[Pouches today] [Daily limit] [Money saved]

Primary CTA:
I want one

Secondary:
Log pouch

Small message:
You do not have to win the whole day. Just create space right now.
```

Acceptance criteria:

- Stats update immediately after logging a pouch or craving.
- Daily values reset based on local date.
- Primary CTA starts craving flow.
- Secondary CTA opens quick pouch logging.

---

## 3. Craving Flow

Purpose:

Interrupt the automatic pouch habit.

Flow:

1. User taps `I want one`.
2. App asks craving intensity from 1–10.
3. App asks trigger.
4. App suggests an intervention.
5. App starts a delay timer.
6. After the timer, user chooses:
   - `I skipped it`
   - `I used one`
   - `Keep waiting`

Default delay timer:

- 5 minutes for MVP
- Future enhancement: adaptive timer based on quit mode

Suggested copy:

```text
You are not saying never.
You are saying not automatically.
```

Interventions:

- Drink cold water
- Take a short walk
- Chew gum
- Brush teeth
- Box breathing
- Journal one sentence
- Message someone
- Wait 5 minutes

Acceptance criteria:

- A craving log is created when the flow starts.
- The craving log is updated when user chooses an outcome.
- If outcome is `used`, user can also create a pouch log.
- User can exit the flow without breaking the app state.
- Timer works without requiring background notifications.

---

## 4. Log Pouch Screen

Purpose:

Let the user quickly log use without shame.

Fields:

- Strength in mg
- Trigger
- Planned vs impulsive
- Optional note

Suggested copy after logging:

```text
Logged. That is information, not a reset.
```

Acceptance criteria:

- User can log a pouch in under 15 seconds.
- Log persists locally.
- Today dashboard updates immediately.
- App does not use failure language.

---

## 5. Plan Screen

Purpose:

Show and adjust the quitting strategy.

Display:

- Quit mode
- Current daily limit
- Baseline usage
- Quit date, if set
- Simple taper schedule, if using taper mode

Plan modes:

### Awareness Mode

No limit enforcement.

Goal:

```text
Learn when and why you use.
```

### Delay Mode

Goal is to increase time between craving and use.

Example ladder:

```text
Day 1: Delay by 2 minutes
Day 2: Delay by 5 minutes
Day 3: Delay by 10 minutes
Day 4: Skip one pouch
Day 5: Move first pouch later
Day 6: Stay under daily limit
Day 7: Create one nicotine-free block
```

### Taper Mode

Reduce daily limit over time.

Example:

```text
Baseline: 8/day
Week 1: 6/day
Week 2: 4/day
Week 3: 2/day
Week 4: 0/day
```

### Cold Turkey Mode

Track nicotine-free time and cravings survived.

Acceptance criteria:

- User can change quit mode.
- User can edit daily limit.
- Changes persist locally.
- UI clearly states that this app is behavioral support, not medical advice.

---

## 6. Insights Screen

Purpose:

Help the user see patterns.

MVP insights:

- Most common trigger
- Highest-risk time window
- Pouches used today / week
- Cravings skipped vs used
- Average craving intensity
- Planned vs impulsive use

Example insight copy:

```text
Your most common trigger is stress.
Your highest-risk window is 2 PM–5 PM.
You skip more cravings when you delay at least 5 minutes.
```

Acceptance criteria:

- Insights are computed from local logs.
- Empty states are useful when not enough data exists.
- Do not overstate certainty with small sample sizes.

Example empty state:

```text
Log a few cravings and pouches. Patterns usually appear after 3–5 days.
```

---

## 7. Journal Screen

Purpose:

Optional reflection for users who want to understand the craving beneath the craving.

Prompts:

- What did this craving actually want?
- Was I tired, stressed, bored, lonely, or overstimulated?
- What would have helped five minutes earlier?
- What pattern am I starting to notice?
- What did I do today that made quitting easier?

Acceptance criteria:

- User can create journal entries.
- Entries persist locally.
- Entries can optionally link to a craving.
- Journal is optional and not forced into the main flow.

---

# Domain Logic

Create `src/domain/calculations.ts`.

Needed functions:

```ts
getPouchesForDate(logs, date): PouchLog[]
getCravingsForDate(logs, date): CravingLog[]
getPouchesUsedToday(logs): number
getNicotineMgToday(logs): number
getRemainingDailyPouches(settings, logs): number
getTimeSinceLastPouch(logs): DurationLike
getEstimatedMoneySaved(settings, logs): number
getSkippedCravingCount(cravingLogs): number
getUsedCravingCount(cravingLogs): number
```

Important:

- Keep date handling clean.
- Use local dates for daily reset.
- Avoid hidden timezone bugs.
- Consider adding a small date utility file.

---

# Insight Engine

Create `src/domain/insightEngine.ts`.

MVP functions:

```ts
getMostCommonTrigger(cravingLogs, pouchLogs)
getHighestRiskTimeWindow(cravingLogs, pouchLogs)
getCravingOutcomeRate(cravingLogs)
getAverageCravingIntensity(cravingLogs)
getPlannedVsImpulsiveRatio(pouchLogs)
```

For highest-risk window, group events by rough blocks:

```ts
morning: 5 AM–11 AM
afternoon: 11 AM–5 PM
evening: 5 PM–10 PM
night: 10 PM–5 AM
```

Do not pretend this is medically precise. It is behavioral pattern detection.

---

# Copy Guidelines

The app should sound like a calm coach, not a drill sergeant.

## Good Copy

```text
Create a little space.
You can decide again in five minutes.
Logged. That is data.
You are practicing delay, not perfection.
One pouch does not erase the work.
The urge can be loud without being in charge.
```

## Avoid

```text
You failed.
You lost your streak.
Bad job.
You ruined your progress.
You relapsed.
```

## Medical Disclaimer Copy

Use this somewhere in onboarding/settings:

```text
This app provides behavioral tracking and habit support. It is not medical advice. If you are using nicotine heavily, pregnant, managing a health condition, or considering medications to quit, talk with a doctor or pharmacist.
```

Do not recommend specific medications or doses.

---

# UX Priorities

## Mobile First

This app will mostly be used during cravings, not during calm planning.

Therefore:

- Big buttons
- Low typing
- Fast logging
- Works one-handed
- Calm colors
- No clutter
- No shame copy
- The `I want one` button should always be easy to find

## Craving Mode Should Be Fast

The user should be able to start a craving intervention in under 10 seconds.

## Slips Should Not Feel Catastrophic

A slip should produce insight, not punishment.

---

# PWA Requirements

Add:

- `manifest.webmanifest`
- App icon placeholders
- Service worker
- Offline shell support
- Mobile viewport meta
- Theme color
- Installable app name

Suggested manifest:

```json
{
  "name": "Pouchless",
  "short_name": "Pouchless",
  "description": "A calm quitting companion for nicotine pouches.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#111827",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

For the MVP, placeholder icons are acceptable.

---

# Suggested Navigation

Use bottom navigation on mobile:

```text
Today | Plan | Insights | Journal | Settings
```

But keep the main action available from Today.

For MVP, routing can be simple:

- React Router
- Or internal state-based screen switching

Prefer React Router if the project will grow.

---

# Initial Tickets

## Ticket 1 — Initialize Project

Create a Vite React TypeScript app with Tailwind.

Acceptance criteria:

- App runs locally.
- TypeScript configured.
- Tailwind configured.
- Basic responsive shell exists.
- No unused starter content remains.

---

## Ticket 2 — Add Domain Types and Dexie Database

Implement `types.ts` and `db.ts`.

Acceptance criteria:

- Dexie database initializes.
- Tables exist for settings, pouch logs, craving logs, and journal entries.
- Types compile without errors.

---

## Ticket 3 — Build Onboarding

Create onboarding flow for baseline usage and quit mode.

Acceptance criteria:

- User can enter baseline pouches/day.
- User can enter nicotine strength.
- User can select quit mode.
- User can set daily limit.
- Settings persist.
- User routes to Today after completion.

---

## Ticket 4 — Build Today Dashboard

Create dashboard with main stats and CTAs.

Acceptance criteria:

- Shows pouches used today.
- Shows daily limit.
- Shows remaining pouches.
- Shows time since last pouch.
- Has `I want one` CTA.
- Has `Log pouch` CTA.

---

## Ticket 5 — Build Quick Pouch Logging

Create fast pouch logging screen/modal.

Acceptance criteria:

- User can log strength.
- User can select trigger.
- User can mark planned vs impulsive.
- User can add optional note.
- Log persists.
- Dashboard updates.

---

## Ticket 6 — Build Craving Flow

Create the `I want one` flow.

Acceptance criteria:

- User selects intensity.
- User selects trigger.
- App suggests intervention.
- App starts 5-minute timer.
- User can mark `I skipped it`, `I used one`, or `Keep waiting`.
- Craving log persists.
- If `I used one`, user can create associated pouch log.

---

## Ticket 7 — Add Plan Screen

Create quit plan screen.

Acceptance criteria:

- Shows current mode.
- Shows daily limit.
- Allows editing daily limit.
- Shows mode-specific explanation.
- Persists changes.

---

## Ticket 8 — Add Insights Screen

Create basic insights from logs.

Acceptance criteria:

- Shows most common trigger.
- Shows highest-risk time block.
- Shows skipped vs used cravings.
- Shows average craving intensity.
- Shows empty states when data is insufficient.

---

## Ticket 9 — Add Journal Screen

Create optional journal.

Acceptance criteria:

- User can create entry.
- User can view prior entries.
- Entries persist locally.
- Journal prompts are available.

---

## Ticket 10 — Add PWA Support

Make the app installable.

Acceptance criteria:

- Manifest exists.
- Service worker exists.
- App can be installed as PWA in supported browsers.
- App shell works offline.

---

# Future Enhancements

Do not build these until MVP is working.

## Notifications

Possible reminders:

- Morning plan reminder
- High-risk window warning
- Delay timer completion
- End-of-day reflection

Implementation later:

- Web Push for PWA where supported
- Capacitor local notifications for native builds

## Adaptive Delay Ladder

Increase suggested delay over time.

Example:

```text
Day 1: 2 minutes
Day 2: 5 minutes
Day 3: 10 minutes
Day 4: 15 minutes
```

## Trigger Protection Plans

For each trigger, let user define a replacement plan.

Example:

```text
When I crave during driving, I will keep gum in the car.
When I crave during work stress, I will stand up and drink water first.
```

## Export Data

Allow CSV/JSON export.

Useful for:

- Personal review
- Doctor/therapist conversations
- Data portability

## Sync

Add Supabase later if users want cross-device syncing.

Do not add sync before local MVP is useful.

---

# Development Principles for Codex

Follow these rules while implementing:

1. Prefer simple, readable code over clever abstractions.
2. Keep domain calculations separate from UI components.
3. Make mobile interactions fast and thumb-friendly.
4. Do not use shame-based copy.
5. Do not make medical claims.
6. Do not add authentication in MVP.
7. Do not add server dependencies in MVP.
8. Make persistence local-first.
9. Use TypeScript types to clarify intent.
10. Keep components small and named around user intent.

---

# First Implementation Goal

Build the smallest working vertical slice:

```text
Onboarding → Today dashboard → I want one → timer → skipped/used outcome → saved locally → dashboard updates
```

Once that works, add plan editing, insights, journal, and PWA support.

