/**
 * Cliente Supabase para o NAVEGADOR (Client Components).
 * Usa a anon/publishable key — protegido por RLS. Nunca coloque a
 * service role key aqui. Uso previsto: refetch da grade e mutações do M2+.
 */
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
