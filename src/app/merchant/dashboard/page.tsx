import { AppShell } from "@/components/app-shell";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { requireMerchant } from "@/lib/auth";
import type { Merchant } from "@/types/database";

export default async function MerchantDashboardPage() {
  const user = await requireMerchant();
  const supabase = createSupabaseAdminClient();
  const merchantId = user.merchant_id;
  const [merchantResult, clients, points, rewardsAvailable, rewardsUsed] = await Promise.all([
    supabase.from("merchants").select("*").eq("id", merchantId).single(),
    supabase.from("customers").select("id", { count: "exact", head: true }).eq("merchant_id", merchantId),
    supabase.from("transactions").select("points").eq("merchant_id", merchantId).eq("action", "add_points"),
    supabase.from("loyalty_cards").select("id", { count: "exact", head: true }).eq("merchant_id", merchantId).eq("status", "reward_available"),
    supabase.from("transactions").select("id", { count: "exact", head: true }).eq("merchant_id", merchantId).eq("action", "redeem_reward")
  ]);
  const merchant = merchantResult.data as Merchant | null;
  const totalPoints = ((points.data || []) as Array<{ points: number }>).reduce((sum, row) => sum + Number(row.points || 0), 0);

  return (
    <AppShell>
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase text-muted-foreground">Espace commercant</p>
        <h1 className="text-3xl font-bold tracking-normal">{merchant?.name || "Dashboard"}</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Clients" value={clients.count || 0} />
        <StatCard label="Points distribues" value={totalPoints} />
        <StatCard label="Recompenses obtenues" value={rewardsAvailable.count || 0} />
        <StatCard label="Recompenses utilisees" value={rewardsUsed.count || 0} />
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Offre active</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{merchant?.reward_name}</p>
          <p className="mt-2 text-muted-foreground" dir="auto">{merchant?.description}</p>
          <p className="mt-4 text-sm font-semibold">{merchant?.reward_required_points} points requis</p>
        </CardContent>
      </Card>
    </AppShell>
  );
}
