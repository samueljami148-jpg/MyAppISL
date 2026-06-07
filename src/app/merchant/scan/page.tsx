import { ScanLine } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scanner } from "@/components/scanner";
import { requireMerchant } from "@/lib/auth";

export default async function ScanPage() {
  await requireMerchant();
  return (
    <AppShell>
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-black text-primary">
            <ScanLine />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase text-muted-foreground">Caisse</p>
            <h1 className="text-2xl font-bold tracking-normal">Scanner une carte</h1>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>QR Code Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <Scanner />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
