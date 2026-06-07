import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "neutral"
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        tone === "neutral" && "bg-muted text-muted-foreground",
        tone === "success" && "bg-emerald-50 text-emerald-700",
        tone === "warning" && "bg-yellow-100 text-yellow-900"
      )}
    >
      {children}
    </span>
  );
}
