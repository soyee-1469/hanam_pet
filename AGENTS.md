# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# Production deploy

https://hanam-pet.vercel.app deploys from **`main` only**.
When a UI/UX change is ready to verify, merge to `main` (do not leave it only on a draft PR).
Do not wait for the user to say “deploy”.

## Cursor Cloud specific instructions

- This is an Expo Router / React Native app. In the cloud VM (no simulator/emulator), run the **web** target only: `npx expo start --web` (Metro on port 8081). Scripts live in `package.json`; `npm run web` also works.
- Data is client-side only (AsyncStorage / localStorage on web) — there is **no backend service** to run. A single dev server is the whole app.
- New users must complete the onboarding flow (intro → terms → profile → pet select → restore code) before reaching the main pet home. To reset onboarding on web, clear the browser's localStorage.
- There is **no lint script**. `npx tsc --noEmit` reports many **pre-existing** type errors; these do NOT block the Metro web bundle (it compiles and serves HTTP 200). Do not treat them as environment breakage.
- Production web build (Vercel): `npm run export:web` (`npx expo export -p web`) → outputs to `dist/`.
