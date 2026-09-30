# Sightline

Sightline is an original browser-based FPS aim trainer. Sessions run locally in a Canvas range; settings, profiles, personal bests, and session history stay in browser storage.

## Run locally

```sh
npm install
npm run dev
```

Open the URL printed by Vite. Use a desktop browser and physical mouse for training. Click the range to capture the pointer; move to aim, hold left mouse for automatic weapons, right mouse to aim down sights, `R` to reload, `Shift+R` to restart, `Esc` to pause or resume, and `Space` to begin.

## Build

```sh
npm run build
```

Sensitivity profiles are centralized in `src/sensitivity.ts`. Their yaw factors are documented reference values, not guarantees: game versions, scoped multipliers, response curves, and FOV can change the match. The Generic / Custom profile lets you enter a yaw factor directly.

Generic weapon archetypes and reusable profile data live in `src/weapons.ts`; fire timing, ammunition, spread, and recoil are handled by `src/WeaponManager.ts`. Choose a profile and Precision or Weapon Feel from the dashboard before starting a drill. Custom weapon profiles are stored locally.
