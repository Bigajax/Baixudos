/**
 * Cliente Supabase para o SERVIDOR (Server Components, Route Handlers,
 * Server Actions). Respeita RLS (usa a anon key) e integra os cookies
 * do App Router. Leitura pública da campanha/grade passa por aqui.
 *
 * Next 16: `cookies()` é assíncrono — por isso a fábrica é `async`.
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Chamado de dentro de um Server Component (não pode escrever
            // cookies). Seguro ignorar quando a renovação de sessão é
            // feita no proxy/route handler.
          }
        },
      },
    },
  );
}
