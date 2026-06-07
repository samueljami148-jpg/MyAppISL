"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export function MerchantForm() {
  const router = useRouter();
  const [result, setResult] = useState<{ publicUrl: string; temporaryPassword: string } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/merchants", {
      method: "POST",
      body: new FormData(event.currentTarget)
    });
    const json = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(json.error || "Creation impossible");
      return;
    }
    setResult(json);
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <form onSubmit={onSubmit} className="grid gap-4">
        <Input name="name" placeholder="Nom du commerce" required />
        <select name="type" className="h-11 rounded-lg border bg-white px-3 text-sm">
          <option value="restaurant">Restaurant</option>
          <option value="cafe">Cafe</option>
          <option value="coiffeur">Coiffeur</option>
          <option value="barber">Barber</option>
          <option value="gym">Salle de sport</option>
          <option value="other">Autre</option>
        </select>
        <Input name="email" type="email" placeholder="Email du compte commercant" required />
        <Input name="password" type="text" placeholder="Mot de passe temporaire optionnel" />
        <Input name="logo_url" placeholder="URL logo" />
        <Input name="primary_color" type="color" defaultValue="#FFD600" aria-label="Couleur principale" />
        <Input name="reward_required_points" type="number" min="1" defaultValue="10" placeholder="Points requis" />
        <Input name="reward_name" defaultValue="Menu offert" placeholder="Nom de la recompense" />
        <Textarea name="description" dir="auto" defaultValue="קנו 10 ארוחות וקבלו ארוחה במתנה" placeholder="Description de l'offre" />
        <select name="reward_redemption_mode" className="h-11 rounded-lg border bg-white px-3 text-sm">
          <option value="reset">Remettre a 0 apres utilisation</option>
          <option value="deduct">Deduir les points utilises</option>
        </select>
        {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
        <Button type="submit" size="lg" disabled={loading}>
          {loading ? "Creation..." : "Creer le commerce"}
        </Button>
      </form>
      <Card>
        <CardContent className="p-5">
          <p className="font-semibold">Sortie automatique</p>
          <p className="mt-2 text-sm text-muted-foreground">Merchant ID, compte commercant, lien public, QR d&apos;inscription et modeles Wallet.</p>
          {result ? (
            <div className="mt-5 space-y-3 text-sm">
              <p className="break-all font-mono">{result.publicUrl}</p>
              <p>Mot de passe: <span className="font-mono">{result.temporaryPassword}</span></p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
