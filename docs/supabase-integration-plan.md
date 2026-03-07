# Supabase Integration Plan

Saved for reference after the Vite migration is complete.

## Phase 1: Supabase Setup & Database Schema
1. Initialize Supabase locally — `npx supabase init`
2. Create migration for `bills` table:
   - `id` (uuid, PK, default `gen_random_uuid()`)
   - `user_id` (uuid, FK to `auth.users`, for RLS)
   - `name` (text, not null)
   - `creation_date` (timestamptz)
   - `due_date` (timestamptz, nullable — null for recurring)
   - `amount` (numeric, not null)
   - `recurring` (jsonb, nullable — `{interval, unit, dayOfWeek, dayOfMonth, dayOfYear}`)
   - `paid_dates` (jsonb, default `[]`)
   - `created_at` / `updated_at` (timestamptz)
3. Row-Level Security (RLS) — users only see/modify their own bills
4. Seed data for local dev

## Phase 2: Auth
1. Install `@supabase/supabase-js`
2. Create `src/lib/supabase.js` — client with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Login/Register view — email+password auth
4. Route guard — redirect to login if not authenticated
5. Auth state in Vuex (user object, session)

## Phase 3: Connect Store to Supabase
1. Convert mutations to actions:
   - `fetchBills` — load from Supabase on login/app init
   - `addBill` → insert, then commit mutation
   - `updateBill` → update, then commit mutation
   - `deleteBill` → delete, then commit mutation
   - `markPaid` / `markUnpaid` → update `paid_dates`
2. Remove mock data from store initial state
3. Switch from integer IDs to UUIDs

## Phase 4: Environment & Config
1. `.env.local` with local Supabase URLs/keys
2. Verify `.env.local` in `.gitignore`
3. Update CLAUDE.md with Supabase commands

## Decisions Made
- Email+password auth (not magic link)
- UUIDs for bill IDs
- Vite env vars (`VITE_*` / `import.meta.env`)
