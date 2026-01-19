-- Update MDA contact emails and department to Kenyan context
UPDATE public.mdas SET 
  department = 'National Government',
  contact_email = 'finance@treasury.go.ke'
WHERE code = 'MOF';

UPDATE public.mdas SET 
  department = 'National Government',
  contact_email = 'health@health.go.ke'
WHERE code = 'MOH';

UPDATE public.mdas SET 
  department = 'National Government',
  contact_email = 'education@education.go.ke'
WHERE code = 'MOE';

UPDATE public.mdas SET 
  department = 'National Government',
  contact_email = 'works@publicworks.go.ke'
WHERE code = 'MOW';

UPDATE public.mdas SET 
  department = 'National Government',
  contact_email = 'agric@kilimo.go.ke'
WHERE code = 'MOA';

UPDATE public.mdas SET 
  department = 'National Government',
  contact_email = 'transport@transport.go.ke'
WHERE code = 'MOT';

UPDATE public.mdas SET 
  department = 'National Government',
  contact_email = 'power@energy.go.ke'
WHERE code = 'MOP';

UPDATE public.mdas SET 
  department = 'National Government',
  contact_email = 'water@water.go.ke'
WHERE code = 'MOWR';

UPDATE public.mdas SET 
  department = 'National Government',
  contact_email = 'environment@environment.go.ke'
WHERE code = 'MOEN';

UPDATE public.mdas SET 
  department = 'National Government',
  contact_email = 'scitech@ict.go.ke'
WHERE code = 'MOST';

-- Update the default currency from NGN to KES
ALTER TABLE public.bills ALTER COLUMN currency SET DEFAULT 'KES';

-- Update any existing bills with NGN currency to KES
UPDATE public.bills SET currency = 'KES' WHERE currency = 'NGN';