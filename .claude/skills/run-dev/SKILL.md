---
name: run-dev
description: Start the emids-admin-console frontend and hit it with a browser — operator credentials, storage reset, where to look for what
---

# Run the admin console

From `C:\Users\vootkurir\Downloads\Admin\emids-admin-console`:

```bash
npm run dev
```

Vite serves the console on **http://localhost:5174** (config in `vite.config.ts`). `npm run build` produces `dist/` for a static deploy.

## Sign in

- Username: `admin` — Password: `Portal@2026`.
- "Keep this terminal signed in" persists the mock session in localStorage; otherwise sessionStorage.

## Reset the demo data

The app persists everything to localStorage under `admin-console-db` (and session under `admin-console-session`). To reset:

- DevTools → Application → Local Storage → delete both keys, then reload; or
- run `localStorage.removeItem('admin-console-db'); localStorage.removeItem('admin-console-session'); location.reload()`.

Seeds come back exactly as `src/data/seed.ts` defines them.

## What to check after a change

1. **Login** rejects junk credentials with the operator wording, accepts admin/Portal@2026.
2. **Dashboard** — audit strip counts, watchlist rows, outbox log.
3. **Add user** — autofill suggestions, DOJ-driven allocation preview (contingency 0), validation errors, confirm modal, lands on the dashboard with the row provisioned.
4. **Credential desk** — open forgotten-password reports count as a badge; "Log a report on behalf" adds one; Issue reset shows a generated starter password in the modal and closes the report into "Recently resolved".
5. **Year-end** — rollout plan math (carry-forward capped), run stamp appears in history.
6. **Reminders** — queue groups pending requests by manager, chips pick recipients, send appends to the outbox (bell count +1).
