-- Add rejection_reason column to track why offers were rejected
ALTER TABLE public.bills ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Add new status value for offer_rejected (we'll use a softer approach since we can't easily modify enums)
-- The status 'rejected' already exists but is used for final rejection. We'll add a new column to differentiate
ALTER TABLE public.bills ADD COLUMN IF NOT EXISTS last_rejected_by_supplier boolean DEFAULT false;
ALTER TABLE public.bills ADD COLUMN IF NOT EXISTS last_rejection_date timestamp with time zone;