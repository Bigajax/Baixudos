/**
 * Cliente Supabase ADMIN — usa a SERVICE ROLE KEY e BYPASSA a RLS.
 * `import "server-only"` garante erro de build se algum código de cliente
 * tentar importar isto. Uso: seed, mutações do painel admin, jobs de
 * expiração de reserva (M2+). NUNCA usar para leitura pública.
 */
import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}
