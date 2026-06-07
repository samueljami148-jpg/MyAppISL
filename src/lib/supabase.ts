import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function env(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}`);
  return value;
}

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("NEXT_PUBLIC_SUPABASE_ANON_KEY"), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot write cookies; route handlers and actions can.
        }
      }
    }
  });
}

// The project can replace this with generated Supabase types after linking a project.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UntypedSupabaseClient = SupabaseClient<any, "public", any>;

let adminClient: UntypedSupabaseClient | null = null;

export function createSupabaseAdminClient() {
  if (!adminClient) {
    adminClient = createClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
      auth: {
        persistSession: false
      }
    }) as UntypedSupabaseClient;
  }
  return adminClient;
}
