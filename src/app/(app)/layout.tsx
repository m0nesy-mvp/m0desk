import { redirect } from "next/navigation";
import { isSupabase } from "@/lib/db/backend";
import { AppShell } from "@/components/layout/app-shell";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  let userEmail: string | null = null;

  if (isSupabase) {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");
    userEmail = user.email ?? null;
  }

  return <AppShell userEmail={userEmail}>{children}</AppShell>;
}
