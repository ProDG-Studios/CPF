-- Allow suppliers to view MDA profiles for notification purposes (limited fields)
-- This is needed so suppliers can notify MDA users when accepting offers
CREATE POLICY "Suppliers can view MDA user_ids for notifications"
ON public.profiles
FOR SELECT
USING (
  public.has_role(auth.uid(), 'supplier'::public.app_role)
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = profiles.user_id
    AND user_roles.role = 'mda'::public.app_role
  )
);

-- Also allow MDA users to view supplier profiles for workflow purposes
CREATE POLICY "MDA can view supplier profiles for workflow"
ON public.profiles
FOR SELECT
USING (
  public.has_role(auth.uid(), 'mda'::public.app_role)
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = profiles.user_id
    AND user_roles.role = 'supplier'::public.app_role
  )
);