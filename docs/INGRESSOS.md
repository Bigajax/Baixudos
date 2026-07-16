# Ingressos Baixudos.PR — Como funciona (modelo Sympla)

Decisão registrada em julho/2026: os ingressos são vendidos por uma **plataforma
pronta (Sympla)**. O site oficial é a vitrine e aponta o botão "Comprar" para o
checkout da plataforma. O conteúdo do site (fotos, textos, datas exibidas)
continua sendo atualizado via código, sob demanda da organização.

---

## 1. O fluxo completo

```
Comprador                    Sympla                       Portaria
────────────                 ──────                       ────────
Vê o evento no site   →   Paga (Pix/cartão)      →   Apresenta QR code
baixudospr + clica        Recebe ingresso com        Porteiro escaneia com o
"Comprar ingresso"        QR code por e-mail e       app gratuito Sympla
                          no app da Sympla           Check-in → entrada liberada
                                                     (QR só vale 1 vez)
```

- **Compra:** Pix, cartão de crédito (parcelado) e boleto, direto na página do
  evento na Sympla. O comprador não precisa de conta pra comprar.
- **Liberação:** o ingresso com QR code chega **automaticamente** por e-mail
  logo após a confirmação do pagamento (Pix confirma na hora). Também fica
  disponível no app da Sympla.
- **Validação na portaria:** app **Sympla Check-in** (gratuito, Android/iOS) em
  qualquer celular. O porteiro escaneia o QR code; ingresso já usado aparece em
  vermelho na hora. Funciona com mais de um celular ao mesmo tempo (várias
  filas). Recomendado: baixar a lista offline no app antes de abrir os portões,
  para não depender de internet no Race Park.

## 2. O que o dono gerencia no painel da Sympla (sem código)

Tudo isso é feito em https://www.sympla.com.br/produtores, pelo celular ou
computador:

| Ação                       | Onde                                          |
| -------------------------- | --------------------------------------------- |
| Trocar valor do ingresso   | Editar evento → Ingressos                     |
| Abrir 2º lote / novo lote  | Ingressos → criar tipo novo (pode agendar     |
|                            | início automático quando o 1º lote esgotar    |
|                            | ou por data)                                  |
| Mudar data / horário       | Editar evento → Data e horário                |
| Trocar imagem do evento    | Editar evento → Imagem de divulgação          |
| Ver vendas em tempo real   | Painel → Relatórios                           |
| Cadastrar porteiros        | Colaboradores → permissão só de check-in      |

**Lotes automáticos:** ao criar os ingressos dá pra configurar "2º lote começa
quando o 1º esgotar" ou "2º lote começa em DD/MM". Sobe sozinho, sem ninguém
precisar mexer.

## 3. Dinheiro e taxas

- O valor das vendas fica na conta Sympla do organizador e é **repassado para a
  conta bancária cadastrada** (o repasse padrão ocorre após o evento; há opção
  de antecipação).
- Taxa de serviço: **10% por ingresso** — o organizador escolhe se repassa ao
  comprador (ingresso de R$ 60 sai por R$ 66) ou se absorve. Ingressos até
  R$ 39,90 pagam taxa mínima de R$ 3,99. Há ainda taxa de processamento de
  pagamento (~2–2,5%) que não pode ser repassada. Conferir valores vigentes em
  https://produtores.sympla.com.br/quanto-custa/ ao criar o evento.
- A conta de produtor pode ser **CPF ou CNPJ**. Recomendado: CNPJ da
  organização, com conta bancária no mesmo titular.

## 4. Papel do site (baixudospr)

- O site divulga o evento, lotes e valores **exibidos** (`content/events.ts`).
- Quando o evento estiver criado na Sympla, colar o link no campo `ticketUrl`
  do evento em `content/events.ts`. A página troca automaticamente o formulário
  de WhatsApp pelo botão "Comprar ingresso" apontando pra Sympla.
- Manter os valores exibidos no site em sincronia com a Sympla é manual (pedido
  → edição → publicação). O site é vitrine; a fonte da verdade de preço/lote é
  sempre a Sympla.

## 5. Checklist para colocar a 9ª edição à venda

- [ ] Criar conta de produtor na Sympla (CNPJ + conta bancária + e-mail oficial)
- [ ] Criar o evento: nome, data 25/10/2026, horário, Race Park Maringá
      Motorsport, imagem de capa, descrição
- [ ] Criar ingressos: 1º lote (valor oficial + quantidade), 2º lote agendado
      (por esgotamento ou data)
- [ ] Decidir: taxa repassada ao comprador ou absorvida
- [ ] Publicar o evento e copiar o link
- [ ] Colar o link em `ticketUrl` no `content/events.ts` + atualizar valores
      exibidos + publicar o site
- [ ] Antes do evento: baixar o app Sympla Check-in nos celulares da portaria,
      cadastrar colaboradores e testar o scanner com um ingresso de cortesia
