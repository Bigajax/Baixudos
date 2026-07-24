-- ============================================================
-- BAIXUDOS.PR — RPCs de pedido/reserva/confirmação (Fase 3)
-- Reserva de ingresso, confirmação transacional idempotente (webhook)
-- e liberação (expiração/cancelamento). Aplicar DEPOIS de 0002_checkout.sql.
-- Idempotente (create or replace).
-- ============================================================

-- Reserva atômica de ingresso: só reserva se houver saldo (evita overbooking).
create or replace function reserve_ticket(p_ticket uuid, p_qty integer)
returns boolean language plpgsql as $$
declare v_rows integer;
begin
  update public.ticket_types
     set reserved_quantity = reserved_quantity + p_qty
   where id = p_ticket
     and status = 'active'
     and (available_quantity - sold_quantity - reserved_quantity) >= p_qty;
  get diagnostics v_rows = row_count;
  return v_rows = 1;
end $$;

-- Confirmação do pedido: idempotente e transacional. Chamada pelo webhook
-- (ou pela simulação sandbox). Só confirma se a reserva ainda for válida.
create or replace function confirm_order(p_provider_payment_id text)
returns text language plpgsql as $$
declare
  v_payment public.payments;
  v_order public.orders;
  v_reservation public.reservations;
begin
  select * into v_payment from public.payments
   where provider_payment_id = p_provider_payment_id
   order by created_at desc limit 1;
  if not found then
    raise exception 'Pagamento não encontrado';
  end if;

  select * into v_order from public.orders where id = v_payment.order_id for update;

  -- Idempotência: já pago → devolve o código sem reprocessar.
  if v_order.status = 'paid' then
    return v_order.public_code;
  end if;

  select * into v_reservation from public.reservations
   where order_id = v_order.id order by created_at desc limit 1 for update;

  -- Reserva expirada → libera tudo e recusa a confirmação tardia.
  if found and v_reservation.expires_at < now() then
    update public.campaign_numbers
       set status = 'available', reservation_id = null,
           order_item_id = null, reservation_expires_at = null
     where reservation_id = v_reservation.id and status = 'reserved';
    update public.ticket_types tt
       set reserved_quantity = greatest(reserved_quantity - oi.quantity, 0)
      from public.order_items oi
     where oi.order_id = v_order.id and oi.item_type = 'event_ticket'
       and oi.ticket_type_id = tt.id;
    update public.reservations set status = 'expired' where id = v_reservation.id;
    update public.orders set status = 'expired', payment_status = 'expired' where id = v_order.id;
    update public.payments set status = 'expired' where id = v_payment.id;
    raise exception 'Reserva expirada';
  end if;

  -- Números: reservado → confirmado
  update public.campaign_numbers
     set status = 'confirmed'
   where reservation_id = v_reservation.id and status = 'reserved';

  -- Ingressos: reservado → vendido
  update public.ticket_types tt
     set reserved_quantity = greatest(reserved_quantity - oi.quantity, 0),
         sold_quantity = sold_quantity + oi.quantity
    from public.order_items oi
   where oi.order_id = v_order.id and oi.item_type = 'event_ticket'
     and oi.ticket_type_id = tt.id;

  update public.reservations set status = 'consumed' where id = v_reservation.id;
  update public.payments set status = 'approved', paid_at = now() where id = v_payment.id;
  update public.orders set status = 'paid', payment_status = 'approved', paid_at = now()
   where id = v_order.id;

  return v_order.public_code;
end $$;

-- Liberação de pedido não pago (expiração/cancelamento). Idempotente.
create or replace function release_order(p_order uuid, p_status text default 'expired')
returns void language plpgsql as $$
declare v_order public.orders;
begin
  select * into v_order from public.orders where id = p_order for update;
  if not found or v_order.status = 'paid' then
    return;
  end if;

  update public.campaign_numbers
     set status = 'available', reservation_id = null,
         order_item_id = null, reservation_expires_at = null
   where order_item_id in (select id from public.order_items where order_id = p_order)
      or reservation_id in (select id from public.reservations where order_id = p_order);

  update public.ticket_types tt
     set reserved_quantity = greatest(reserved_quantity - oi.quantity, 0)
    from public.order_items oi
   where oi.order_id = p_order and oi.item_type = 'event_ticket'
     and oi.ticket_type_id = tt.id;

  update public.reservations set status = 'cancelled'
   where order_id = p_order and status = 'active';
  update public.orders
     set status = p_status,
         payment_status = case when p_status = 'cancelled' then 'pending' else 'expired' end
   where id = p_order;
end $$;
