alter table public.pos_customers add column if not exists title text;
alter table public.pos_sales add column if not exists customer_title text;
