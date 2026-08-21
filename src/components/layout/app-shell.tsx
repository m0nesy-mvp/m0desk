"use client";

import { useState } from "react";
import { CommandProvider, useCommandMenu } from "./command-context";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { CommandMenu } from "./command-menu";

export type AppUser = {
  email: string;
};

export function AppShell({
  children,
  userEmail = null,
}: {
  children: React.ReactNode;
  userEmail?: string | null;
}) {
  return (
    <CommandProvider>
      <Shell userEmail={userEmail}>{children}</Shell>
    </CommandProvider>
  );
}

function Shell({
  children,
  userEmail,
}: {
  children: React.ReactNode;
  userEmail: string | null;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { openCommand } = useCommandMenu();

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <Sidebar mobileOpen={mobileOpen} onMobileOpenChange={setMobileOpen} userEmail={userEmail} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          onMenuClick={() => setMobileOpen(true)}
          onSearchClick={() => openCommand("search")}
          onQuickAddClick={() => openCommand("add")}
        />
        <main className="flex-1 overflow-y-auto px-5 py-5 sm:px-7">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
      <CommandMenu />
    </div>
  );
}
