"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import type { Merchant } from "@/types/database";

export function AdminMerchantSettingsForm({ merchant }: { merchant: Merchant }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const response = await fetch(`/api/merchants/${merchant.id}`, {
      method: "PATCH",
      body: new FormData(event.currentTarget)
    });
    const json = await response.json();
    setLoading(false);
    setMessage(response.ok ? "Commerce mis a jour." : json.error || "Mise a jour impossible");
    if (response.ok) router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <Input name="name" defaultValue={merchant.name} placeholder="Nom du commerce" required />
      <Input name="logo_url" defaultValue={merchant.logo_url || ""} placeholder="URL logo" />
      <Input name="card_image_url" defaultValue={merchant.card_image_url || ""} placeholder="URL photo de la carte Wallet" />
      <Input name="card_background_url" defaultValue={merchant.card_background_url || ""} placeholder="URL background carte Wallet" />
      <Input name="card_logo_url" defaultValue={merchant.card_logo_url || ""} placeholder="URL logo carte Wallet" />
      <Input name="card_strip_url" defaultValue={merchant.card_strip_url || ""} placeholder="URL strip image optionnelle" />
      <Input name="card_thumbnail_url" defaultValue={merchant.card_thumbnail_url || ""} placeholder="URL thumbnail optionnelle" />
      <Input name="card_text_color" type="color" defaultValue={merchant.card_text_color || "#111111"} aria-label="Couleur texte carte" />
      <Input name="primary_color" type="color" defaultValue={merchant.primary_color} aria-label="Couleur principale" />
      <Input name="reward_required_points" type="number" min="1" defaultValue={merchant.reward_required_points} placeholder="Points requis" />
      <Input name="reward_name" defaultValue={merchant.reward_name} placeholder="Nom de la recompense" />
      <Textarea name="description" dir="auto" defaultValue={merchant.description} placeholder="Description de l'offre" />
      <select name="reward_redemption_mode" defaultValue={merchant.reward_redemption_mode} className="h-11 rounded-lg border bg-white px-3 text-sm">
        <option value="reset">Remettre a 0 apres utilisation</option>
        <option value="deduct">Deduir les points utilises</option>
      </select>
      <select name="card_qr_position" defaultValue={merchant.card_qr_position || "bottom_right"} className="h-11 rounded-lg border bg-white px-3 text-sm">
        <option value="bottom_right">QR bas droite</option>
        <option value="bottom_left">QR bas gauche</option>
        <option value="center">QR centre</option>
      </select>
      <Button type="submit" disabled={loading}>
        <Save size={18} />
        {loading ? "Enregistrement..." : "Enregistrer"}
      </Button>
      {message ? <p className="text-sm font-semibold text-muted-foreground">{message}</p> : null}
    </form>
  );
}
