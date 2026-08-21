"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { PanelLeftClose, PanelLeftOpen, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { navItems, type NavItem } from "./nav-items";
import { Logo } from "./logo";
import { UserMenu } from "./user-menu";

const COLLAPSE_KEY = "m0desk:sidebar-collapsed";

const settingsItem: NavItem = {
  title: "Settings",
  href: "/settings",
  icon: Settings,
  section: "system",
};

function NavLink({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active =
    pathname === item.href ||
    (item.href !== "/today" && pathname.startsWith(`${item.href}/`));

  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-md px-2.5 py-[7px] text-[13px] font-medium transition-colors",
        collapsed && "justify-center px-0",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/65 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
      )}
    >
      <item.icon className="size-4 shrink-0" strokeWidth={active ? 2.2 : 1.9} />
      {!collapsed && <span className="truncate">{item.title}</span>}
      {!collapsed && active && (
        <span className="ml-auto size-1.5 shrink-0 rounded-full bg-brand" />
      )}
    </Link>
  );

  if (!collapsed) return link;

  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right" className="text-xs">
        {item.title}
      </TooltipContent>
    </Tooltip>
  );
}

export function Sidebar({
  mobileOpen,
  onMobileOpenChange,
  userEmail = null,
}: {
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
  userEmail?: string | null;
}) {
  const [collapsed, setCollapsed] = useState<boolean>(
    () =>
      typeof window !== "undefined" &&
      window.localStorage.getItem(COLLAPSE_KEY) === "1",
  );

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      localStorage.setItem(COLLAPSE_KEY, prev ? "0" : "1");
      return !prev;
    });
  };

  const mainItems = navItems.filter((i) => i.section === "main");
  const aiItems = navItems.filter((i) => i.section === "ai");

  const navContent = (
    <nav className="flex-1 space-y-6 overflow-y-auto px-2.5 py-4">
      <div className="space-y-0.5">
        {mainItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            collapsed={collapsed}
            onNavigate={() => onMobileOpenChange(false)}
          />
        ))}
      </div>
      {aiItems.length > 0 && (
        <div className="space-y-0.5">
          {!collapsed && (
            <p className="px-2.5 pb-1 text-[11px] font-medium uppercase tracking-wider text-sidebar-foreground/40">
              AI
            </p>
          )}
          {aiItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              collapsed={collapsed}
              onNavigate={() => onMobileOpenChange(false)}
            />
          ))}
        </div>
      )}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        suppressHydrationWarning
        className={cn(
          "relative hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 md:flex",
          collapsed ? "w-[62px]" : "w-60",
        )}
      >
        <div
          className={cn(
            "flex h-12 shrink-0 items-center border-b border-sidebar-border px-3",
            collapsed && "justify-center px-0",
          )}
        >
          <Link href="/today" title="M0Desk">
            <Logo compact={collapsed} />
          </Link>
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto size-7 text-muted-foreground hover:text-foreground"
              onClick={toggleCollapsed}
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="size-4" />
            </Button>
          )}
        </div>
        <TooltipProvider delayDuration={200}>
          {navContent}
          <div className="shrink-0 border-t border-sidebar-border p-2.5">
            <div className={cn("mb-1.5", collapsed && "flex justify-center")}>
              <NavLink item={settingsItem} collapsed={collapsed} />
            </div>
            <UserMenu collapsed={collapsed} userEmail={userEmail} />
          </div>
        </TooltipProvider>
        {collapsed && (
          <Button
            variant="outline"
            size="icon"
            className="absolute -right-3 top-3 z-10 size-6 rounded-full bg-background shadow-sm"
            onClick={toggleCollapsed}
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen className="size-3.5" />
          </Button>
        )}
      </aside>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent side="left" className="flex w-64 flex-col gap-0 p-0">
          <SheetTitle className="sr-only">M0Desk navigation</SheetTitle>
          <div className="flex h-12 shrink-0 items-center border-b border-sidebar-border px-4">
            <Logo />
          </div>
          {navContent}
          <div className="shrink-0 border-t border-sidebar-border p-2.5">
            <NavLink
              item={settingsItem}
              onNavigate={() => onMobileOpenChange(false)}
            />
          </div>
          <div className="shrink-0 border-t border-sidebar-border p-2.5">
            <UserMenu userEmail={userEmail} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
