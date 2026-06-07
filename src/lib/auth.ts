import { redirect } from "next/navigation";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase";
import type { AppUser } from "@/types/database";

export async function getCurrentAppUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<AppUser>();

  if (error) throw error;
  return data;
}

export async function requireAppUser() {
  const user = await getCurrentAppUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireSuperAdmin() {
  const user = await requireAppUser();
  if (user.role !== "super_admin") redirect("/merchant/dashboard");
  return user;
}

export async function requireMerchant() {
  const user = await requireAppUser();
  if (user.role !== "merchant" || !user.merchant_id) redirect("/login");
  return user as AppUser & { merchant_id: string };
}
