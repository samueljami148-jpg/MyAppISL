import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { requireSuperAdmin } from "@/lib/auth";
import type { Merchant } from "@/types/database";

export default async function MerchantsPage() {
  await requireSuperAdmin();
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("merchants").select("*").order("created_at", { ascending: false });
  const merchants = (data || []) as Merchant[];

  return (
    <AppShell role="admin">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-normal">Commerces</h1>
        <Link className="rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground" href="/admin/merchants/new">
          Ajouter
        </Link>
      </div>
      <div className="grid gap-3">
        {merchants.map((merchant) => (
          <Card key={merchant.id}>
            <CardContent className="flex items-center justify-between gap-4 p-5">
              <div>
                <p className="font-semibold">{merchant.name}</p>
                <p className="text-sm text-muted-foreground">{merchant.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge>{merchant.type}</Badge>
                <Link className="rounded-lg border bg-white px-3 py-2 text-sm font-semibold" href={`/admin/merchants/${merchant.id}`}>
                  Gerer
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
