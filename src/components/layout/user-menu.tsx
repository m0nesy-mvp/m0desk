"use client";

import Link from "next/link";
import { ChevronDown, LogOut, Settings } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutAction } from "@/lib/auth/actions";

export function UserMenu({
  collapsed = false,
  userEmail = null,
}: {
  collapsed?: boolean;
  userEmail?: string | null;
}) {
  const initial = userEmail ? userEmail[0].toUpperCase() : "M";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-sidebar-accent"
        >
          <Avatar className="size-6 shrink-0">
            <AvatarFallback className="bg-brand/20 text-[11px] font-semibold text-brand">
              {initial}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium">
                  {userEmail ?? "M0Desk"}
                </span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {userEmail ? "signed in" : "local mode"}
                </span>
              </span>
              <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" className="w-52">
        <DropdownMenuLabel className="text-[13px]">
          <span className="block truncate font-medium">
            {userEmail ?? "M0Desk"}
          </span>
          <span className="text-xs font-normal text-muted-foreground">
            {userEmail ? "Private workspace" : "Local mode · SQLite"}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings" className="gap-2 text-[13px]">
            <Settings className="size-3.5 text-muted-foreground" />
            Settings
          </Link>
        </DropdownMenuItem>
        {userEmail && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 text-[13px] text-destructive"
                >
                  <LogOut className="size-3.5 text-destructive" />
                  Sign out
                </button>
              </form>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
