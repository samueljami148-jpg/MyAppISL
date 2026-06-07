import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Merchant } from "@/types/database";

export function WalletCardPreview({
  merchant,
  customerName = "Samuel",
  points = 0,
  qrSrc,
  compact = false
}: {
  merchant: Merchant;
  customerName?: string;
  points?: number;
  qrSrc?: string;
  compact?: boolean;
}) {
  const textColor = merchant.card_text_color || "#111111";
  const background = merchant.card_background_url || merchant.card_image_url;

  return (
    <div
      className={cn("relative overflow-hidden rounded-xl border shadow-soft", compact ? "min-h-56" : "min-h-64")}
      style={{ backgroundColor: merchant.primary_color || "#FFD600", color: textColor }}
    >
      {background ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={background} alt="" className="absolute inset-0 size-full object-cover" />
      ) : null}
      <div className="absolute inset-0 bg-white/20" />
      <div className="relative z-10 flex min-h-56 flex-col justify-between p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase opacity-70">{merchant.name}</p>
            <h2 className="mt-2 text-2xl font-bold tracking-normal">{customerName}</h2>
          </div>
          {merchant.card_logo_url || merchant.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={merchant.card_logo_url || merchant.logo_url || ""} alt={merchant.name} className="size-14 rounded-lg object-cover" />
          ) : null}
        </div>
        {merchant.card_strip_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={merchant.card_strip_url} alt="" className="my-3 h-10 w-full rounded-lg object-cover" />
        ) : null}
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-4xl font-bold tracking-normal">{points} / {merchant.reward_required_points}</p>
            <p className="mt-1 font-semibold">{merchant.reward_name}</p>
          </div>
          {qrSrc ? (
            <Image src={qrSrc} alt="QR code carte" width={96} height={96} className="rounded-lg bg-white p-2" />
          ) : (
            <div className="flex size-24 items-center justify-center rounded-lg bg-white/90 text-xs font-bold text-black">QR</div>
          )}
        </div>
      </div>
    </div>
  );
}
