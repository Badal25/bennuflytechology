-- Allow sales/admin roles to delete quote requests, matching the existing 'sales manage quotes' policy
CREATE POLICY "sales delete quotes"
ON public.quote_requests
FOR DELETE
TO authenticated
USING (can_manage_sales(auth.uid()));