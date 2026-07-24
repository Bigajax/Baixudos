-- ============================================================
-- SEED DEMO — Checkout integrado (Fase 1)
-- Packs do Gol vermelho, evento 9ª edição, ingressos e ofertas cruzadas.
-- ⚠️ VALORES DE DEMONSTRAÇÃO — todos editáveis pelo painel. Não são
-- preços/condições oficiais. Aplicar DEPOIS de 0002_checkout.sql.
-- Idempotente.
-- ============================================================

do $$
declare
  v_campaign uuid;
  v_event uuid;
  v_ticket uuid;
  v_pack10 uuid;
begin
  select id into v_campaign from public.raffle_campaigns where slug = 'gol-vermelho';
  if v_campaign is null then
    raise notice 'Campanha gol-vermelho não encontrada — rode 0001_gol_demo.sql antes.';
    return;
  end if;

  -- ---------- Evento ----------
  select id into v_event from public.events where slug = '9-edicao';
  if v_event is null then
    insert into public.events (slug, title, description, location, address, map_url, capacity, status)
    values (
      '9-edicao',
      'Baixudos.PR — 9ª Edição',
      '[DEMO] Encontro da Baixudos.PR com apuração e premiação do Gol vermelho ao vivo.',
      'Race Park Maringá Motorsport',
      '[A CONFIRMAR] Endereço completo do evento.',
      'https://www.google.com/maps/search/?api=1&query=Race+Park+Maring%C3%A1+Motorsport',
      2000,
      'published'
    )
    returning id into v_event;
  end if;

  -- Vincula a campanha ao evento + versão do regulamento (demo)
  update public.raffle_campaigns
     set event_id = v_event, regulation_version = coalesce(regulation_version, 'demo-v1')
   where id = v_campaign;

  -- ---------- Ingresso (1º lote) ----------
  select id into v_ticket from public.ticket_types where event_id = v_event and lot_name = '1º lote';
  if v_ticket is null then
    insert into public.ticket_types (
      event_id, title, lot_name, price_cents, available_quantity,
      max_per_customer, status, display_order
    ) values (
      v_event, 'Ingresso — Evento Baixudos.PR', '1º lote', 3000, 500, 6, 'active', 0
    )
    returning id into v_ticket;
  end if;

  -- ---------- Packs de números ----------
  -- individual = raffle_campaigns.price_cents (R$ 25). Packs abaixo:
  if not exists (select 1 from public.campaign_packs where campaign_id = v_campaign) then
    insert into public.campaign_packs
      (campaign_id, title, number_quantity, original_price_cents, promotional_price_cents, display_order)
    values
      (v_campaign, 'Pack com 2',  2,  5000,  4900, 1),
      (v_campaign, 'Pack com 5',  5, 12500, 11990, 2),
      (v_campaign, 'Pack com 10', 10, 25000, 19990, 3),
      (v_campaign, 'Pack com 20', 20, 50000, 37990, 4);
  end if;
  select id into v_pack10 from public.campaign_packs
    where campaign_id = v_campaign and number_quantity = 10 limit 1;

  -- ---------- Ofertas cruzadas ----------
  -- Ingresso oferecido durante a compra de números
  if not exists (select 1 from public.offers where offer_type = 'campaign_ticket_addon' and campaign_id = v_campaign) then
    insert into public.offers (
      title, description, cta_label, offer_type,
      campaign_id, event_id, ticket_type_id, active, display_order
    ) values (
      'Acompanhe a apuração ao vivo',
      'A apuração e a premiação do Gol vermelho acontecerão durante o evento da Baixudos.PR. Adicione seu ingresso ao pedido e participe dessa experiência.',
      'Adicionar ingresso',
      'campaign_ticket_addon',
      v_campaign, v_event, v_ticket, true, 0
    );
  end if;

  -- Números oferecidos durante a compra do ingresso (proporcional 1:1, número a R$ 20 no combo)
  if not exists (select 1 from public.offers where offer_type = 'ticket_number_ratio_offer' and event_id = v_event) then
    insert into public.offers (
      title, description, cta_label, offer_type,
      campaign_id, event_id, ticket_number_ratio, promotional_number_price_cents, active, display_order
    ) values (
      'Quer também concorrer ao Gol vermelho?',
      'A apuração acontecerá durante este evento. Adicione números da campanha ao seu pedido.',
      'Escolher números',
      'ticket_number_ratio_offer',
      v_campaign, v_event, 1, 2000, true, 0
    );
  end if;

  -- Pack em destaque oferecido no checkout do ingresso
  if v_pack10 is not null and not exists (
    select 1 from public.offers where offer_type = 'campaign_pack_offer' and campaign_pack_id = v_pack10
  ) then
    insert into public.offers (
      title, description, cta_label, offer_type,
      campaign_id, event_id, campaign_pack_id, active, display_order
    ) values (
      'Pack com 10 números',
      'Participe com um pack de números em condição especial.',
      'Escolher pack com 10',
      'campaign_pack_offer',
      v_campaign, v_event, v_pack10, true, 1
    );
  end if;
end $$;
