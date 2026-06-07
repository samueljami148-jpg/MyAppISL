import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { StatCard } from "@/components/stat-card";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { requireSuperAdmin } from "@/lib/auth";

export default async function AdminPage() {
  await requireSuperAdmin();
  const supabase = createSupabaseAdminClient();
  const [merchants, customers, cards, rewards] = await Promise.all([
    supabase.from("merchants").select("id", { count: "exact", head: true }),
    supabase.from("customers").select("id", { count: "exact", head: true }),
    supabase.from("loyalty_cards").select("id", { count: "exact", head: true }),
    supabase.from("transactions").select("id", { count: "exact", head: true }).eq("action", "redeem_reward")
  ]);

  return (
    <AppShell role="admin">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase text-muted-foreground">Super admin</p>
          <h1 className="text-3xl font-bold tracking-normal">Vue globale</h1>
        </div>
        <Link className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground" href="/admin/merchants/new">
          Nouveau commerce
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Commerces" value={merchants.count || 0} />
        <StatCard label="Clients" value={customers.count || 0} />
        <StatCard label="Cartes" value={cards.count || 0} />
        <StatCard label="Recompenses utilisees" value={rewards.count || 0} />
      </div>
    </AppShell>
  );
}
