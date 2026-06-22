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
3. Fully onboarded → Dashboard (placeholder)
4. `src/screens` and `src/components` has all the components and screens and tabs 

**Auth flow:**
- Google Sign-In via `@react-native-google-signin/google-signin` (native)
- Google ID token exchanged for a Supabase session via `supabase.auth.signInWithIdToken`
- `App.tsx` subscribes to `supabase.auth.onAuthStateChange` as the single source of truth for session state
- `src/context/GoogleSigninService.ts` — singleton service wrapping `GoogleSignin`
- `src/context/authContext.tsx` — `useAuth()` hook exposing `signInWithGoogle` and `signOut`

**Backend:** Supabase (`lib/supabase.ts`). Session persisted via `AsyncStorage`. Profiles stored in a `profiles` table (`id, first_name, last_name`); onboard status checked against both `user_metadata` and the `profiles` table.

**Styling:** NativeWind (Tailwind CSS for React Native). Custom design tokens defined in `tailwind.config.js`:
- Color palette: warm neutral tones (`surface`, `primary`, `secondary`, `on-surface-variant`, `outline`)
- Fonts: `font-manrope`, `font-manrope-medium`, `font-manrope-semibold`, `font-jetbrains-mono`
- Import `'./global.css'` in `App.tsx` activates NativeWind

All screens live in `src/screens/`. Shared components in `src/components/`.
All utilities, context, hooks live in `src/`.
