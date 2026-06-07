"use client";

import { useState } from "react";
import { Copy, Mail, MessageCircle, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InviteActions({ merchantName, inviteUrl }: { merchantName: string; inviteUrl: string }) {
  const [copied, setCopied] = useState(false);
  const text = `Bonjour, ajoutez votre carte de fidelite ${merchantName} ici : ${inviteUrl}`;

  async function copy() {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Button variant="secondary" onClick={copy}>
        <Copy size={18} />
        {copied ? "Lien copie" : "Copier le lien"}
      </Button>
      <a className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground" href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank">
        <MessageCircle size={18} />
        WhatsApp
      </a>
      <a className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border bg-white px-4 text-sm font-semibold" href={`sms:?&body=${encodeURIComponent(text)}`}>
        <Smartphone size={18} />
        SMS
      </a>
      <a className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border bg-white px-4 text-sm font-semibold" href={`mailto:?subject=${encodeURIComponent(`Carte fidelite ${merchantName}`)}&body=${encodeURIComponent(text)}`}>
        <Mail size={18} />
        Email
      </a>
    </div>
  );
}
