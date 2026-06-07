import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MerchantForm } from "@/components/merchant-form";
import { requireSuperAdmin } from "@/lib/auth";

export default async function NewMerchantPage() {
  await requireSuperAdmin();
  return (
    <AppShell role="admin">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase text-muted-foreground">Creation</p>
        <h1 className="text-3xl font-bold tracking-normal">Nouveau commerce</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Parametres fidelite</CardTitle>
        </CardHeader>
        <CardContent>
          <MerchantForm />
        </CardContent>
      </Card>
    </AppShell>
  );
}
