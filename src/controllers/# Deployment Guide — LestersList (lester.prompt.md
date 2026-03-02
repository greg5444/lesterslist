# Deployment Guide — LestersList (lesterslist.com)

## Overview

- **Host**: Hostinger hPanel (LiteSpeed web server)
- **Node.js**: 18.x
- **Database**: MySQL at `mysql.hostinger.com`
- **Deploy flow**: Push to `testbranch` on GitHub → Hostinger auto-deploys

---

## Architecture

```
src/           ← source (JS with TypeScript checking)
dist/          ← compiled CommonJS output (committed to git)
server.cjs     ← CJS bridge entry point for LiteSpeed
.env           ← credentials (committed to git — private repo only)
```

LiteSpeed uses `require()` to load the app, so all output must be **CommonJS**.

---

## First-Time Setup

### 1. hPanel Configuration

In **hPanel → Deployments → Settings and Redeploy**:

| Setting | Value |
|---|---|
| Framework preset | Express |
| Branch | `testbranch` |
| Node version | 18.x |
| Root directory | `/` |
| Entry file | `server.cjs` |
| Package manager | npm |

> ⚠️ **Entry file must NOT start with `/`** — use `server.cjs`, not `/server.cjs`. A leading slash causes a double-slash path (`public_html//server.cjs`) and a 503.

### 2. Environment Variables

hPanel has an "Environment Variables" section, but **those values are NOT injected into `process.env`** when LiteSpeed loads the app via `require()`. They are ignored.

**The only reliable method is a physical `.env` file committed to the repo.**

> ⚠️ Because `.env` is committed, **keep the GitHub repo PRIVATE**.

### 3. Database Setup

Run the schema SQL via **phpMyAdmin** (hPanel → Databases → phpMyAdmin):
- Schema file: `src/db/schema.sql`

Seed required data:
```sql
-- SiteSettings table must have rows or the homepage crashes
INSERT INTO SiteSettings (setting_key, setting_value) VALUES
  ('ticker_enabled', '1'),
  ('ticker_message', 'Welcome to LestersList!'),
  ('ticker_speed', '50');
```

---

## Deployment Workflow

```bash
# 1. Make changes in src/
# 2. Build (compiles src/ → dist/ as CommonJS)
npm run build

# 3. Commit everything including dist/
git add .
git commit -m "your message"
git push origin testbranch

# Hostinger auto-deploys within ~60 seconds
```

> ⚠️ **Always commit `dist/`**. Hostinger does NOT run a build step — it just deploys whatever is in git.

---

## Known Gotchas

### 1. LiteSpeed requires CommonJS — no ESM
LiteSpeed calls `require()` on the entry file. If the project uses `"type": "module"` in `package.json` or compiles to ESM, you get `ERR_REQUIRE_ESM` and a 503.

**Fix:**
- Remove `"type": "module"` from `package.json`
- Set `"module": "CommonJS"` in `tsconfig.json`
- Use `server.cjs` as the entry point bridge

### 2. `server.cjs` bridge required
LiteSpeed `require()`s the entry file and expects `module.exports`. TypeScript compiles to `exports.default = app`, which LiteSpeed doesn't handle automatically.

**`server.cjs` contents:**
```javascript
'use strict';
const mod = require('./dist/server');
module.exports = mod.default || mod;
```

### 3. hPanel env vars don't reach `process.env`
The env vars listed in **hPanel → Settings and Redeploy → Environment Variables** are NOT injected into the LiteSpeed process. They are ignored.

**Fix:** Commit a `.env` file to the repo. `dotenv.config()` reads it on startup.

### 4. Redeploy wipes manually created files
Any file created manually in `public_html/` via File Manager will be **deleted on the next git deploy**. Only files committed to git survive.

### 5. `process.exit(1)` in error handlers kills the app
If `uncaughtException` or `unhandledRejection` handlers call `process.exit(1)`, any single DB error will crash the entire Node process. Hostinger then serves 503 until the next restart.

**Fix:** Log the error but don't exit:
```javascript
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
  // No process.exit here
});
```

### 6. `dotenv.config()` must run before the DB pool is created
In CommonJS, `require()` runs in order. Call `dotenv.config()` at the top of `database.js`, before `mysql.createPool()`.

### 7. `import.meta.url` breaks CommonJS output
CommonJS has `__dirname` built-in — use that directly. Never use `import.meta.url` in source files that compile to CJS.

### 8. `dist/` must be committed
Hostinger does not run `npm run build` during deployment. Compiled output must be committed with every change.

---

## Debugging 503 / 500 Errors

| Error | Cause | Fix |
|---|---|---|
| `ERR_REQUIRE_ESM` | ESM output or `"type": "module"` | Remove `"type": "module"`, use CommonJS tsconfig |
| `Cannot find module .../public_html//dist/server.js` | Leading `/` in Entry file | Change Entry file to `server.cjs` (no leading slash) |
| `Access denied for user ''@'::1'` | DB env vars empty | Commit `.env` file to repo |
| 503 with no `stderr.log` | App crashed at startup | Module load error — check Entry file path |
| 503 after working briefly | `process.exit(1)` in error handler | Remove `process.exit` from rejection handler |

---

## Local Development

```bash
npm run dev      # watches src/, rebuilds on change
npm run build    # one-time build
```

## Scripts

| Script | Purpose |
|---|---|
| `npm run build` | Compile TypeScript → `dist/` |
| `npm run dev` | Watch mode for local development |
| `npm run seed:admin` | Create admin user in DB |
