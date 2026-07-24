-- ============================================================
-- BAIXUDOS.PR — Rifa / Números da sorte (Milestone 1)
-- Migration transacional, multi-campanha. Aplicar no SQL Editor
-- do Supabase (ou `supabase db push`). NÃO edita schema.sql (baseline).
--
-- Convenções espelhadas do schema.sql: gen_random_uuid(), timestamps
-- timestamptz, status como text+check, trigger set_updated_at(),
-- RLS "leitura pública do publicado / escrita só admin+service role".
-- Auto-contida e idempotente (create if not exists / drop policy if exists).
-- ============================================================

create extension if not exists "pgcrypto";

-- set_updated_at() pode já existir (schema.sql). Recriar é seguro.
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ------------------------------------------------------------
-- raffle_campaigns — uma campanha de números da sorte
-- (separada da tabela `campaigns` legada/informativa)
-- ------------------------------------------------------------
create table if not exists public.raffle_campaigns (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text,
  description text,
  category text,

  -- Prêmio (placeholders até o conteúdo real — não inventar dados)
  prize_title text not null,
  prize_description text,
  prize_model text,
  prize_year text,
  prize_color text,
  prize_condition text,
  prize_details text,

  -- Números e preço
  total_numbers integer not null default 2000 check (total_numbers > 0),
  price_cents integer not null check (price_cents >= 0),
  number_padding integer not null default 4 check (number_padding between 1 and 8),
  min_per_order integer not null default 1 check (min_per_order >= 1),
  max_per_order integer not null default 20 check (max_per_order >= 1),
  reservation_ttl_minutes integer not null default 30 check (reservation_ttl_minutes > 0),
  random_quick_picks integer[] not null default '{1,2,5,10}',

  -- Ciclo de vida
  status text not null default 'draft'
    check (status in ('draft','published','paused','drawn','closed')),
  sales_open_at timestamptz,
  sales_close_at timestamptz,
  draw_at timestamptz,
  published_at timestamptz,

  -- Evento
  location_label text,
  event_label text,
  event_description text,
  event_address text,
  event_map_url text,

  -- Mídia principal / documentos / transparência
  highlight_image_url text,
  regulation_url text,
  certificate_url text,
  privacy_policy_url text,
  terms_url text,
  support_channel text,
  draw_method text,

  -- Config
  show_gross_revenue boolean not null default false,  -- faturamento oculto por padrão
  is_demo boolean not null default false,
  legal_review_confirmed boolean not null default false,

  -- Resultado (M6)
  result_number integer,
  result_published_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Trava de compliance: só sai de 'draft' com revisão jurídica confirmada,
  -- regulamento e canal de suporte presentes.
  constraint raffle_publish_requires_compliance check (
    status = 'draft' or (
      legal_review_confirmed
      and regulation_url is not null
      and support_channel is not null
    )
  )
);

-- ------------------------------------------------------------
-- raffle_orders — pedido (STUB estrutural do M2; sem lógica ainda)
-- ------------------------------------------------------------
create table if not exists public.raffle_orders (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.raffle_campaigns (id) on delete cascade,
  public_code text unique,
  customer_name text,
  customer_whatsapp text,
  customer_email text,
  customer_cpf text,
  quantity integer not null default 0,
  unit_price_cents integer not null default 0,
  total_cents integer not null default 0,
  status text not null default 'draft'
    check (status in ('draft','awaiting_payment','paid','expired','cancelled','refunded')),
  reserved_until timestamptz,
  external_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- campaign_numbers — 2.000 linhas materializadas por campanha.
-- Materializar torna a reserva do M2 um UPDATE atômico protegido
-- por unique(campaign_id, number) — impede venda duplicada.
-- ------------------------------------------------------------
create table if not exists public.campaign_numbers (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.raffle_campaigns (id) on delete cascade,
  number integer not null,
  status text not null default 'available'
    check (status in ('available','reserved','pending','confirmed','blocked','cancelled','won')),
  order_id uuid references public.raffle_orders (id) on delete set null,
  reserved_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_campaign_number unique (campaign_id, number)
);

create index if not exists idx_campaign_numbers_status
  on public.campaign_numbers (campaign_id, status);
-- Payload compacto da grade: só os NÃO-disponíveis.
create index if not exists idx_campaign_numbers_taken
  on public.campaign_numbers (campaign_id)
  where status <> 'available';

-- ------------------------------------------------------------
-- raffle_order_numbers — vínculo pedido↔número (STUB M2)
-- unique(campaign_number_id) = um número pertence a um único pedido
-- ------------------------------------------------------------
create table if not exists public.raffle_order_numbers (
  order_id uuid not null references public.raffle_orders (id) on delete cascade,
  campaign_number_id uuid not null references public.campaign_numbers (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (order_id, campaign_number_id),
  constraint uq_order_number unique (campaign_number_id)
);

-- ------------------------------------------------------------
-- campaign_media — imagens/vídeos do prêmio
-- ------------------------------------------------------------
create table if not exists public.campaign_media (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.raffle_campaigns (id) on delete cascade,
  kind text not null check (kind in ('image','video')),
  url text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_campaign_media_campaign
  on public.campaign_media (campaign_id, sort_order);

-- ------------------------------------------------------------
-- raffle_payments — cobrança Pix (STUB Mercado Pago, M3)
-- ------------------------------------------------------------
create table if not exists public.raffle_payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.raffle_orders (id) on delete cascade,
  provider text not null default 'mercadopago',
  provider_payment_id text,
  status text not null default 'pending'
    check (status in ('pending','approved','rejected','refunded','chargeback')),
  amount_cents integer not null default 0,
  pix_qr_code text,
  pix_qr_code_base64 text,
  ticket_url text,
  raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_raffle_payments_order
  on public.raffle_payments (order_id);

-- ------------------------------------------------------------
-- Função: provisiona os N números de uma campanha (idempotente).
-- Usada pelo seed e futuramente pelo painel admin ao criar campanha.
-- ------------------------------------------------------------
create or replace function provision_campaign_numbers(p_campaign uuid)
returns integer language plpgsql as $$
declare
  v_total integer;
  v_inserted integer;
begin
  select total_numbers into v_total
    from public.raffle_campaigns where id = p_campaign;
  if v_total is null then
    raise exception 'Campanha % não encontrada', p_campaign;
  end if;

  insert into public.campaign_numbers (campaign_id, number)
  select p_campaign, g
    from generate_series(1, v_total) as g
  on conflict (campaign_id, number) do nothing;

  get diagnostics v_inserted = row_count;
  return v_inserted;
end $$;

-- ------------------------------------------------------------
-- Função: reserva atômica (desenhada aqui; usada a partir do M2).
-- Concorrência: o UPDATE ... where status='available' é serializado
-- pelas travas de linha do Postgres — só UMA transação reserva cada
-- número. Se algum já não estiver disponível, levanta exceção e a
-- transação inteira sofre rollback (nenhuma reserva parcial).
-- ------------------------------------------------------------
create or replace function reserve_numbers(
  p_campaign uuid, p_numbers integer[], p_order uuid
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
         order_id = p_order,
         reserved_until = now() + make_interval(mins => v_ttl)
   where campaign_id = p_campaign
     and number = any(p_numbers)
     and status = 'available';

  get diagnostics v_count = row_count;

  if v_count <> v_expected then
    raise exception 'Um ou mais números não estão mais disponíveis'
      using errcode = '23505';
  end if;

  return v_count;
end $$;

-- ------------------------------------------------------------
-- Triggers de updated_at (tabelas com a coluna)
-- ------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'raffle_campaigns','raffle_orders','campaign_numbers','raffle_payments'
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
alter table public.raffle_campaigns enable row level security;
alter table public.campaign_numbers enable row level security;
alter table public.campaign_media enable row level security;
alter table public.raffle_orders enable row level security;
alter table public.raffle_order_numbers enable row level security;
alter table public.raffle_payments enable row level security;

-- Leitura pública: apenas campanhas fora de 'draft', e seus números/mídia.
drop policy if exists "public read raffle campaigns" on public.raffle_campaigns;
create policy "public read raffle campaigns" on public.raffle_campaigns
  for select using (status <> 'draft');

drop policy if exists "public read campaign numbers" on public.campaign_numbers;
create policy "public read campaign numbers" on public.campaign_numbers
  for select using (
    exists (
      select 1 from public.raffle_campaigns c
      where c.id = campaign_id and c.status <> 'draft'
    )
  );

drop policy if exists "public read campaign media" on public.campaign_media;
create policy "public read campaign media" on public.campaign_media
  for select using (
    exists (
      select 1 from public.raffle_campaigns c
      where c.id = campaign_id and c.status <> 'draft'
    )
  );

-- Pedidos/pagamentos: SEM leitura pública (LGPD). Só admin + service role.
drop policy if exists "admin all raffle campaigns" on public.raffle_campaigns;
create policy "admin all raffle campaigns" on public.raffle_campaigns
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

drop policy if exists "admin all campaign numbers" on public.campaign_numbers;
create policy "admin all campaign numbers" on public.campaign_numbers
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

drop policy if exists "admin all campaign media" on public.campaign_media;
create policy "admin all campaign media" on public.campaign_media
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

drop policy if exists "admin all raffle orders" on public.raffle_orders;
create policy "admin all raffle orders" on public.raffle_orders
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

drop policy if exists "admin all raffle order numbers" on public.raffle_order_numbers;
create policy "admin all raffle order numbers" on public.raffle_order_numbers
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

drop policy if exists "admin all raffle payments" on public.raffle_payments;
create policy "admin all raffle payments" on public.raffle_payments
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
