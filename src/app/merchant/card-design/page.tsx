import { AppShell } from "@/components/app-shell";
import { CardDesignBuilder } from "@/components/card-design-builder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireMerchant } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase";
import type { Merchant } from "@/types/database";

export default async function MerchantCardDesignPage() {
  const user = await requireMerchant();
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("merchants").select("*").eq("id", user.merchant_id).single();
  const merchant = data as Merchant;

  return (
    <AppShell>
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase text-muted-foreground">Wallet</p>
        <h1 className="text-3xl font-bold tracking-normal">Design carte Wallet</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Builder carte</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDesignBuilder merchant={merchant} />
        </CardContent>
      </Card>
    </AppShell>
  );
}
