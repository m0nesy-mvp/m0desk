"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function TagInput({
  value,
  onChange,
  placeholder = "Type and press Enter",
  className,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}) {
  const [text, setText] = useState("");

  const add = () => {
    const tag = text.trim().replace(/^#/, "");
    if (tag && !value.includes(tag)) onChange([...value, tag]);
    setText("");
  };

  const remove = (tag: string) => onChange(value.filter((t) => t !== tag));

  return (
    <div
      className={cn(
        "flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border bg-background px-2 py-1.5 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20",
        className,
      )}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded border border-border bg-muted/50 px-1.5 py-0.5 text-[11.5px] text-foreground/90"
        >
          {tag}
          <button
            type="button"
            onClick={() => remove(tag)}
            className="text-muted-foreground hover:text-foreground"
            aria-label={`Remove tag ${tag}`}
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          } else if (e.key === "Backspace" && !text && value.length > 0) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={add}
        placeholder={value.length === 0 ? placeholder : ""}
        className="h-6 min-w-28 flex-1 border-0 bg-transparent p-0 text-[13px] shadow-none focus-visible:ring-0"
      />
    </div>
  );
}
