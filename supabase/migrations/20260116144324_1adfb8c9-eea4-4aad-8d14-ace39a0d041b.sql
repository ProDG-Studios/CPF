-- Create storage bucket for invoice documents
INSERT INTO storage.buckets (id, name, public) VALUES ('invoices', 'invoices', false);

-- Create storage policies for invoice uploads
CREATE POLICY "Authenticated users can upload invoices"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'invoices' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own invoices"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'invoices' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "SPV can view all invoices"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'invoices' AND public.has_role(auth.uid(), 'spv'));

CREATE POLICY "MDA can view invoices for their bills"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'invoices' AND public.has_role(auth.uid(), 'mda'));

CREATE POLICY "Treasury can view all invoices"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'invoices' AND public.has_role(auth.uid(), 'treasury'));

CREATE POLICY "Admin can view all invoices"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'invoices' AND public.has_role(auth.uid(), 'admin'));

-- Insert reference MDAs
INSERT INTO public.mdas (name, code, department, contact_email) VALUES
('Ministry of Finance', 'MOF', 'Federal Government', 'finance@gov.ng'),
('Ministry of Health', 'MOH', 'Federal Government', 'health@gov.ng'),
('Ministry of Education', 'MOE', 'Federal Government', 'education@gov.ng'),
('Ministry of Works', 'MOW', 'Federal Government', 'works@gov.ng'),
('Ministry of Agriculture', 'MOA', 'Federal Government', 'agric@gov.ng'),
('Ministry of Transport', 'MOT', 'Federal Government', 'transport@gov.ng'),
('Ministry of Power', 'MOP', 'Federal Government', 'power@gov.ng'),
('Ministry of Water Resources', 'MOWR', 'Federal Government', 'water@gov.ng'),
('Ministry of Environment', 'MOEN', 'Federal Government', 'environment@gov.ng'),
('Ministry of Science and Technology', 'MOST', 'Federal Government', 'scitech@gov.ng');