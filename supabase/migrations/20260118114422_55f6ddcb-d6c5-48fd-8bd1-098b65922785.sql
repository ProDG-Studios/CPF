-- Allow suppliers to update their own bills (accept/reject offers)
-- First drop if exists, then create
DO $$
BEGIN
    DROP POLICY IF EXISTS "Suppliers can update their own bills" ON public.bills;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Suppliers can update their own bills"
ON public.bills
FOR UPDATE
USING (
  supplier_id = auth.uid()
  AND public.has_role(auth.uid(), 'supplier'::public.app_role)
)
WITH CHECK (
  supplier_id = auth.uid()
  AND public.has_role(auth.uid(), 'supplier'::public.app_role)
);

-- Fix notifications: allow suppliers to insert notifications tied to their own bills
DROP POLICY IF EXISTS "Users can create notifications for related parties" ON public.notifications;

CREATE POLICY "Users can create notifications for related parties"
ON public.notifications
FOR INSERT
WITH CHECK (
  (user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
  OR (public.has_role(auth.uid(), 'spv'::public.app_role) AND bill_id IS NOT NULL)
  OR (public.has_role(auth.uid(), 'mda'::public.app_role) AND bill_id IS NOT NULL)
  OR public.has_role(auth.uid(), 'treasury'::public.app_role)
  OR (
    public.has_role(auth.uid(), 'supplier'::public.app_role)
    AND bill_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.bills b
      WHERE b.id = bill_id
        AND b.supplier_id = auth.uid()
    )
  )
);