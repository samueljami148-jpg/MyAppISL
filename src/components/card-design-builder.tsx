"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WalletCardPreview } from "@/components/wallet-card-preview";
import type { Merchant } from "@/types/database";

type DesignState = {
  cardBackgroundUrl: string;
  cardLogoUrl: string;
  cardStripUrl: string;
  cardThumbnailUrl: string;
  cardTextColor: string;
  primaryColor: string;
  cardQrPosition: string;
};

export function CardDesignBuilder({ merchant }: { merchant: Merchant }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [design, setDesign] = useState<DesignState>({
    cardBackgroundUrl: merchant.card_background_url || merchant.card_image_url || "",
    cardLogoUrl: merchant.card_logo_url || merchant.logo_url || "",
    cardStripUrl: merchant.card_strip_url || "",
    cardThumbnailUrl: merchant.card_thumbnail_url || "",
    cardTextColor: merchant.card_text_color || "#111111",
    primaryColor: merchant.primary_color || "#FFD600",
    cardQrPosition: merchant.card_qr_position || "bottom_right"
  });

  const previewMerchant: Merchant = {
    ...merchant,
    card_background_url: design.cardBackgroundUrl,
    card_image_url: design.cardBackgroundUrl,
    card_logo_url: design.cardLogoUrl,
    logo_url: design.cardLogoUrl || merchant.logo_url,
    card_strip_url: design.cardStripUrl,
    card_thumbnail_url: design.cardThumbnailUrl,
    card_text_color: design.cardTextColor,
    primary_color: design.primaryColor,
    card_qr_position: design.cardQrPosition as Merchant["card_qr_position"]
  };

  async function readFile(name: keyof DesignState, file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setDesign((current) => ({ ...current, [name]: String(reader.result) }));
    reader.readAsDataURL(file);
  }

  async function save() {
    setLoading(true);
    setMessage("");
    const response = await fetch("/api/merchant/card-design", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(design)
    });
    const json = await response.json();
    setLoading(false);
    setMessage(response.ok ? "Design sauvegarde." : json.error || "Sauvegarde impossible");
    if (response.ok) router.refresh();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_420px]">
      <div className="grid gap-4">
        <UploadField label="Image recto / background de la carte" onChange={(file) => readFile("cardBackgroundUrl", file)} />
        <UploadField label="Logo Wallet" onChange={(file) => readFile("cardLogoUrl", file)} />
        <UploadField label="Strip image optionnelle" onChange={(file) => readFile("cardStripUrl", file)} />
        <UploadField label="Thumbnail image optionnelle" onChange={(file) => readFile("cardThumbnailUrl", file)} />
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-semibold">
            Couleur texte
            <Input type="color" value={design.cardTextColor} onChange={(event) => setDesign((current) => ({ ...current, cardTextColor: event.target.value }))} />
          </label>
          <label className="space-y-2 text-sm font-semibold">
            Couleur principale
            <Input type="color" value={design.primaryColor} onChange={(event) => setDesign((current) => ({ ...current, primaryColor: event.target.value }))} />
          </label>
        </div>
        <label className="space-y-2 text-sm font-semibold">
          Position QR code
          <select value={design.cardQrPosition} onChange={(event) => setDesign((current) => ({ ...current, cardQrPosition: event.target.value }))} className="h-11 w-full rounded-lg border bg-white px-3 text-sm">
            <option value="bottom_right">Bas droite</option>
            <option value="bottom_left">Bas gauche</option>
            <option value="center">Centre</option>
          </select>
        </label>
        <Button onClick={save} disabled={loading} size="lg">
          <Save size={18} />
          {loading ? "Sauvegarde..." : "Sauvegarder le design"}
        </Button>
        {message ? <p className="text-sm font-semibold text-muted-foreground">{message}</p> : null}
      </div>
      <div className="space-y-4">
        <p className="text-sm font-semibold uppercase text-muted-foreground">Previsualisation Wallet</p>
        <WalletCardPreview merchant={previewMerchant} customerName="Samuel" points={7} />
        <p className="text-sm text-muted-foreground">La plateforme place automatiquement le QR code, le nom du client, les points, l&apos;objectif et la recompense sur le design fourni.</p>
      </div>
    </div>
  );
}

function UploadField({ label, onChange }: { label: string; onChange: (file: File | null) => void }) {
  return (
    <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-white p-4 text-center text-sm font-semibold hover:bg-muted">
      <Upload size={20} />
      {label}
      <input className="hidden" type="file" accept="image/*" onChange={(event) => onChange(event.target.files?.[0] || null)} />
    </label>
  );
}
