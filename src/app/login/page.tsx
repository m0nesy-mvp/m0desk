import { Suspense } from "react";
import { Logo } from "@/components/layout/logo";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata = {
  title: "Sign in",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4">
      <div className="mb-8 flex flex-col items-center">
        <Logo />
        <h1 className="mt-5 text-lg font-semibold tracking-tight">
          Sign in to M0Desk
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Your personal command center.
        </p>
        {error === "auto" && (
          <p
            role="alert"
            className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-[12px] text-destructive"
          >
            Automatic sign-in failed. Please sign in manually.
          </p>
        )}
        {error === "auth" && (
          <p
            role="alert"
            className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-[12px] text-destructive"
          >
            The confirmation link was invalid or expired. Please try again.
          </p>
        )}
      </div>
      <Suspense fallback={null}>
        <AuthForm />
      </Suspense>
    </div>
  );
}
