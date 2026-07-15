-- ============================================================
-- BAIXUDOS.PR — Schema do banco (Supabase / PostgreSQL)
-- Executar no SQL Editor do projeto Supabase.
-- Todas as tabelas têm timestamps e campos de auditoria.
-- RLS habilitado: leitura pública apenas do que é público;
-- escrita/gestão apenas para usuários autenticados (admin).
-- ============================================================

-- Extensões
create extension if not exists "pgcrypto";

-- ---------- Função de updated_at ----------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------- users (perfil de administradores) ----------
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  role text not null default 'admin' check (role in ('admin', 'editor')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- events ----------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  edition text,
  status text not null default 'rascunho'
    check (status in ('rascunho', 'anunciado', 'ingressos', 'realizado', 'cancelado')),
  event_date timestamptz,
  time_label text,
  venue text,
  city text default 'Maringá — PR',
  description text,
  cover_url text,
  ticket_url text,
  map_url text,
  published boolean not null default false,
  created_by uuid references public.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- event_batches (lotes) ----------
create table if not exists public.event_batches (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  name text not null,
  price_cents integer,
  available boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- vehicle_applications (inscrições de veículos) ----------
create table if not exists public.vehicle_applications (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events (id) on delete set null,
  full_name text not null,
  whatsapp text not null,
  email text not null,
  instagram text,
  city text not null,
  state text not null,
  vehicle_brand text not null,
  vehicle_model text not null,
  vehicle_year text not null,
  modifications text not null,
  category text not null check (category in (
    'Rebaixado', 'Suspensão fixa', 'Suspensão a ar', 'Projeto de rodas',
    'Som automotivo', 'Clássico', 'Performance', 'Customizado', 'Outro'
  )),
  story text,
  status text not null default 'recebida' check (status in (
    'recebida', 'em_analise', 'aprovada', 'recusada', 'aguardando_informacoes'
  )),
  terms_accepted_at timestamptz not null,
  contact_consent_at timestamptz not null,
  reviewed_by uuid references public.users (id),
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- vehicle_application_images ----------
create table if not exists public.vehicle_application_images (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.vehicle_applications (id) on delete cascade,
  storage_path text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- products ----------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  price_cents integer,
  image_url text,
  available boolean not null default false,
  is_demo boolean not null default false,
  checkout_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- product_variations ----------
create table if not exists public.product_variations (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  name text not null,        -- ex.: "Tamanho"
  value text not null,       -- ex.: "M"
  stock integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- orders (pedidos / links de WhatsApp) ----------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products (id) on delete set null,
  variation_id uuid references public.product_variations (id) on delete set null,
  customer_name text,
  customer_whatsapp text,
  channel text not null default 'whatsapp' check (channel in ('whatsapp', 'checkout')),
  status text not null default 'novo' check (status in ('novo', 'em_andamento', 'concluido', 'cancelado')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- sponsors ----------
create table if not exists public.sponsors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tier text not null check (tier in (
    'Patrocinador principal', 'Patrocinador oficial', 'Apoiador', 'Expositor'
  )),
  logo_url text,
  site_url text,
  event_id uuid references public.events (id) on delete set null,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- previous_editions ----------
create table if not exists public.previous_editions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  year integer,
  date_label text,
  venue text,
  cover_url text,
  summary text,
  video_url text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- gallery_images ----------
create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  edition_id uuid references public.previous_editions (id) on delete cascade,
  event_id uuid references public.events (id) on delete cascade,
  storage_path text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- testimonials ----------
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  author text not null,
  role text not null,
  approved boolean not null default false,  -- só publicar com autorização do autor
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- leads (lista de avisos) ----------
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  whatsapp text not null,
  city text,
  source text default 'site',
  consent_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- ---------- contact_requests (comercial) ----------
create table if not exists public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  segment text,
  phone text not null,
  email text not null,
  instagram text,
  interest text not null check (interest in (
    'Patrocínio', 'Exposição de produtos', 'Estande', 'Alimentação',
    'Mídia', 'Influenciador', 'Cobertura', 'Outro'
  )),
  message text,
  status text not null default 'novo' check (status in ('novo', 'em_contato', 'fechado', 'descartado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- campaigns (área informativa; operação é externa) ----------
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  vehicle_model text,
  vehicle_year text,
  vehicle_engine text,
  vehicle_story text,
  external_url text,          -- plataforma externa responsável pela operação
  video_url text,
  -- Compliance obrigatório antes da publicação:
  promoter_company text,
  legal_name text,
  cnpj text,
  regulation_pdf_url text,
  period text,
  eligibility text,
  operator text,
  certificate text,
  draw_method text,
  support_channel text,
  privacy_policy_url text,
  terms_url text,
  legal_review_confirmed boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Uma campanha só pode ser publicada com compliance completo e revisão jurídica confirmada
  constraint campaign_publish_requires_compliance check (
    not published or (
      legal_review_confirmed
      and promoter_company is not null
      and legal_name is not null
      and cnpj is not null
      and regulation_pdf_url is not null
      and period is not null
      and eligibility is not null
      and operator is not null
      and draw_method is not null
      and support_channel is not null
      and privacy_policy_url is not null
      and terms_url is not null
    )
  )
);

-- ---------- campaign_documents ----------
create table if not exists public.campaign_documents (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  name text not null,
  storage_path text not null,
  created_at timestamptz not null default now()
);

-- ---------- site_settings ----------
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_by uuid references public.users (id),
  updated_at timestamptz not null default now()
);

-- ---------- audit_log (registro de alterações importantes) ----------
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id),
  action text not null,
  entity text not null,
  entity_id uuid,
  payload jsonb,
  created_at timestamptz not null default now()
);

-- ---------- Triggers de updated_at ----------
do $$
declare t text;
begin
  foreach t in array array[
    'users','events','event_batches','vehicle_applications','products',
    'product_variations','orders','sponsors','previous_editions',
    'testimonials','contact_requests','campaigns'
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
alter table public.users enable row level security;
alter table public.events enable row level security;
alter table public.event_batches enable row level security;
alter table public.vehicle_applications enable row level security;
alter table public.vehicle_application_images enable row level security;
alter table public.products enable row level security;
alter table public.product_variations enable row level security;
alter table public.orders enable row level security;
alter table public.sponsors enable row level security;
alter table public.previous_editions enable row level security;
alter table public.gallery_images enable row level security;
alter table public.testimonials enable row level security;
alter table public.leads enable row level security;
alter table public.contact_requests enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_documents enable row level security;
alter table public.site_settings enable row level security;
alter table public.audit_log enable row level security;

-- Leitura pública apenas de conteúdo publicado
create policy "public read events" on public.events
  for select using (published = true);
create policy "public read batches" on public.event_batches
  for select using (exists (select 1 from public.events e where e.id = event_id and e.published));
create policy "public read products" on public.products
  for select using (true);
create policy "public read variations" on public.product_variations
  for select using (true);
create policy "public read sponsors" on public.sponsors
  for select using (active = true);
create policy "public read editions" on public.previous_editions
  for select using (published = true);
create policy "public read gallery" on public.gallery_images
  for select using (true);
create policy "public read testimonials" on public.testimonials
  for select using (approved = true);
create policy "public read campaigns" on public.campaigns
  for select using (published = true and legal_review_confirmed = true);

-- Inserção pública (formulários do site) — sem leitura pública
create policy "public insert applications" on public.vehicle_applications
  for insert with check (true);
create policy "public insert leads" on public.leads
  for insert with check (true);
create policy "public insert contacts" on public.contact_requests
  for insert with check (true);

-- Administradores autenticados: acesso total
create policy "admin all users" on public.users
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "admin all events" on public.events
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "admin all batches" on public.event_batches
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "admin all applications" on public.vehicle_applications
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "admin all application images" on public.vehicle_application_images
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "admin all products" on public.products
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "admin all variations" on public.product_variations
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "admin all orders" on public.orders
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "admin all sponsors" on public.sponsors
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "admin all editions" on public.previous_editions
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "admin all gallery" on public.gallery_images
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "admin all testimonials" on public.testimonials
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "admin read leads" on public.leads
  for select using (auth.uid() is not null);
create policy "admin all contacts" on public.contact_requests
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "admin all campaigns" on public.campaigns
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "admin all campaign docs" on public.campaign_documents
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "admin all settings" on public.site_settings
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "admin read audit" on public.audit_log
  for select using (auth.uid() is not null);
