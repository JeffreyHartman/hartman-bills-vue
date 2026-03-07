# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server:** `npm run serve` (Vue CLI hot-reload)
- **Build:** `npm run build`
- **Lint:** `npm run lint` (ESLint with vue3-essential + eslint:recommended; config in package.json)

No test framework is configured.

## Architecture

Vue 3 bills-tracking app using Options API, Vue Router 4, Vuex 4, and Tailwind CSS 3. Built with Vue CLI 5.

### State Management (Vuex)

`src/store/index.js` is the core of the app. Bills are stored as an array in Vuex state (hardcoded sample data, no backend). Each bill has: id, name, creationDate, dueDate, amount, recurring (object or null), and paidDates array.

Key logic lives in store helper functions (not exported, used internally):
- `generateBillInstances()` — expands recurring bills into individual instances up to one year out, checking paid status via date comparison
- `calculateDueDate()` / `incrementDate()` — handle day/week/month/year recurrence patterns

Getters: `upcomingBills`, `overdueBills`, `recurringBills`, `paidBills`, `billById`

### Routing

`src/router/index.js` — Four routes:
- `/` → BillsView (bills list)
- `/about` → AboutView (lazy-loaded)
- `/bill/:id` → BillDetailsView
- `/bill/:id/edit` → EditBillView

### Component Structure

- `App.vue` — Root layout with AppHeader, conditional SideBar, dark mode toggle (class-based via `document.body.classList`)
- `BillsList.vue` — Main list component with tab filtering (upcoming/overdue/recurring/paid) and month grouping
- `BillItem.vue` — Single bill row, links to detail view
- `src/utils/formatting.js` — `formatAmount()` and `formatDate()` helpers used across components

### Styling

Tailwind CSS with class-based dark mode (`darkMode: 'class'` in tailwind.config.js). Custom color `alice-blue` defined. Tailwind imported via `src/assets/index.css`. Path alias `@` maps to `src/`.

