-- Supabase schema for the Islamic E-commerce landing page
-- Run this in the Supabase SQL editor using the service role (it DROPS and recreates tables)

-- Danger: drop and recreate ------------------------------------------------
drop table if exists order_items cascade;
drop table if exists order_groups cascade;
drop table if exists orders cascade;
drop table if exists products cascade;
drop table if exists users cascade;
drop table if exists user_profiles cascade;
drop function if exists order_items_before_insert cascade;
drop function if exists orders_before_insert cascade;
drop function if exists is_admin cascade;
drop function if exists app_is_admin cascade;
drop function if exists handle_new_user cascade;
drop trigger if exists on_auth_user_created on auth.users;

-- Extensions --------------------------------------------------------------
create extension if not exists "pgcrypto";

-- Users -------------------------------------------------------------------
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null default 'customer' check (role in ('admin','customer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function trg_users_set_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_users_updated_at on users;
create trigger set_users_updated_at
  before update on users
  for each row
  execute function trg_users_set_updated_at();

-- Auto-provision user profile rows from auth.users -----------------------
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into users (id, email, role)
  values (new.id, new.email, 'customer')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function handle_new_user();

-- Helpers -----------------------------------------------------------------
create or replace function app_is_admin() returns boolean
language sql
stable
as $$
  select
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
    or exists (
      select 1 from users u where u.id = auth.uid() and u.role = 'admin'
    );
$$;

-- Products ----------------------------------------------------------------
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('full','para','surah')),
  price integer not null check (price >= 0),
  image_url text,
  is_active boolean not null default true,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_products_type on products(type);
create index if not exists idx_products_is_active on products(is_active);
create index if not exists idx_products_created_at on products(created_at);

-- Order headers ------------------------------------------------------------
create table if not exists order_groups (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  city text not null,
  address text not null,
  status text not null default 'new' check (status in ('new','confirmed','shipped','delivered','cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists idx_order_groups_status on order_groups(status);
create index if not exists idx_order_groups_created_at on order_groups(created_at);
create index if not exists idx_order_groups_phone on order_groups(phone);

-- Order line items ---------------------------------------------------------
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references order_groups(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price integer not null check (unit_price >= 0),
  total_price integer not null check (total_price >= 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_order_items_order_id on order_items(order_id);
create index if not exists idx_order_items_product_id on order_items(product_id);
create index if not exists idx_order_items_created_at on order_items(created_at);

-- Legacy single-line orders table (kept for backward compatibility) -------
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  customer_name text not null,
  phone text not null,
  city text not null,
  address text not null,
  product_id uuid not null references products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price integer not null default 0 check (unit_price >= 0),
  total_price integer not null default 0 check (total_price >= 0),
  status text not null default 'new' check (status in ('new','confirmed','shipped','delivered','cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_created_at on orders(created_at);
create index if not exists idx_orders_phone on orders(phone);
create index if not exists idx_orders_user_id on orders(user_id);

-- Row Level Security ------------------------------------------------------
alter table users enable row level security;
alter table products enable row level security;
alter table order_groups enable row level security;
alter table order_items enable row level security;
alter table orders enable row level security;

-- Users policies: users can see/update themselves; admins can see all ------
create policy "Users self-manage" on users
  for select using (auth.uid() = id);

create policy "Admins manage users" on users
  for all to authenticated
  using (app_is_admin())
  with check (app_is_admin());

-- Products policies -------------------------------------------------------
create policy "Public select active products"
  on products for select
  to anon, authenticated
  using (is_active);

create policy "Admin manage products"
  on products for all
  to authenticated
  using (app_is_admin())
  with check (app_is_admin());

-- Order group policies ----------------------------------------------------
create policy "Public insert order_groups"
  on order_groups for insert
  to anon, authenticated
  with check (true);

create policy "Admin select order_groups"
  on order_groups for select
  to authenticated
  using (app_is_admin());

create policy "Admin update order_groups"
  on order_groups for update
  to authenticated
  using (app_is_admin())
  with check (app_is_admin());

create policy "Admin delete order_groups"
  on order_groups for delete
  to authenticated
  using (app_is_admin());

-- Order item policies -----------------------------------------------------
create policy "Public insert order_items"
  on order_items for insert
  to anon, authenticated
  with check (true);

create policy "Admin select order_items"
  on order_items for select
  to authenticated
  using (app_is_admin());

create policy "Admin update order_items"
  on order_items for update
  to authenticated
  using (app_is_admin())
  with check (app_is_admin());

create policy "Admin delete order_items"
  on order_items for delete
  to authenticated
  using (app_is_admin());

-- Legacy orders policies (kept) ------------------------------------------
create policy "Public insert orders"
  on orders for insert
  to anon, authenticated
  with check (true);

create policy "Admin select orders"
  on orders for select
  to authenticated
  using (app_is_admin());

create policy "Admin update orders"
  on orders for update
  to authenticated
  using (app_is_admin())
  with check (app_is_admin());

create policy "Admin delete orders"
  on orders for delete
  to authenticated
  using (app_is_admin());

-- Order safeguards: price + stock are server-calculated -------------------
create or replace function order_items_before_insert()
returns trigger as $$
declare
  v_price integer;
  v_stock integer;
  v_is_active boolean;
begin
  set local search_path = public;

  if new.quantity <= 0 then
    raise exception 'Quantity must be greater than 0';
  end if;

  select price, stock_quantity, is_active
    into v_price, v_stock, v_is_active
  from products
  where id = new.product_id
  for update;

  if not found then
    raise exception 'Product not found';
  end if;

  if not v_is_active then
    raise exception 'Product is not active';
  end if;

  if v_stock < new.quantity then
    raise exception 'Insufficient stock';
  end if;

  new.unit_price := v_price;
  new.total_price := v_price * new.quantity;

  update products
    set stock_quantity = stock_quantity - new.quantity
  where id = new.product_id;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_order_items_before_insert on order_items;
create trigger trg_order_items_before_insert
  before insert on order_items
  for each row
  execute function order_items_before_insert();

-- Legacy trigger for single-line orders (kept) ----------------------------
create or replace function orders_before_insert()
returns trigger as $$
declare
  v_price integer;
  v_stock integer;
  v_is_active boolean;
begin
  set local search_path = public;

  if new.quantity <= 0 then
    raise exception 'Quantity must be greater than 0';
  end if;

  select price, stock_quantity, is_active
    into v_price, v_stock, v_is_active
  from products
  where id = new.product_id
  for update;

  if not found then
    raise exception 'Product not found';
  end if;

  if not v_is_active then
    raise exception 'Product is not active';
  end if;

  if v_stock < new.quantity then
    raise exception 'Insufficient stock';
  end if;

  new.user_id := coalesce(new.user_id, auth.uid());
  new.unit_price := v_price;
  new.total_price := v_price * new.quantity;

  update products
    set stock_quantity = stock_quantity - new.quantity
  where id = new.product_id;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_orders_before_insert on orders;
create trigger trg_orders_before_insert
  before insert on orders
  for each row
  execute function orders_before_insert();

-- Seed admin (service role only) -----------------------------------------
do $$
declare
  v_email text := 'admin@islamicbooks.pk';
  v_password text := 'Admin!123';
  v_exists boolean;
begin
  select exists(select 1 from auth.users where email = v_email) into v_exists;

  if not v_exists then
    perform auth.admin.create_user(
      jsonb_build_object(
        'email', v_email,
        'password', v_password,
        'email_confirm', true,
        'app_metadata', jsonb_build_object('role', 'admin', 'provider', 'email', 'providers', array['email']),
        'user_metadata', jsonb_build_object('role', 'admin')
      )::jsonb
    );
  end if;

  insert into users (id, email, role)
  select id, v_email, 'admin' from auth.users where email = v_email
  on conflict (id) do update set role = excluded.role;
end $$;

-- Sample seed data (optional). Run once; uses on conflict to avoid duplicates.
insert into products (name, type, price, image_url, is_active, stock_quantity)
values
  ('Complete Quran Set (30 Paras)', 'full', 4999, 'https://images.unsplash.com/photo-1596522681657-8e9057309a7e?auto=format&fit=crop&w=1200&q=80', true, 50),
  ('Juz 1 - Alif Laam Meem', 'para', 199, 'https://images.unsplash.com/photo-1720701574998-d68020bce2bd?auto=format&fit=crop&w=1200&q=80', true, 100),
  ('Juz 29 - Tabarak', 'para', 199, 'https://images.unsplash.com/photo-1720701574998-d68020bce2bd?auto=format&fit=crop&w=1200&q=80', true, 100),
  ('Juz 30 - Amma Para', 'para', 199, 'https://images.unsplash.com/photo-1720701574998-d68020bce2bd?auto=format&fit=crop&w=1200&q=80', true, 120),
  ('Surah Yaseen (Tracing)', 'surah', 149, 'https://images.unsplash.com/photo-1720701574998-d68020bce2bd?auto=format&fit=crop&w=1200&q=80', true, 80),
  ('Surah Ar-Rahman (Tracing)', 'surah', 149, 'https://images.unsplash.com/photo-1720701574998-d68020bce2bd?auto=format&fit=crop&w=1200&q=80', true, 80)
on conflict (name) do nothing;
