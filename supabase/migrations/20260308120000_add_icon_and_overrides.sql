-- Add icon, icon_color, and overrides columns to bills table
ALTER TABLE public.bills ADD COLUMN icon text NOT NULL DEFAULT 'receipt';
ALTER TABLE public.bills ADD COLUMN icon_color text NOT NULL DEFAULT '#4f46e5';
ALTER TABLE public.bills ADD COLUMN overrides jsonb NOT NULL DEFAULT '{}'::jsonb;
