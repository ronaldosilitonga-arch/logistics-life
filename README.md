# Logistics Life

A standalone, stylized isometric life simulator set in a fictional Philippine city. The first playable is a single block with an apartment, a dispatch office and a kiosk.

## Run

```sh
npm ci
npm run dev
```

Open http://localhost:8080. Use WASD or the arrow keys to walk and E to interact when a location appears below the map. Collect the parcel at Dispatch, deliver it to the Kiosk for ₱50, and rest at the Apartment to refill energy. The HUD tracks time, energy, and cash. Refresh to start over.

## Verify

```sh
npm run check
npm run build
```

The production build is in `dist/`. This prototype uses Phaser 4 graphics for the map and characters. Start in `src/game/scenes/City.ts` for gameplay and `src/style.css` for the HUD. The Phaser Vite TypeScript template is MIT-licensed. See LICENSE.

## Start in Codex Web

Create a private `logistics-life` repository from `phaserjs/template-vite-ts`. Add this prototype on a branch, merge it, and select that repository in Codex Web. Grant repository access to the GitHub connection if needed. Use `npm ci` as the environment setup command if configuring the environment manually.

Keep each task to one change and list the checks to run. Example: “In Logistics Life, add one Dispatch NPC with a short greeting. Preserve the delivery loop. Run npm run check and npm run build.”
