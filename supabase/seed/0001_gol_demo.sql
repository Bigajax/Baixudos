-- ============================================================
-- SEED DEMO — Campanha "Gol vermelho" (Milestone 1)
-- Aplicar DEPOIS de 0001_raffle.sql.
--
-- ⚠️ DADOS DE DEMONSTRAÇÃO — substituíveis pelo painel admin.
-- Datas fictícias, regulamento/specs = placeholders. NÃO são
-- informações oficiais. `is_demo = true` sinaliza isso.
-- `legal_review_confirmed = true` aqui é só para permitir a
-- publicação da DEMO em ambiente de teste — numa campanha real,
-- deve refletir revisão jurídica de verdade.
-- Idempotente: pode rodar mais de uma vez sem duplicar.
-- ============================================================

do $$
declare
  v_id uuid;
begin
  select id into v_id from public.raffle_campaigns where slug = 'gol-vermelho';

  if v_id is null then
    insert into public.raffle_campaigns (
      slug, title, subtitle, description, category,
      prize_title, prize_description,
      prize_model, prize_year, prize_color, prize_condition, prize_details,
      total_numbers, price_cents,
      status,
      sales_open_at, sales_close_at, draw_at, published_at,
      location_label, event_label, event_description, event_address, event_map_url,
      highlight_image_url, regulation_url, support_channel, draw_method,
      is_demo, legal_review_confirmed
    ) values (
      'gol-vermelho',
      'Gol vermelho',
      'Números da sorte · Baixudos.PR',
      'Concorra a um Gol vermelho rebaixado no maior encontro da Baixudos.PR. Escolha seus números, garanta sua participação e acompanhe a apuração ao vivo no evento.',
      'veiculo',
      'Gol vermelho',
      '[A CONFIRMAR] Descrição oficial do prêmio será publicada pelo administrador.',
      'Volkswagen Gol',            -- fato visível na foto
      '[A CONFIRMAR]',
      'Vermelho',                  -- fato visível na foto
      '[A CONFIRMAR]',
      '[A CONFIRMAR] Documentação e detalhes definidos pelo administrador.',
      2000,
      2500,                        -- R$ 25,00
      'published',
      now(),
      now() + interval '4 months',
      now() + interval '4 months' + interval '2 days',
      now(),
      'Race Park Maringá Motorsport',
      'Baixudos.PR — 9ª Edição',
      '[DEMO] A apuração e a entrega do prêmio acontecem durante o evento. Programação a confirmar.',
      '[A CONFIRMAR] Endereço completo do evento.',
      'https://www.google.com/maps/search/?api=1&query=Race+Park+Maring%C3%A1+Motorsport',
      '/images/gol-vermelho-studio.jpg',
      '/regulamento-gol-vermelho-demo.pdf',  -- placeholder DEMO
      'WhatsApp oficial da Baixudos.PR',
      '[A CONFIRMAR conforme regulamento oficial]',
      true,
      true
    )
    returning id into v_id;
  end if;

  -- Materializa os 2.000 números (idempotente).
  perform provision_campaign_numbers(v_id);

  -- Demonstra a legenda: alguns confirmados e alguns bloqueados.
  update public.campaign_numbers
     set status = 'confirmed'
   where campaign_id = v_id and number <= 48 and status = 'available';

  update public.campaign_numbers
     set status = 'blocked'
   where campaign_id = v_id and number in (500, 1000, 1500) and status = 'available';

  -- Mídia principal (placeholder local). Idempotente.
  if not exists (select 1 from public.campaign_media where campaign_id = v_id) then
    insert into public.campaign_media (campaign_id, kind, url, alt_text, sort_order)
    values (v_id, 'image', '/images/gol-vermelho-studio.jpg',
            'Gol vermelho rebaixado à noite (DEMO)', 0);
  end if;
end $$;

-- Conferência rápida (opcional):
-- select status, count(*) from public.campaign_numbers
--   where campaign_id = (select id from public.raffle_campaigns where slug='gol-vermelho')
--   group by status order by status;
