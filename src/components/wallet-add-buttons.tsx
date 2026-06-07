"use client";

import { useState } from "react";
import { Apple, BadgePlus } from "lucide-react";

export function WalletAddButtons({
  appleUrl,
  googleUrl,
  appleConfigured,
  googleConfigured
}: {
  appleUrl: string;
  googleUrl: string;
  appleConfigured: boolean;
  googleConfigured: boolean;
}) {
  const [message, setMessage] = useState("");

  async function addApple() {
    setMessage("");
    if (!appleConfigured) {
      setMessage("Apple Wallet n'est pas encore configure. La carte client et le QR code sont bien crees.");
      return;
    }
    window.location.href = appleUrl;
  }

  async function addGoogle() {
    setMessage("");
    if (!googleConfigured) {
      setMessage("Google Wallet n'est pas encore configure. La carte client et le QR code sont bien crees.");
      return;
    }
    window.location.href = googleUrl;
  }

  return (
    <div className="grid gap-3">
      <button onClick={addApple} className="flex h-14 items-center justify-center gap-2 rounded-lg bg-black px-5 font-semibold text-white" type="button">
        <Apple size={20} />
        Ajouter a Apple Wallet
      </button>
      <button onClick={addGoogle} className="flex h-14 items-center justify-center gap-2 rounded-lg border bg-white px-5 font-semibold" type="button">
        <BadgePlus size={20} />
        Ajouter a Google Wallet
      </button>
      {message ? <p className="rounded-lg bg-yellow-100 px-3 py-2 text-sm font-semibold text-yellow-900">{message}</p> : null}
    </div>
  );
}
