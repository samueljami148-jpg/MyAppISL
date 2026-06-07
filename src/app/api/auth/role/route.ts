import { NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase";
import type { AppUser } from "@/types/database";

export async function POST(request: NextRequest) {
  const { accessToken } = await request.json();
  if (!accessToken) {
    return Response.json({ error: "Token manquant" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser(accessToken);

  if (authError || !user) {
    return Response.json({ error: "Session invalide" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single<AppUser>();

  if (profileError || !profile) {
    return Response.json({ error: "Profil introuvable" }, { status: 404 });
  }

  return Response.json({
    role: profile.role,
    merchantId: profile.merchant_id
  });
}
