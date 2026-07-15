# Baixudos.PR — Portal oficial

Site da marca automotiva **Baixudos.PR** (Maringá — PR): eventos, inscrição de veículos,
loja, parceiros, comunidade e área informativa de campanhas.

**Stack:** Next.js 16 · TypeScript · Tailwind CSS 4 · React Hook Form + Zod · Framer Motion

## Rodar o projeto

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # build de produção
```

## Onde editar o conteúdo

Todo o conteúdo editável fica em `content/` — nada de dado real inventado; os campos
pendentes estão marcados com `[PLACEHOLDER]`, `[NÚMERO]`, `[DATA...]` etc.

| Arquivo | O que controla |
| --- | --- |
| `content/site.ts` | **WhatsApp oficial (trocar o placeholder!)**, e-mail, CNPJ, modo da loja, estatísticas da home, mensagens do WhatsApp |
| `content/events.ts` | Próximo evento (9ª edição), link de ingressos, lotes, eventos passados |
| `content/editions.ts` | Grade de edições anteriores e galerias |
| `content/products.ts` | Produtos da loja (os atuais são demonstração) |
| `content/sponsors.ts` | Patrocinadores por categoria (vazio até haver marcas reais) |
| `content/testimonials.ts` | Depoimentos (placeholders até haver relatos autorizados) |
| `content/faq.ts` | Perguntas frequentes |
| `content/campaigns.ts` | Campanhas (desativadas por padrão; exigem compliance completo) |

### Pendências antes do lançamento

1. `content/site.ts` → `whatsapp`: trocar `5544999999999` pelo número real.
2. `content/events.ts` → data, local e link de ingressos da 9ª edição quando confirmados.
3. `app/sitemap.ts` e `app/robots.ts` → domínio real.
4. Produtos reais na loja e patrocinadores reais.
5. Revisão jurídica das páginas de privacidade/termos/cookies.

## Imagens

- `public/images/` — fotos reais do Instagram @baixudos.pr com nomes semânticos.
- `_staging/` — todas as 90 fotos baixadas do perfil + folhas de contato (`sheet_*.jpg`)
  para escolher substituições. Pode ser apagada quando não for mais útil.

## Campanhas (importante)

A área `/campanhas` é **apenas informativa** e vem desativada (`campaignsEnabled: false`).
O site não opera venda de números, sorteio, apuração nem pagamento — isso acontece na
plataforma externa da empresa promotora. Uma campanha só aparece quando **todos** os campos
de compliance estão preenchidos **e** `legalReviewConfirmed: true` (confirmação de revisão
pelo responsável jurídico). A mesma regra existe como `constraint` no banco.

## Banco de dados (Supabase)

`supabase/schema.sql` contém o schema completo (eventos, lotes, inscrições de veículos com
status recebida/em análise/aprovada/recusada/aguardando informações, produtos, pedidos,
patrocinadores, edições, galerias, depoimentos, leads, contatos comerciais, campanhas com
trava de compliance, site_settings e audit_log) com RLS configurado.

Nesta primeira versão o site é **estático**: os formulários validam com Zod e enviam os
dados formatados para o WhatsApp da organização — funciona sem backend. Quando o painel
administrativo for implementado, os mesmos formulários passam a gravar no Supabase.

## Analytics e cookies

O banner de cookies (Aceitar / Recusar / Personalizar) dispara o evento
`bxpr:consent` no `window`. Inicialize Google Analytics / Meta Pixel **somente** dentro
desse evento, respeitando as categorias aceitas (`analytics`, `marketing`).
