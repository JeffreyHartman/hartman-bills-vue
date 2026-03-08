-- Seed data for local development
-- This runs after migrations on `supabase db reset`
-- Uses a test user that you create via the local Supabase Auth UI or API

-- Insert bills for the test user (replace user_id after creating a local auth user)
-- To get your local test user ID:
--   1. Start supabase: npx supabase start
--   2. Go to http://127.0.0.1:54323 (Studio)
--   3. Create a user via Authentication > Users
--   4. Copy the user UUID and replace below

-- Example seed (uncomment and set user_id after creating a local user):
--
-- insert into public.bills (user_id, name, amount, recurring, paid_dates, creation_date) values
--   ('YOUR-USER-UUID', 'Rent', 1850.00, '{"interval":1,"unit":"month","dayOfWeek":null,"dayOfMonth":1,"dayOfYear":null}', '[]', now() - interval '6 months'),
--   ('YOUR-USER-UUID', 'Electric', 142.50, '{"interval":1,"unit":"month","dayOfWeek":null,"dayOfMonth":15,"dayOfYear":null}', '[]', now() - interval '6 months'),
--   ('YOUR-USER-UUID', 'Water & Sewer', 67.00, '{"interval":1,"unit":"month","dayOfWeek":null,"dayOfMonth":20,"dayOfYear":null}', '[]', now() - interval '6 months'),
--   ('YOUR-USER-UUID', 'Internet', 79.99, '{"interval":1,"unit":"month","dayOfWeek":null,"dayOfMonth":5,"dayOfYear":null}', '[]', now() - interval '6 months'),
--   ('YOUR-USER-UUID', 'Car Insurance', 215.00, '{"interval":1,"unit":"month","dayOfWeek":null,"dayOfMonth":10,"dayOfYear":null}', '[]', now() - interval '6 months');
