# CLAUDE.md

This is a task tracking application, where you can set daily (recurring tasks) and they appear daily on the screen. Users can create new tasks and it resets when the day is over. Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed. This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

## Commands

```bash
# Start development server
npm start

# Run on iOS (requires Xcode)
npm run ios

# Run on Android (requires Android Studio)
npm run android

# Lint and format check
npm run lint

# Auto-fix lint and formatting
npm run format

# Prebuild native directories
npm run prebuild
```

This is an Expo managed workflow project. Use `expo-dev-client` for development builds on device.

## Environment Variables

Required in `.env` (prefixed `EXPO_PUBLIC_` for Expo to expose to the client):
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`

## Architecture

**Entry point:** `App.tsx` — handles auth state and routing between three app states:
1. Not logged in → `SignUpScreen`
2. Logged in but no profile → `OnboardingScreen`
3. Fully onboarded → `DashboardScreen` (4-tab layout: Today, Tasks, Grocery, Profile)

**Auth flow:**
- Google Sign-In via `@react-native-google-signin/google-signin` (native)
- Google ID token exchanged for a Supabase session via `supabase.auth.signInWithIdToken`
- `App.tsx` subscribes to `supabase.auth.onAuthStateChange` as the single source of truth for session state
- `src/context/GoogleSigninService.ts` — singleton service wrapping `GoogleSignin`
- `src/context/authContext/authContext.tsx` — `useAuth()` hook exposing `signInWithGoogle` and `signOut`

**Backend:** Supabase (`lib/supabase.ts`). Session persisted via `AsyncStorage`.

Supabase tables:
| Table | Key columns | Notes |
|---|---|---|
| `users` | `id, email, first_name, last_name, onboarded` | Auth + profile |
| `tasks` | `id, user_id, name, priority, is_daily, time, completed_at` | RLS per user |
| `grocery_lists` | `id, user_id, name` | RLS per user; cascade deletes items |
| `grocery_items` | `id, list_id, name, quantity, checked` | RLS via list ownership |

**Dashboard tabs** (`src/components/BottomTabBar.tsx`):
- **Today** (`TodayScreen`) — shows all tasks due today; daily tasks always appear, non-daily tasks only appear on their creation date
- **Tasks** (`TasksScreen`) — full task list with add/edit/delete
- **Grocery** (`GroceryScreen`) — multi-list grocery manager; two-level in-tab navigation (lists → items); lists persist until deleted
- **Profile** (`ProfileScreen`) — user profile and sign-out

**Task reset logic** (`src/api/tasks/tasks.ts`):
- Non-daily tasks are filtered out of `fetchTasks` if `created_at` is not today (local date). Old tasks are kept in the DB — they just don't appear.
- Daily tasks reset their `completed` state each day via `isSameLocalDay(completed_at, now)`.
- `useTasks` re-fetches on app foreground (`AppState`) and on connectivity restore (`NetInfo`) to keep the view fresh after midnight or network gaps.

**Offline support** (`src/utils/pendingQueue/`, `src/api/tasks/syncQueue.ts`):
- All task CRUD (create, complete, update, delete) works offline.
- Offline operations are queued in AsyncStorage (`@strikeItOff:pendingOperations`) as ordered `PendingOperation` entries.
- On reconnect or app foreground, `syncPendingOperations` flushes the queue to Supabase in order, resolving temp IDs (e.g. `pending-xxx`) to real Supabase UUIDs for any chained operations.
- Pending tasks appear in state with `pending: true` and a temp ID until synced.
- Grocery does not currently have offline support.

**API layer pattern** (`src/api/*/`):
- Each module exports pure mapping functions (`rowToX`) and async Supabase functions returning `ApiResponse<T>` (from `src/utils/apiResponse/apiResponse.tsx`).
- Hooks (`src/hooks/`) consume the API layer and own all state. No business logic in hooks — just state + API calls.
- `ApiResponse<T>` is a discriminated union: `{ status: 'success', data: T } | { status: 'error', message: string }`.
- Always use `withApi`, `successResponse`, and `errorResponse` from `src/utils/apiResponse/apiResponse.tsx` for all API functions. Never inline try/catch or build custom response shapes.

**Styling:** NativeWind (Tailwind CSS for React Native). Custom design tokens defined in `tailwind.config.js`:
- Color palette: warm neutral tones (`surface`, `primary`, `secondary`, `on-surface-variant`, `outline`)
- Fonts: `font-manrope`, `font-manrope-medium`, `font-manrope-semibold`, `font-jetbrains-mono`
- Full design system documented in `DESIGN.md` (colors, typography, spacing, elevation)
- Import `'./global.css'` in `App.tsx` activates NativeWind

All screens live in `src/screens/tabs/`. Shared components in `src/components/`.
All utilities, context, hooks live in `src/`.
