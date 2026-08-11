delete from public.quote_requests where lead_id in (select id from public.leads where email = 'e2e2@test.com');
delete from public.leads where email = 'e2e2@test.com';