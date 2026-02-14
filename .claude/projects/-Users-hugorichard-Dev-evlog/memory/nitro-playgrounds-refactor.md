# Nitro Playgrounds Refactor — Status & Known Issues

## Goal

Reorganize the two Nitro playground apps:
- **`apps/nitro-playground`** = default = Nitro v3 (renamed from `nitro-v3-playground`)
- **`apps/nitro-v2-playground`** = new = actual Nitro v2 with `nitropack` + `h3` (converted from old `nitro-playground`)

## What's Done

### Directory renames (git mv)
- `apps/nitro-playground` → `apps/nitro-v2-playground`
- `apps/nitro-v3-playground` → `apps/nitro-playground`

### `apps/nitro-playground` (v3, default) — branding updates
- `package.json` name: `evlog-nitro-playground`
- `nitro.config.ts` service: `nitro-playground`
- HTML titles: dropped "v3"
- Deleted `bun.lock`

### `apps/nitro-v2-playground` — converted to actual Nitro v2
- `package.json`: `nitropack` + `h3` deps, `nitropack dev/build` scripts
- `nitro.config.ts`: `defineNitroConfig` from `nitropack/config`, `evlog` from `evlog/nitro`
- All routes: `defineEventHandler`/`createError` from `h3`, `useLogger` from `evlog/nitro`
- Deleted unused `index.html`, `public/styles.css`

### Root `package.json`
- `dev:nitro:v3` → `dev:nitro:v2` (filter: `evlog-nitro-v2-playground`)

### Tests & Build
- All 399 tests pass
- Package builds successfully

## Known Issue: `#nitro-internal-virtual/error-handler` Crash

### Root Cause

In `nitropack dev` mode, the evlog plugin (`packages/evlog/dist/nitro/plugin.mjs`) is loaded **externally** by the Worker thread — NOT bundled by rollup. When the plugin does:

```ts
import { defineNitroPlugin, useRuntimeConfig } from 'nitropack/runtime'
```

Node.js loads `nitropack/runtime/index.mjs` which re-exports from `./internal/app.mjs`. That file has:

```ts
import errorHandler from "#nitro-internal-virtual/error-handler";
```

This `#nitro-internal-virtual/*` import is a **rollup virtual module** that only exists during rollup builds. Outside rollup → crash.

### Evidence

Line 23 of `.nitro/dev/index.mjs` (the dev build output) proves the plugin is external:
```js
import _hash from 'file:///path/to/packages/evlog/dist/nitro/plugin.mjs';
```

### Fix Applied (partial)

Changed imports in `src/nitro/plugin.ts` and `src/nitro/errorHandler.ts` to use specific subpath imports that don't have virtual module dependencies:

```ts
// Before (crashes when loaded externally):
import { defineNitroPlugin, useRuntimeConfig } from 'nitropack/runtime'
import { defineNitroErrorHandler } from 'nitropack/runtime'

// After (safe — no virtual deps in these files):
import { defineNitroPlugin } from 'nitropack/runtime/internal/plugin'
import { defineNitroErrorHandler } from 'nitropack/runtime/internal/error/utils'
```

For `useRuntimeConfig`: removed static import, use `process.env.__EVLOG_CONFIG` as primary (set by module, inherited by Worker threads), with lazy dynamic `import('nitropack/runtime/internal/config')` fallback for production.

### Test Results After Fix

- **v2 playground**: All 3 endpoints work (`/api/test/success`, `/api/test/error`, `/api/test/wide-event`), evlog logging active with pretty printing.
- **v3 playground**: Works when tested directly with `npx nitro dev`. Shows warning "Nitro runtime imports detected without a builder or Nitro plugin. A stub implementation will be used." but endpoints function correctly.

### Remaining Issue

The user reports the v3 playground (`nitro-playground`) still shows the `#nitro-internal-virtual/error-handler` error in the browser. However:

1. The v3 plugin (`dist/nitro/v3/plugin.mjs`) imports from `nitro` and `nitro/runtime-config`, NOT `nitropack/runtime`
2. The v3 errorHandler (`dist/nitro/v3/errorHandler.mjs`) imports from `nitro`, NOT `nitropack/runtime`
3. Direct testing with `npx nitro dev` works correctly

**Possible causes:**
- Stale `.nitro`/`.output` directories — try `rm -rf apps/nitro-playground/.nitro apps/nitro-playground/.output`
- Stale processes on the port — kill with `lsof -ti:3000 | xargs kill`
- Turbo cache — try `bun run dev:nitro --force`
- `bun install` might need a fresh run

## Architecture Notes

### How nitropack v2 dev mode works
1. `nitropack dev` calls `createNitro()` → loads modules → module `setup()` runs
2. Rollup builds the app into `.nitro/dev/index.mjs`
3. A Worker thread loads the built output
4. Built output imports plugins as **external** file:// URLs (not bundled)
5. Plugins import from `nitropack/runtime` → barrel triggers `app.mjs` → virtual module crash

### Safe vs unsafe imports from nitropack
| Import | Safe externally? | Has virtual deps? |
|---|---|---|
| `nitropack/runtime` (barrel) | NO | Yes (`app.mjs` → `#nitro-internal-virtual/*`) |
| `nitropack/runtime/internal/plugin` | YES | No |
| `nitropack/runtime/internal/error/utils` | YES | No |
| `nitropack/runtime/internal/config` | NO | Yes (`#nitro-internal-virtual/app-config`) |

### Config resolution in plugin
- **Dev mode**: `process.env.__EVLOG_CONFIG` (set by module, inherited by Worker)
- **Production**: `useRuntimeConfig().evlog` (embedded in rollup bundle as inline constant)

## File Inventory

### Modified evlog source files
- `packages/evlog/src/nitro/plugin.ts` — changed imports
- `packages/evlog/src/nitro/errorHandler.ts` — changed imports

### Modified/created playground files
- `apps/nitro-playground/` — renamed from nitro-v3-playground, updated names/titles
- `apps/nitro-v2-playground/` — renamed from nitro-playground, converted to nitropack v2
- `package.json` (root) — `dev:nitro:v3` → `dev:nitro:v2`
