"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  signInAction,
  signUpAction,
  type AuthState,
} from "@/lib/auth/actions";

const initialState: AuthState = { error: null, notice: null };

export function AuthForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [state, formAction, pending] = useActionState(
    mode === "signin" ? signInAction : signUpAction,
    initialState,
  );

  return (
    <div className="w-full max-w-sm">
      {/* key={mode} remounts the form when the action changes — avoids
          React's insertBefore DOM error with useActionState + dynamic action */}
      <form key={mode} action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-[13px]">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="h-9"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-[13px]">
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={
              mode === "signin" ? "current-password" : "new-password"
            }
            placeholder={mode === "signup" ? "At least 8 characters" : "••••••••"}
            className="h-9"
            required
          />
        </div>

        {state.error && (
          <p
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-[12px] text-destructive"
          >
            {state.error}
          </p>
        )}
        {state.notice && (
          <p
            role="status"
            className="rounded-md border border-brand/30 bg-brand/10 px-3 py-2 text-[12px] text-foreground"
          >
            {state.notice}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          {mode === "signin" ? "Sign in" : "Create account"}
        </Button>
      </form>

      <div className="mt-5 text-center text-[13px] text-muted-foreground">
        {mode === "signin" ? (
          <>
            New to M0Desk?{" "}
            <button
              type="button"
              onClick={() => setMode("signup")}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Create an account
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => setMode("signin")}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Sign in
            </button>
          </>
        )}
      </div>
    </div>
  );
}
