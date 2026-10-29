---
name: portal-conventions
description: How to add or change admin-console features — page + route patterns, where state data and UI live, the reusable ui primitives, a11y rules and the class-parity styling rule
---

# Admin console conventions

Target layout (all under `src/` unless noted):

```
constants.ts        # ROLES, STATUSES, TOAST_KIND, OPERATOR_*, POLICY (24d annual / 10d contingency / 10d CF cap)
types/models.ts     # DirectoryUser, BalanceRow (half-day units), LeaveRequest, AdminNotice, Operator, ServiceEnvelope
data/seed.ts        # demo fixtures for the localStorage db
mocks/localDb.ts    # localStorage db + session token + resetDb()
services/           # auth, users, balances, notifications — the ONLY modules that touch mocks/localDb;
                    # every call returns { data, error: ServiceError } with error.userMessage wording
features/           # pure domain rules (provisioning, yearEnd, validateUser, generate, nudge)
store/AdminContext  # session + users + balances + leaves + notices + pwdRequests + toast;
                    # write helpers mutate via services (incl. logPwdRequest / resolvePwdRequest)
components/ui/      # atoms (Button, Field, IconButton, PageHead, Chip, StatusPill, StatTile, Meter, Toast)
                    # + molecules (ConfirmModal, PanelTable), exported through index.ts barrel
components/feature/ # ORGANISMS per feature — complete functional sections, props-in, no store reads
                    # (add-user/AddUserForm, credential-desk/ResetInbox + LogReportCard,
                    #  year-end/RolloverDesk, manager-reminders/NudgeComposer + NudgeOutbox,
                    #  dashboard/OperatorMoves + Watchlist)
components/layout/  # ProfileMenu, NotificationsPanel (the outbox log the bell opens)
hooks/useDismiss.ts # Escape/outside-mousedown dismissal for popovers, drawers, dialogs
utils/              # dates (LOCAL-date helpers), format (fmtDays, initialsOf), ErrorBoundary
pages/              # route-level compositions (PageHead + organisms); Login, Dashboard,
                    # AddUser, Credentials, YearEnd, Reminders
```

## Adding a page

1. Create `pages/<Name>.tsx` with `PageHead` (`eyebrow`, `title`, paragraph children).
2. Register the route in `src/App.tsx` inside `<Guard>` (route-level sign-in gate; there are no manager-only routes — operators are admin).
3. Add to `NAV` in `components/Layout.tsx` so the drawer picks it up.
4. New page-specific CSS goes in `styles/pages.css` under an `ADMIN <NAME>` banner.

## Atomic layering

atoms (`components/ui/atoms`) → molecules (`components/ui/molecules`) → organisms (`components/feature/<feature>/`) → pages.

- **Organisms are props-in only** — never read `useAdmin` inside a feature organism. The page wires data + handlers into the organism, owns persistence (store calls), routing and toasts.
- Don't add feature logic to pages: they compose `PageHead` + organisms; PanelTable compositions with small column configs may stay in a page (molecule level).
- Adding a nontrivial page section? Extract it as `components/feature/<feature>/<Name>.tsx` first.

## Data access

- **Never call a service twice or bypass the store.** Pages read from `useAdmin()`; mutations go through the context helpers (`addDirectoryUser`, `provisionBalance`, `runYearEnd`, `sendNudge`) which call services and keep state in sync.
- Toast via `useAdmin().setToast(msg, kind)` — one global toast (3200 ms). Error wording comes from the service envelope (`error.userMessage`); don't invent new wording in pages on top of it.

## Domain rules to respect

- **Balances are half-day units.** 24 d annual = 48 units. Display via `fmtDays()`/`/ 2` — never assume whole days in the store.
- **DOJ pro-rata** (`features/balances/provisioning.ts`): DOJ in an earlier year ⇒ full pool; DOJ inside the allocation year ⇒ pro-rate by months remaining; later year ⇒ zero. Never hand-pick numbers in a page.
- **Year-end rollover** (`features/balances/yearEnd.ts`): fresh 24 d + carry-forward capped at 10 d, contingency reset to 10 d, comp-off cleared, inactive people skipped, previous year rows retained.
- **Local dates**: use `utils/dates.ts` helpers only — no `new Date('yyyy-mm-dd')` UTC parsing.

## UI primitives (write once, reuse)

- `Button {variant: 'primary'|'ghost'|'danger', size?: 'sm', busy, busyLabel}` — busy renders spinner + label and disables.
- `Field {label, required, error, hint, as = 'label'|'div', htmlFor}` — wraps one control; with `htmlFor` it wires `aria-invalid`/`aria-describedby` automatically; `hint` renders the muted mono line under the control.
- `PanelTable {title, count, headExtra, columns[{label, cell, cellClass?, width?, maxWidth?}], rows, rowKey, rowClass?, empty?, emptyBlock?}` — one card/table scaffold for every list.
- `Chip {isOn}` for pickers, `StatTile` for the dashboard audit strip, `Meter` for used/total bars, `StatusPill` for Active/Pending/Sent states.
- `ConfirmModal {title, text, confirmLabel, danger, busy, onConfirm, onClose}` — Escape, focus trap and restoration are built in; `useDismiss(ref, {onClose, enabled, escape?, outside?})` covers drawer/popover behaviour.

## Styling

- The token system lives in `styles/global.css` (`--teal` ramp, `--ink*`, hairlines, mono label voice) and is carried over from the leave-management portal — do not fork it. All-caps tracked eyebrows, sharp corners with the 8px bottom-left frame, hover = `--teal-wash`, never drop shadows.
- `hl-panel-head` survives from the leave portal on purpose (class parity with the reference design system); new admin classes use the `dash-*`, `cred-preview`, `meter`, `yearbar`, `strip-note` namespaces in `pages.css`.
- No inline styles for repeated patterns; add a class instead.

## TDD flow

Start behavior changes with a failing test under `tests/` (mirroring `src/` paths); the db is wiped via `resetDb()` between tests so seeds are deterministic.
