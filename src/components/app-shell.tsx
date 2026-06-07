import Link from "next/link";
import { CreditCard, LayoutDashboard, ScanLine, Send, Shield } from "lucide-react";

const merchantLinks = [
  { href: "/merchant/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/merchant/scan", label: "Scanner", icon: ScanLine },
  { href: "/merchant/notifications", label: "Messages", icon: Send }
];

const adminLinks = [
  { href: "/admin", label: "Admin", icon: Shield },
  { href: "/admin/merchants", label: "Commerces", icon: CreditCard }
];

export function AppShell({
  children,
  role = "merchant"
}: {
  children: React.ReactNode;
  role?: "merchant" | "admin";
}) {
  const links = role === "admin" ? adminLinks : merchantLinks;
  return (
    <main className="min-h-screen bg-[#fbfaf7]">
      <aside className="fixed bottom-0 left-0 right-0 z-20 border-t bg-white/90 px-3 py-2 backdrop-blur md:bottom-auto md:right-auto md:top-0 md:h-screen md:w-64 md:border-r md:border-t-0 md:p-5">
        <Link href={role === "admin" ? "/admin" : "/merchant/dashboard"} className="mb-8 hidden items-center gap-3 md:flex">
          <div className="flex size-10 items-center justify-center rounded-xl bg-black text-primary">
            <CreditCard size={20} />
          </div>
          <div>
            <p className="font-bold">LoyalPass</p>
            <p className="text-xs text-muted-foreground">Wallet loyalty SaaS</p>
          </div>
        </Link>
        <nav className="grid grid-cols-3 gap-2 md:flex md:flex-col">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex h-12 items-center justify-center gap-2 rounded-lg text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground md:justify-start md:px-3"
            >
              <link.icon size={18} />
              <span className="hidden md:inline">{link.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
      <section className="mx-auto min-h-screen max-w-6xl px-4 pb-24 pt-6 md:ml-64 md:px-8 md:pb-10">{children}</section>
    </main>
  );
}
