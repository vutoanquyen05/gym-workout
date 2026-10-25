This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run test, lint, and typecheck before declaring any task done:
```bash
npm test
npx tsc --noEmit
npm run lint
```

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Native & Security Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
- Supabase migrations are prepared but not applied or runtime-verified. Never execute SQL, connect to or mutate Supabase Cloud, or reset a database without explicit approval for that operation.

## Gym Workout Workspace Steel Rules

- **Strict 8-File Documentation Lock:** The project documentation is strictly locked to **EXACTLY 8 core files** under `docs/`:
  1. [`docs/rule.md`](./docs/rule.md) (Working rules, Git workflow, technical safety)
  2. [`docs/mindmap.md`](./docs/mindmap.md) (Unified Roadmap 9 Phase, 96-task audit matrix, Work Log)
  3. [`docs/baocao.md`](./docs/baocao.md) (Product Vision, 8 E2E business flows, overall architecture)
  4. [`docs/risks-decisions.md`](./docs/risks-decisions.md) (Decision Register OD-01..06, D-MT & risks)
  5. [`docs/supabase-schema.md`](./docs/supabase-schema.md) (PostgreSQL Schema, GM-1..5 DDL, RLS & RBAC Multi-Tenancy)
  6. [`docs/data-offline.md`](./docs/data-offline.md) (Offline-First architecture, sync contract, SQLite v1 code status)
  7. [`docs/design-system.md`](./docs/design-system.md) (Design system, Dark/Light palette, ThemeProvider, navigation)
  8. [`docs/testing-acceptance.md`](./docs/testing-acceptance.md) (Testing strategy, 8 test suites in `__tests__/`, acceptance criteria)
  - **NO OTHER `.md` FILES:** The rule of creating `[tenmodule].md` is **ABOLISHED**. Strictly FORBIDDEN to create any new `.md` files in `docs/` or `.bak`, `.tmp`, `-copy` files anywhere.
- **Focus Roadmap & Single Task Rule:**
  - Before starting any session, MUST read `docs/rule.md` and `docs/mindmap.md`.
  - Only work on **EXACTLY 1 task** currently at `[ ]` that was assigned. No spreading across multiple modules.
  - When completing the task, MUST update status to `[x]` and log summary (Files modified, key logic, test results) into `## 5. NHẬT KÝ CẬP NHẬT TÀI LIỆU & WORK LOG` in `docs/mindmap.md`.
- **Strict Git Feature Branch Workflow:**
  - **NEVER** work or commit directly on `main`.
  - Every new task must branch off `main` following format: `feat/<task-id>-<desc>` or `fix/...`, `docs/...`.
  - **NEVER** create `backup/...` branches.
  - Only commit after verifying all session requirements and passing `npm test` + `npx tsc --noEmit`.
  - **NEVER** merge into `main` without explicit approval from the Project Owner.
