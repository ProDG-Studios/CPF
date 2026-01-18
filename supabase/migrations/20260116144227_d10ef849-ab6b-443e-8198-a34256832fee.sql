-- Fix overly permissive INSERT policies

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can insert logs" ON public.activity_logs;

-- Create more restrictive notification insert policy
-- Only allow inserting notifications for users involved in the same bills
CREATE POLICY "Users can create notifications for related parties"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (
    -- Allow if the notification is for themselves
    user_id = auth.uid()
    OR
    -- Allow if user is admin
    public.has_role(auth.uid(), 'admin')
    OR
    -- Allow if user is SPV and bill belongs to them
    (public.has_role(auth.uid(), 'spv') AND bill_id IS NOT NULL)
    OR
    -- Allow if user is MDA and bill is for their MDA
    (public.has_role(auth.uid(), 'mda') AND bill_id IS NOT NULL)
    OR
    -- Allow if user is Treasury
    public.has_role(auth.uid(), 'treasury')
);

-- Create more restrictive activity log insert policy
CREATE POLICY "Authenticated users can log their own actions"
ON public.activity_logs
FOR INSERT
TO authenticated
WITH CHECK (
    -- User must be logging their own action
    user_id = auth.uid()
);