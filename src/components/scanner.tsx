"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Scanner() {
  const router = useRouter();
  const scannerRef = useRef<{ stop: () => Promise<void>; clear: () => void } | null>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      void scannerRef.current?.stop();
    };
  }, []);

  async function start() {
    setActive(true);
    setError("");
    const { Html5Qrcode } = await import("html5-qrcode");
    const qr = new Html5Qrcode("wallet-reader");
    scannerRef.current = qr;
    await qr.start(
      { facingMode: "environment" },
      { fps: 12, qrbox: { width: 260, height: 260 } },
      async (decodedText) => {
        await qr.stop();
        let cardId = decodedText;
        try {
          const parsed = JSON.parse(decodedText);
          cardId = parsed.cardId || decodedText;
        } catch {
          try {
            const url = new URL(decodedText);
            cardId = url.searchParams.get("cardId") || decodedText;
          } catch {
            cardId = decodedText;
          }
        }
        router.push(`/merchant/card/${encodeURIComponent(cardId)}`);
      },
      () => {}
    ).catch((scanError) => {
      setError(scanError instanceof Error ? scanError.message : "Camera indisponible");
      setActive(false);
    });
  }

  return (
    <div className="space-y-5">
      <div id="wallet-reader" className="overflow-hidden rounded-xl border bg-black [&_video]:rounded-xl" />
      {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
      <Button className="w-full" size="lg" onClick={start} disabled={active}>
        {active ? <ScanLine size={20} /> : <Camera size={20} />}
        {active ? "Scan en cours" : "Scanner une carte"}
      </Button>
    </div>
  );
}
