"use client";

import { createContext, useContext, useCallback, useState } from "react";

type CommandMode = "search" | "add";

type CommandContextValue = {
  open: boolean;
  mode: CommandMode;
  openCommand: (mode?: CommandMode) => void;
  closeCommand: () => void;
};

const CommandContext = createContext<CommandContextValue | null>(null);

export function CommandProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<CommandMode>("search");

  const openCommand = useCallback((next?: CommandMode) => {
    setMode(next ?? "search");
    setOpen(true);
  }, []);

  const closeCommand = useCallback(() => setOpen(false), []);

  return (
    <CommandContext.Provider
      value={{ open, mode, openCommand, closeCommand }}
    >
      {children}
    </CommandContext.Provider>
  );
}

export function useCommandMenu() {
  const ctx = useContext(CommandContext);
  if (!ctx) {
    throw new Error("useCommandMenu must be used within CommandProvider");
  }
  return ctx;
}
