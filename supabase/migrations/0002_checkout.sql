-- ============================================================
-- BAIXUDOS.PR — Checkout integrado (Fase 1)
-- Packs, eventos/ingressos, ofertas cruzadas, pedido único com
-- itens separados, pagamentos e reservas. Aplicar DEPOIS de
-- 0001_raffle.sql, no SQL Editor do Supabase.
--
-- Reaproveita raffle_campaigns e campaign_numbers do M1. Substitui os
-- STUBS vazios (raffle_orders/raffle_order_numbers/raffle_payments) pelo
-- modelo do briefing (orders + order_items + payments + reservations).
-- Estratégia: 1 pedido, N itens (campaign_individual | campaign_pack |
-- event_ticket) — receita contabilizada por item.
-- Idempotente onde possível (create if not exists / drop if exists).
-- ============================================================

create extension if not exists "pgcrypto";

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- ------------------------------------------------------------
-- customers — dados do participante (reutilizáveis entre pedidos)
-- ------------------------------------------------------------
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  cpf text,
  phone text,
  email text,
  birth_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- CPF único quando informado (evita duplicidade de cadastro)
create unique index if not exists uq_customers_cpf
  on public.customers (cpf) where cpf is not null;

-- ------------------------------------------------------------
-- events / ticket_types — ingressos do evento
-- ------------------------------------------------------------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  title text not null,
  description text,
  event_date timestamptz,
  start_time text,
  location text,
  address text,
  map_url text,
  image_url text,
  capacity integer,
  status text not null default 'draft'
    check (status in ('draft','published','closed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ticket_types (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  title text not null,
  lot_name text,
  price_cents integer not null check (price_cents >= 0),
  available_quantity integer not null default 0 check (available_quantity >= 0),
  sold_quantity integer not null default 0 check (sold_quantity >= 0),
  reserved_quantity integer not null default 0 check (reserved_quantity >= 0),
  max_per_customer integer not null default 10,
  starts_at timestamptz,
  ends_at timestamptz,
  status text not null default 'draft'
    check (status in ('draft','active','paused','soldout','closed')),
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_ticket_types_event on public.ticket_types (event_id, display_order);

-- Campanha passa a poder referenciar um evento + versão do regulamento
alter table public.raffle_campaigns
  add column if not exists event_id uuid references public.events (id) on delete set null;
alter table public.raffle_campaigns
  add column if not exists regulation_version text;

-- ------------------------------------------------------------
-- campaign_packs — packs de números (preços configuráveis)
-- ------------------------------------------------------------
create table if not exists public.campaign_packs (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.raffle_campaigns (id) on delete cascade,
  title text not null,
  number_quantity integer not null check (number_quantity > 0),
  original_price_cents integer not null check (original_price_cents >= 0),
  promotional_price_cents integer not null check (promotional_price_cents >= 0),
  max_per_customer integer,
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pack_promo_not_higher check (promotional_price_cents <= original_price_cents)
);
create index if not exists idx_campaign_packs_campaign
  on public.campaign_packs (campaign_id, display_order);

-- ------------------------------------------------------------
-- orders — pedido (1 pedido, N itens). Substitui raffle_orders.
-- ------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  public_code text unique,
  customer_id uuid references public.customers (id) on delete set null,
  source_flow text not null default 'campaign_first'
    check (source_flow in ('campaign_first','ticket_first','post_purchase_ticket','post_purchase_campaign')),
  subtotal_cents integer not null default 0,
  discount_total_cents integer not null default 0,
  fee_total_cents integer not null default 0,
  total_cents integer not null default 0,
  status text not null default 'created'
    check (status in ('created','awaiting_payment','paid','expired','cancelled','refunded')),
  payment_status text not null default 'pending'
    check (payment_status in ('pending','processing','approved','rejected','expired','refunded')),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz
);
create index if not exists idx_orders_customer on public.orders (customer_id);
create index if not exists idx_orders_status on public.orders (status);

-- ------------------------------------------------------------
-- offers — ofertas cruzadas / packs / addons (configuráveis)
-- ------------------------------------------------------------
create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text,
  cta_label text,
  offer_type text not null check (offer_type in (
    'campaign_individual_numbers','campaign_number_pack',
    'ticket_campaign_addon','campaign_ticket_addon',
    'post_purchase_ticket_offer','post_purchase_campaign_offer',
    'ticket_number_ratio_offer','campaign_pack_offer'
  )),
  campaign_id uuid references public.raffle_campaigns (id) on delete cascade,
  event_id uuid references public.events (id) on delete cascade,
  ticket_type_id uuid references public.ticket_types (id) on delete set null,
  campaign_pack_id uuid references public.campaign_packs (id) on delete set null,
  ticket_number_ratio integer,               -- ex.: 1 ingresso -> N números
  promotional_number_price_cents integer,     -- preço do número dentro do combo
  fixed_total_cents integer,                   -- total fixo, quando aplicável
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_offers_active on public.offers (offer_type, active, display_order);

-- ------------------------------------------------------------
-- order_items — itens do pedido (receita separada por tipo)
-- ------------------------------------------------------------
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  item_type text not null check (item_type in ('campaign_individual','campaign_pack','event_ticket')),
  campaign_id uuid references public.raffle_campaigns (id) on delete set null,
  campaign_pack_id uuid references public.campaign_packs (id) on delete set null,
  ticket_type_id uuid references public.ticket_types (id) on delete set null,
  offer_id uuid references public.offers (id) on delete set null,
  quantity integer not null check (quantity > 0),
  original_unit_price_cents integer not null default 0,
  final_unit_price_cents integer not null default 0,
  discount_cents integer not null default 0,
  subtotal_cents integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_order_items_order on public.order_items (order_id);

-- ------------------------------------------------------------
-- reservations — janela temporária (números + ingressos)
-- ------------------------------------------------------------
create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  status text not null default 'active'
    check (status in ('active','consumed','expired','cancelled')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_reservations_order on public.reservations (order_id);
create index if not exists idx_reservations_expiry on public.reservations (status, expires_at);

-- ------------------------------------------------------------
-- payments — cobrança (Pix / Mercado Pago). Substitui raffle_payments.
-- ------------------------------------------------------------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  provider text not null default 'mercadopago',
  provider_payment_id text,
  method text not null default 'pix',
  status text not null default 'pending'
    check (status in ('creating','pending','processing','approved','rejected','expired','cancelled','error','refunded')),
  amount_cents integer not null default 0,
  qr_code text,
  pix_copy_paste text,
  ticket_url text,
  raw jsonb,
  expires_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_payments_order on public.payments (order_id);
create unique index if not exists uq_payments_provider_id
  on public.payments (provider, provider_payment_id) where provider_payment_id is not null;

-- ------------------------------------------------------------
-- consents — aceite versionado (regulamento/termos/privacidade)
-- ------------------------------------------------------------
create table if not exists public.consents (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers (id) on delete set null,
  order_id uuid references public.orders (id) on delete cascade,
  document_type text not null check (document_type in ('regulation','terms','privacy','marketing')),
  document_version text not null,
  accepted_at timestamptz not null default now(),
  ip inet,
  created_at timestamptz not null default now()
);
create index if not exists idx_consents_order on public.consents (order_id);

-- ------------------------------------------------------------
-- Reapontar campaign_numbers para o novo modelo
-- (remove o vínculo antigo com raffle_orders; vincula a reserva/item)
-- ------------------------------------------------------------
alter table public.campaign_numbers drop column if exists order_id;
alter table public.campaign_numbers
  add column if not exists reservation_id uuid references public.reservations (id) on delete set null;
alter table public.campaign_numbers
  add column if not exists order_item_id uuid references public.order_items (id) on delete set null;
-- reserved_until -> reservation_expires_at (alinha com o briefing)
do $$
begin
  if exists (select 1 from information_schema.columns
             where table_schema='public' and table_name='campaign_numbers'
               and column_name='reserved_until') then
    alter table public.campaign_numbers rename column reserved_until to reservation_expires_at;
  end if;
end $$;

-- ------------------------------------------------------------
-- Remover os stubs vazios do M1 (substituídos acima)
-- ------------------------------------------------------------
drop table if exists public.raffle_order_numbers;
drop table if exists public.raffle_payments;
drop table if exists public.raffle_orders;

-- ------------------------------------------------------------
-- Reserva atômica de números (redefinida para o novo modelo)
-- Serializada pelas travas de linha do Postgres — sem venda duplicada.
-- ------------------------------------------------------------
create or replace function reserve_numbers(
  p_campaign uuid, p_numbers integer[], p_reservation uuid, p_order_item uuid
) returns integer language plpgsql as $$
declare
  v_ttl integer;
  v_expected integer := coalesce(array_length(p_numbers, 1), 0);
  v_count integer;
begin
  if v_expected = 0 then
    raise exception 'Nenhum número informado';
  end if;

  select reservation_ttl_minutes into v_ttl
    from public.raffle_campaigns where id = p_campaign;

  update public.campaign_numbers
     set status = 'reserved',
         reservation_id = p_reservation,
         order_item_id = p_order_item,
         reservation_expires_at = now() + make_interval(mins => coalesce(v_ttl, 15))
   where campaign_id = p_campaign
     and number = any(p_numbers)
     and status = 'available';

  get diagnostics v_count = row_count;
  if v_count <> v_expected then
    raise exception 'Um ou mais números não estão mais disponíveis' using errcode = '23505';
  end if;
  return v_count;
end $$;

-- Seleção aleatória atômica: escolhe e reserva N disponíveis de uma vez.
create or replace function reserve_random_numbers(
  p_campaign uuid, p_count integer, p_reservation uuid, p_order_item uuid
) returns integer[] language plpgsql as $$
declare
  v_ttl integer;
  v_numbers integer[];
begin
  select reservation_ttl_minutes into v_ttl
    from public.raffle_campaigns where id = p_campaign;

  with picked as (
    select id, number
      from public.campaign_numbers
     where campaign_id = p_campaign and status = 'available'
     order by random()
     limit p_count
     for update skip locked
  ), upd as (
    update public.campaign_numbers cn
       set status = 'reserved',
           reservation_id = p_reservation,
           order_item_id = p_order_item,
           reservation_expires_at = now() + make_interval(mins => coalesce(v_ttl, 15))
      from picked
     where cn.id = picked.id
     returning cn.number
  )
  select array_agg(number order by number) into v_numbers from upd;

  if coalesce(array_length(v_numbers, 1), 0) <> p_count then
    raise exception 'Não há % números disponíveis', p_count using errcode = '23505';
  end if;
  return v_numbers;
end $$;

-- ------------------------------------------------------------
-- Triggers updated_at
-- ------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'customers','events','ticket_types','campaign_packs','orders',
    'offers','reservations','payments'
  ] loop
    execute format(
      'drop trigger if exists trg_%s_updated on public.%I;
       create trigger trg_%s_updated before update on public.%I
       for each row execute function set_updated_at();', t, t, t, t);
  end loop;
end $$;

-- ============================================================
-- RLS
-- ============================================================
alter table public.customers enable row level security;
alter table public.events enable row level security;
alter table public.ticket_types enable row level security;
alter table public.campaign_packs enable row level security;
alter table public.orders enable row level security;
alter table public.offers enable row level security;
alter table public.order_items enable row level security;
alter table public.reservations enable row level security;
alter table public.payments enable row level security;
alter table public.consents enable row level security;

-- Leitura pública: só catálogo (evento publicado, ingressos ativos, packs/ofertas ativos).
drop policy if exists "public read events" on public.events;
create policy "public read events" on public.events
  for select using (status <> 'draft');

drop policy if exists "public read ticket_types" on public.ticket_types;
create policy "public read ticket_types" on public.ticket_types
  for select using (
    status <> 'draft'
    and exists (select 1 from public.events e where e.id = event_id and e.status <> 'draft')
  );

drop policy if exists "public read campaign_packs" on public.campaign_packs;
create policy "public read campaign_packs" on public.campaign_packs
  for select using (
    active
    and exists (select 1 from public.raffle_campaigns c where c.id = campaign_id and c.status <> 'draft')
  );

drop policy if exists "public read offers" on public.offers;
create policy "public read offers" on public.offers
  for select using (active);

-- Dados de cliente/pedido/pagamento: SEM leitura pública. Só admin + service role.
do $$
declare t text;
begin
  foreach t in array array[
    'customers','events','ticket_types','campaign_packs','orders','offers',
    'order_items','reservations','payments','consents'
  ] loop
    execute format('drop policy if exists "admin all %s" on public.%I;', t, t);
    execute format(
      'create policy "admin all %s" on public.%I
         for all using (auth.uid() is not null) with check (auth.uid() is not null);', t, t);
  end loop;
end $$;
