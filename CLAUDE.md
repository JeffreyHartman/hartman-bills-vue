# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server:** `npm run dev` (Vite, default port 8080; `npm run serve` also works)
- **Build:** `npm run build`
- **Lint:** `npm run lint` (ESLint with vue3-essential + eslint:recommended; config in package.json)
- **Unit tests:** `npm run test` (Vitest, config in vitest.config.js)
- **Unit tests (watch):** `npm run test:watch`
- **E2E tests:** `npm run test:e2e` (Playwright, uses port 8090 to avoid conflicts)

## Architecture

Vue 3 bills-tracking app using Options API, Vue Router 4, Vuex 4, and Tailwind CSS 3. Built with Vite 6.

### State Management (Vuex)

`src/store/index.js` is the core of the app. Bills are stored as an array in Vuex state (mock data with dates relative to today, no backend). Each bill has: id, name, creationDate, dueDate, amount, recurring (object or null), and paidDates array.

Key logic lives in store helper functions (exported for testing):
- `generateBillInstances()` — expands recurring bills into individual instances up to one year out, checking paid status via date comparison
- `calculateDueDate()` / `incrementDate()` — handle day/week/month/year recurrence patterns

Getters: `allInstances`, `upcomingBills`, `overdueBills`, `recurringBills`, `paidBills`, `billById`, `totalDue`, `totalOverdue`, `summaryStats`

Mutations: `addBill`, `updateBill`, `deleteBill`, `markPaid`, `markUnpaid`, `toggleDarkMode`, `toggleSidebar`

### Routing

`src/router/index.js` — Four routes:
- `/` → BillsView (dashboard with summary stats + bills list)
- `/bill/new` → EditBillView (add new bill)
- `/bill/:id` → BillDetailsView (with mark paid/unpaid, edit, delete)
- `/bill/:id/edit` → EditBillView (edit existing bill)

### Component Structure

- `App.vue` — Root layout with AppHeader, page transitions, FAB for adding bills
- `SummaryStats.vue` — Dashboard summary cards (upcoming total, overdue total)
- `BillsList.vue` — Tab-filtered list (upcoming/overdue/recurring/paid) grouped by month
- `BillItem.vue` — Single bill row with status indicator, recurring badge, amount, due date label
- `BillDetailsView.vue` — Full bill details with mark paid/unpaid, edit link, delete
- `EditBillView.vue` — Form for add/edit with recurring toggle and settings
- `AppHeader.vue` — Sticky header with back navigation and dark mode toggle
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
