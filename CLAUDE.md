# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

React 18 + Vite admin console ("emids-admin-console") for the Emids directory and leave-allocation desk. **Frontend-only phase**: there is no backend yet — a localStorage database (`src/mocks/localDb.ts`) stands in for the future FastAPI side, and the services layer is written so it can be swapped to real HTTP calls without touching pages or the store.

Styling, fonts, the EMIDS logo set and the hover/interaction language are carried over verbatim from `Leave-mangement-model2-updates\Leave-managment\emids-leave-portal\frontend` (the leave-management portal). TypeScript strict mode throughout (`npm run typecheck`).

## Commands

All npm commands run from this folder:

```bash
npm run dev        # Vite dev server, port 5174
npm run build      # production build to dist/
npm run typecheck  # tsc over src/ and tests/
npm test           # vitest run — unit suites, deterministic, no network
npm run test:watch
npm run lint       # eslint . (flat config, 0 errors expected)
npm run format     # prettier --write src tests
```

To start clean: open DevTools → clear localStorage (keys `admin-console-db`, `admin-console-session`) and reload — the seed fixtures in `src/data/seed.ts` come back.

## Operator access (frontend-phase)

- Username `admin`, password `Portal@2026` (defined in `src/constants.ts` as `OPERATOR_ID` / `OPERATOR_PASSWORD`).
- The session token is a mock saved to sessionStorage (or localStorage when "keep me signed in" is ticked) — `services/auth.ts` owns the wording contract of sign-in errors that `Login.tsx` renders.

## Architecture

```
src/
  constants.ts       # ROLES, STATUSES, TOAST_KIND, OPERATOR_*, POLICY (24d annual /
                     # 10d contingency / 10d carry-forward cap), YEAR_* window
  types/models.ts    # DirectoryUser, BalanceRow, LeaveRequest, AdminNotice,
                     # ResetRequest, Operator, ServiceEnvelope/ServiceError
                     # { data, error } contract
  data/seed.ts       # seed directory (8 people, DOJ spread), balances, 4 pending
                     # leaves, 1 sent notice, 2 open + 1 resolved password
                     # reports — the demo fixtures
  mocks/localDb.ts   # localStorage db (users/balances/leaves/notices/pwdRequests/
                     # yearEndRuns), session token helpers, resetDb()
  services/          # auth, users, balances, credentials, notifications — the ONLY
                     # modules that touch mocks/localDb; every call returns
                     # { data, error } with error.userMessage wording the caller
                     # passes to setToast
  features/          # pure domain rules, no React:
                     #   balances/provisioning (DOJ pro-rata, remaining annual/contingency)
                     #   balances/yearEnd (rollover with capped carry-forward)
                     #   users/validateUser (password + emp-no/email/DOJ/manager rules)
                     #   users/generate (next EMP number, email + password suggesters)
                     #   notifications/nudge (pending requests grouped by manager,
                     #                          default compose copy)
  store/AdminContext.tsx # session + users + balances + leaves + notices +
                     # pwdRequests + toast; write helpers addDirectoryUser,
                     # provisionBalance, runYearEnd, sendNudge, logPwdRequest,
                     # resolvePwdRequest wrap the services and keep state in sync
  components/ui/     # atoms (Button, Field, IconButton, PageHead, Chip, StatusPill,
                     # StatTile, Meter, Toast) and molecules (ConfirmModal,
                     # PanelTable), re-exported by the index.ts barrel
  components/feature/ # ORGANISMS — complete functional sections, props-in (no store
                      # reads): add-user/AddUserForm, credential-desk/ResetInbox +
                      # LogReportCard, year-end/RolloverDesk,
                      # manager-reminders/NudgeComposer + NudgeOutbox,
                      # dashboard/OperatorMoves + Watchlist
  components/layout/ # ProfileMenu, NotificationsPanel (the outbox log)
  components/Icons.tsx  # stroke-outline icon set (currentColor, size prop)
  hooks/useDismiss.ts   # escape / outside-mousedown dismissal
  utils/             # dates (fmtDate, wholeMonthsFrom, todayISO — LOCAL date, never
                     # UTC), format (fmtDays over half-day store, initialsOf,
                     # isEmail), ErrorBoundary
  pages/             # route-level compositions: PageHead + organisms; data via
                     # useAdmin(), rules via features/ — Login, Dashboard, AddUser,
                     # Credentials, YearEnd, Reminders
styles/              # global.css (token system), layout.css (shell), login.css,
                     # pages.css (admin compositions)
```

### Admin functions → where they live

1. **Add a user + set password** — `pages/AddUser.tsx` (draft validation in `features/users/validateUser.ts`, confirmed via `ConfirmModal`; `addDirectoryUser` then `provisionBalance`).
2. **DOJ-based leave provisioning** — `features/balances/provisioning.ts` (`proRataAllocationFor`: full pool if DOJ is an earlier year, else pro-rated by months remaining in the allocation year; half-day granularity; **contingency starts at 0 for newly provisioned/added users**). The AddUser form previews it at entry time; the Year-End Rollover applies the full-pool policy at year change.
3. **Year-end balance update** — `pages/YearEnd.tsx` + `features/balances/yearEnd.ts`: close year → open next, leftover annual banked as carry-forward capped at `POLICY.CarryForwardCap`, contingency/comp-off reset, inactive people skipped; a run stamp is recorded in the db (`yearEndRuns`).
4. **Notify managers about pending leaves** — `pages/Reminders.tsx` + `features/notifications/nudge.ts`: pending requests grouped per reporting manager, pick via chips, copy drafts itself, `sendNudge` appends to the outbox (`AdminNotice[]`) which the bell (outbox log) and dashboard read.
5. **Credential Desk (forgotten passwords)** — `pages/Credentials.tsx` + `services/credentials.ts`: a user's "I forgot my password" report lands as an Open `ResetRequest` (the drawer's `{#}` badge counts them); the admin issues a fresh starter password (generated via `features/users/generate.ts` `suggestPassword`, shown once in the confirm modal) and the report closes with a resolution date. "Log a report on behalf of a user" covers phone-in reports.

### Conventions

- **Days live in the store as half-day units** (24 d annual = 48 units). Convert for display with `fmtDays()`; never divide in page markup.
- **Local dates only** — `utils/dates.ts` builds `Date` objects from `yyyy-mm-dd` at local midnight; `todayISO()` mirrors that. No `new Date(isoString)` (UTC parse off-by-one).
- Pages call the store (`useAdmin`), not services; pure rules live in `features/`. Toast copy flows from `error.userMessage` or page-authored text through `setToast`, one global slot (3200 ms).
- **Atomic layering**: atoms (`components/ui/atoms`) → molecules (`components/ui/molecules`) → **organisms (`components/feature/<feature>/`)** → pages. Organisms are props-in only — they never read the store; the page wires `useAdmin` data/handlers into them and owns persistence + routing + toasts. Don't put feature logic in pages (composition only) or store reads in organisms.
- Styling keeps the **leave-portal token system** (`.eyebrow`, hairline cards, sharp corners with the 8px bottom-left frame, `.pill-*`, `.table`, hover = `--teal-wash`). Wallet the class names: `hl-panel-head` survives from the reference on purpose; admin-specific classes use the `dash-*`/`.cred-preview`/`.meter`/`.yearbar` namespace in `pages.css`.
- Add pages: create `pages/<Name>.tsx`, register the route in `src/App.tsx` inside `<Guard>`, add an entry to `NAV` in `components/Layout.tsx`, and label the page in `pages.css` if it needs new classes.

## Testing

- **Unit** (`npm test`): suites under `tests/` mirror `src/`; the mock db is cleaned between tests via `resetDb()`. TDD: failing test first for every behavior change.
- No e2e yet — when the backend lands, Playwright specs should follow the leave-portal setup (seeded logins, mutating specs clean up after themselves).

## Git conventions

- Git repo initialized at the project root with **Husky hooks** (see `.husky/`; `core.hooksPath` = `.husky/_`; the `prepare` script reinstalls hooks after `npm install`).
- **Pre-commit** runs `lint-staged`: staged `*.{ts,tsx}` are eslint-fixed and prettier-formatted; `*.{css,json,md}` are prettier-formatted. Fix failures by editing the flagged code — never bypass with `--no-verify`.
- **Commit-msg** runs commitlint against `commitlint.config.js`: messages must carry a conventional tag — `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `perf:`, `test:`, `build:`, `ci:`, `chore:` or `revert:` — with sentence-case subject (e.g. `feat: add credential desk reset queue`). A non-conforming message is rejected.
- **Never commit or push without asking the user first** (standing user rule).
- `.gitignore` covers `node_modules/`, `dist/`, `coverage/`, `test-results/`, `*.local` and `.env`.
