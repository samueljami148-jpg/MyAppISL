"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      className="flex h-12 items-center justify-center gap-2 rounded-lg text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground md:mt-auto md:justify-start md:px-3"
      type="button"
    >
      <LogOut size={18} />
      <span className="hidden md:inline">Deconnexion</span>
    </button>
  );
}
