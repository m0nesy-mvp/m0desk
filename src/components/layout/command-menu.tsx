"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  FolderKanban,
  Inbox,
  Library,
  Loader2,
  Search,
  SquareCheck,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useCommandMenu } from "./command-context";
import { navItems } from "./nav-items";
import { searchAllAction } from "@/lib/actions/search";
import { cn } from "@/lib/utils";
import type { SearchResults } from "@/lib/db/search";

const addActions = [
  { label: "New Task", icon: SquareCheck, href: "/tasks" },
  { label: "New Project", icon: FolderKanban, href: "/projects" },
  { label: "New Knowledge", icon: BookOpen, href: "/knowledge" },
  { label: "New Library Item", icon: Library, href: "/library" },
  { label: "Quick Capture", icon: Inbox, href: "/inbox" },
];

const emptyResults: SearchResults = {
  projects: [],
  tasks: [],
  knowledge: [],
  library: [],
  inbox: [],
};

export function CommandMenu() {
  const { open, mode, openCommand, closeCommand } = useCommandMenu();
  const router = useRouter();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      const key = e.key.toLowerCase();
      if (key === "k") {
        e.preventDefault();
        openCommand(e.shiftKey ? "add" : "search");
      } else if (key === "n") {
        e.preventDefault();
        router.push("/inbox");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openCommand, router]);

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? openCommand() : closeCommand())}>
      <DialogContent
        showCloseButton={false}
        className="top-[12%] translate-y-0 gap-0 overflow-hidden p-0 shadow-lg"
      >
        {open && <PaletteBody mode={mode} onClose={closeCommand} />}
      </DialogContent>
    </Dialog>
  );
}

function PaletteBody({
  mode,
  onClose,
}: {
  mode: "search" | "add";
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>(emptyResults);
  const [searched, setSearched] = useState(false);
  const [searching, startSearching] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear any pending debounce when the palette closes.
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const onQueryChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = value.trim();
    if (!q) {
      setResults(emptyResults);
      setSearched(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      startSearching(async () => {
        const res = await searchAllAction(q);
        setResults(res);
        setSearched(true);
      });
    }, 150);
  };

  const go = (href: string) => {
    onClose();
    router.push(href);
  };

  const searchingNow = searching || (query.trim() !== "" && !searched);
  const hasResults =
    results.projects.length > 0 ||
    results.tasks.length > 0 ||
    results.knowledge.length > 0 ||
    results.library.length > 0 ||
    results.inbox.length > 0;

  return (
    <Command className="rounded-lg border-0" shouldFilter={false}>
      <div className="relative flex items-center border-b">
        <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
        <CommandInput
          placeholder="Search M0Desk…"
          className="h-12 pl-9 pr-10 text-[14px]"
          value={query}
          onValueChange={onQueryChange}
          autoFocus
        />
        {searchingNow && (
          <Loader2 className="absolute right-3 size-3.5 animate-spin text-muted-foreground" />
        )}
      </div>
      <CommandList className="max-h-[360px]">
            {query.trim() === "" ? (
              <>
                <CommandGroup heading="Quick Add" className={cn(mode !== "add" && "hidden")}>
                  {addActions.map((a) => (
                    <CommandItem
                      key={a.label}
                      value={a.label}
                      onSelect={() => go(a.href)}
                      className="gap-2.5 text-[13px]"
                    >
                      <a.icon className="size-4 text-muted-foreground" />
                      {a.label}
                    </CommandItem>
                  ))}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Navigate">
                  {navItems.map((item) => (
                    <CommandItem
                      key={item.href}
                      value={item.title}
                      onSelect={() => go(item.href)}
                      className="gap-2.5 text-[13px]"
                    >
                      <item.icon className="size-4 text-muted-foreground" />
                      {item.title}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            ) : searched && !hasResults ? (
              <CommandEmpty className="py-8 text-sm text-muted-foreground">
                No results for “{query.trim()}”
              </CommandEmpty>
            ) : (
              <>
                {results.projects.length > 0 && (
                  <CommandGroup heading="Projects">
                    {results.projects.map((p) => (
                      <CommandItem
                        key={p.id}
                        value={p.title}
                        onSelect={() => go(`/projects/${p.id}`)}
                        className="gap-2.5 text-[13px]"
                      >
                        <FolderKanban className="size-4 text-muted-foreground" />
                        <span className="min-w-0 flex-1 truncate">{p.title}</span>
                        <span className="shrink-0 font-mono text-[10.5px] uppercase text-muted-foreground/60">
                          {p.status}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                {results.tasks.length > 0 && (
                  <CommandGroup heading="Tasks">
                    {results.tasks.map((t) => (
                      <CommandItem
                        key={t.id}
                        value={t.title}
                        onSelect={() => go("/tasks")}
                        className="gap-2.5 text-[13px]"
                      >
                        <SquareCheck className="size-4 text-muted-foreground" />
                        <span className="min-w-0 flex-1 truncate">{t.title}</span>
                        <span className="shrink-0 font-mono text-[10.5px] text-muted-foreground/60">
                          {t.priority}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                {results.knowledge.length > 0 && (
                  <CommandGroup heading="Knowledge">
                    {results.knowledge.map((k) => (
                      <CommandItem
                        key={k.id}
                        value={k.title}
                        onSelect={() => go(`/knowledge/${k.id}`)}
                        className="gap-2.5 text-[13px]"
                      >
                        <BookOpen className="size-4 text-muted-foreground" />
                        <span className="min-w-0 flex-1 truncate">{k.title}</span>
                        {k.category && (
                          <span className="shrink-0 text-[11px] text-muted-foreground/60">
                            {k.category}
                          </span>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                {results.library.length > 0 && (
                  <CommandGroup heading="Library">
                    {results.library.map((l) => (
                      <CommandItem
                        key={l.id}
                        value={l.title}
                        onSelect={() => go("/library")}
                        className="gap-2.5 text-[13px]"
                      >
                        <Library className="size-4 text-muted-foreground" />
                        <span className="min-w-0 flex-1 truncate">{l.title}</span>
                        <span className="shrink-0 text-[11px] text-muted-foreground/60">
                          {l.type}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                {results.inbox.length > 0 && (
                  <CommandGroup heading="Inbox">
                    {results.inbox.map((i) => (
                      <CommandItem
                        key={i.id}
                        value={i.content}
                        onSelect={() => go("/inbox")}
                        className="gap-2.5 text-[13px]"
                      >
                        <Inbox className="size-4 text-muted-foreground" />
                        <span className="min-w-0 flex-1 truncate">{i.content}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </>
            )}

            <CommandSeparator />
            <div className="flex items-center gap-4 px-3 py-2 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <kbd className="rounded border bg-muted px-1 font-mono text-[10px]">↑↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border bg-muted px-1 font-mono text-[10px]">↵</kbd>
                select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border bg-muted px-1 font-mono text-[10px]">⌘N</kbd>
                quick capture
              </span>
              <span className="ml-auto flex items-center gap-1">
                <ArrowRight className="size-3" />
                searches everything locally
              </span>
            </div>
          </CommandList>
        </Command>
  );
}
