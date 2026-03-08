# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server:** `npm run dev` (Vite, default port 8080; `npm run serve` also works)
- **Build:** `npm run build`
- **Lint:** `npm run lint` (ESLint with vue3-essential + eslint:recommended; config in package.json)
- **Unit tests:** `npm run test` (Vitest, config in vitest.config.js)
- **Unit tests (watch):** `npm run test:watch`
- **E2E tests:** `npm run test:e2e` (Playwright, uses port 8090 to avoid conflicts)

### Supabase (Local Development)

```bash
npx supabase start          # Start local Supabase (Postgres, Auth, etc.)
npx supabase stop           # Stop local services
npx supabase status         # Get local URLs and keys
npx supabase db reset       # Drop and recreate from migrations + seed
npx supabase migration new  # Create a new migration file
npx supabase db push         # Apply pending migrations (preserves data)
```

Local Studio UI: http://127.0.0.1:54323

After `npx supabase start`, copy the anon key and API URL into `.env.local` (see `.env.example`).

**IMPORTANT:** Never run `npx supabase db reset` without explicit user permission — it destroys all local data. When applying new migrations during development, always use `npx supabase db push` to apply pending migrations while preserving existing data.

## Architecture

Vue 3 bills-tracking app using Options API, Vue Router 4, Vuex 4, Tailwind CSS 3, and Supabase. Built with Vite 6.

### Backend (Supabase)

- **Database:** Single `bills` table with UUID primary keys, per-user via `user_id` FK to `auth.users`
- **Auth:** Email+password via Supabase Auth; session managed by `@supabase/supabase-js`
- **RLS:** Row-level security ensures users only access their own bills
- **Client:** `src/lib/supabase.js` — initialized with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- **Migrations:** `supabase/migrations/` — schema versioned in Git

### State Management (Vuex)

`src/store/index.js` is the core of the app. Bills are fetched from Supabase on auth and stored in Vuex state. Each bill has: id (UUID), name, creationDate, dueDate, amount, recurring (object or null), and paidDates array.

Key logic lives in store helper functions (exported for testing):
- `generateBillInstances()` — expands recurring bills into individual instances up to one year out, checking paid status via date comparison
- `calculateDueDate()` / `incrementDate()` — handle day/week/month/year recurrence patterns
- `mapBillFromDb()` / `mapBillToDb()` — convert between Supabase snake_case and app camelCase

Getters: `allInstances`, `upcomingBills`, `overdueBills`, `recurringBills`, `paidBills`, `billById`, `totalDue`, `totalOverdue`, `summaryStats`

Mutations: `setBills`, `setUser`, `addBill`, `updateBill`, `deleteBill`, `markPaid`, `markUnpaid`, `toggleDarkMode`, `toggleSidebar`

Actions (async, interact with Supabase): `fetchBills`, `addBill`, `updateBill`, `deleteBill`, `markPaid`, `markUnpaid`, `logout`

### Routing

`src/router/index.js` — Five routes with auth guard:
- `/login` → LoginView (email+password auth, no auth required)
- `/` → BillsView (dashboard with summary stats + bills list)
- `/bill/new` → EditBillView (add new bill)
- `/bill/:id` → BillDetailsView (with mark paid/unpaid, edit, delete)
- `/bill/:id/edit` → EditBillView (edit existing bill)

### Component Structure

- `App.vue` — Root layout with AppHeader, page transitions, FAB, auth state listener
- `LoginView.vue` — Email+password sign in / sign up form
- `SummaryStats.vue` — Dashboard summary cards (upcoming total, overdue total)
- `BillsList.vue` — Tab-filtered list (upcoming/overdue/recurring/paid) grouped by month
- `BillItem.vue` — Single bill row with status indicator, recurring badge, amount, due date label
- `BillDetailsView.vue` — Full bill details with mark paid/unpaid, edit link, delete
- `EditBillView.vue` — Form for add/edit with recurring toggle and settings
- `AppHeader.vue` — Sticky header with back navigation, dark mode toggle, and logout
- `src/utils/formatting.js` — `formatAmount()`, `formatDate()`, `formatDateLong()`, `daysUntilDue()`, `daysUntilDueLabel()`, `billStatus()`, `recurringLabel()`

### Styling

Tailwind CSS 3 with class-based dark mode (`darkMode: 'class'`). Custom design tokens in tailwind.config.js:
- `surface` color scale (warm stone tones for backgrounds/text)
- `accent` colors (indigo for primary actions)
- `status` colors (paid/green, overdue/red, warning/amber)
- Custom shadows: `card`, `card-hover`, `elevated`
- Fonts: DM Sans (body) + Fraunces (serif for amounts) loaded via Google Fonts

Reusable component classes defined in `src/assets/index.css`: `btn-primary`, `btn-secondary`, `btn-danger`, `btn-success`, `card`, `input-field`

Path alias `@` maps to `src/`.

### Testing

- **Unit tests** (`tests/unit/`): Vitest + @vue/test-utils, jsdom environment. Tests for formatting utils, store mutations, and component rendering.
- **E2E tests** (`tests/e2e/`): Playwright with Chromium. Tests full user flows: navigation, CRUD, dark mode, responsive.

## Code Conventions

- Use `@/` alias for all imports from `src/` (never relative `../` paths)
- Async actions in views must have try/catch with user-facing error feedback
- Async form submits need an `isSaving` guard + disabled buttons to prevent double-clicks
- Supabase actions use pessimistic updates: commit mutation only after DB write succeeds
- Supabase subscriptions (e.g. `onAuthStateChange`) must be unsubscribed on component unmount
- Validate required env vars at module load with fail-fast throws
- When dispatching updateBill, always include all existing fields (especially `paidDates`) to avoid data loss
