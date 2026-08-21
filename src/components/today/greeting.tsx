"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";

export function Greeting() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const hour = now.getHours();
  const part =
    hour < 5
      ? "Good night"
      : hour < 12
        ? "Good morning"
        : hour < 18
          ? "Good afternoon"
          : "Good evening";

  return (
    <div className="mb-8" suppressHydrationWarning>
      <h1 className="text-2xl font-semibold tracking-tight">{part}</h1>
      <p className="mt-0.5 text-sm text-muted-foreground">
        {format(now, "EEEE, MMMM d")}
      </p>
    </div>
  );
}
