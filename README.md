# Habit Tracker

React Native + Expo mobile app for tracking personal goals: unlimited goals
with deadlines and local reminder notifications, plus a daily completion
streak. Fully local-first — no backend, no login, all data persisted on
the device with AsyncStorage.

Built for Exposure AI Academy · Project 9.

## Features

- **Goal management** — create, edit, delete, and complete goals with an
  undo option. Goals are grouped into Active, Overdue, and Completed views.
- **Deadline reminders** — schedule a local device notification a chosen
  number of days before each goal's deadline, via `expo-notifications`.
  Notifications are automatically rescheduled on edit and cancelled on
  delete/complete.
- **Daily streak** — current and best streak are computed from goal
  completion dates; completing at least one goal keeps the streak alive,
  a full day with no completions breaks it.
- **Persistence** — goals, notification IDs, and streak data are stored in
  AsyncStorage and survive app restarts.

## Tech stack

| Part | Package |
| --- | --- |
| Framework | React Native + Expo (SDK 54) |
| Navigation | Expo Router |
| Data | `@react-native-async-storage/async-storage` |
| Notifications | `expo-notifications` (local scheduled notifications) |
| Date/time picker | `@react-native-community/datetimepicker` |

## Project structure

```
app/                  Expo Router screens (tabs, goal-form modal)
components/           Reusable UI (goal-card, streak-badge, ...)
context/              GoalsProvider — shared goal/streak state + mutators
lib/                  Pure logic: storage, streak calculation, notifications, formatting
types/                Shared TypeScript types
```

## Setup

```bash
npm install
```

## Run (Expo Go)

```bash
npx expo start --tunnel
```

Scan the QR code with the Expo Go app (iOS: Camera app or Expo Go; Android:
Expo Go's "Scan QR Code"). `--tunnel` is needed on networks with client
isolation (e.g. most school/corporate Wi-Fi); use plain `npx expo start` if
your phone and computer are on the same open LAN.

## Local development build

Only needed if you add a package with native code — everyday JS/TS/style
changes don't require a rebuild, `npx expo start` is enough.

```bash
npx expo install expo-dev-client

# iOS (requires macOS + Xcode)
npx expo run:ios

# Android (requires Android Studio / SDK)
npx expo run:android
```

## EAS Build

```bash
npm install -g eas-cli
eas login
eas build:configure

# Android preview build (installable APK)
eas build --profile preview --platform android

# iOS preview build (requires a paid Apple Developer account for a
# physical-device build; an Expo Go demo is used otherwise)
eas build --profile preview --platform ios
```

## Testing checklist

- Create a goal with a deadline ~2 minutes out and a reminder set to fire
  immediately — confirm the notification permission prompt and that the
  notification actually arrives.
- Edit a goal's deadline — confirm the old reminder is cancelled and a new
  one is scheduled (no duplicates).
- Complete a goal, then undo — confirm it moves between Completed/Active
  and the streak updates correctly both ways.
- Delete a goal — confirm the confirmation dialog and that its reminder is
  cancelled.
- Force-quit and reopen the app — confirm goals, streak, and completed
  state are all restored.
- Let an active goal's deadline pass without completing it — confirm it
  moves into the Overdue tab.
