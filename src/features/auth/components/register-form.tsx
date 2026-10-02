"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Check,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { registerSchema, type RegisterInput } from "../schemas/auth.schema";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";

const isGoogleEnabled =
  process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";

export function RegisterForm() {
  const router = useRouter();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;
  const passwordValue = form.watch("password");

  // Password strength rules
  const passwordRules = [
    { label: "At least 8 characters", valid: passwordValue.length >= 8 },
    { label: "One uppercase letter", valid: /[A-Z]/.test(passwordValue) },
    { label: "One lowercase letter", valid: /[a-z]/.test(passwordValue) },
    { label: "One number", valid: /\d/.test(passwordValue) },
  ];
  const passedRules = passwordRules.filter((r) => r.valid).length;

  async function onSubmit(values: RegisterInput) {
    const { error } = await authClient.signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
    });

    if (error) {
      toast.error(error.message ?? "Failed to create account");
      return;
    }

    toast.success("Account created! Welcome to Ledrix.");
    router.push(ROUTES.dashboard);
    router.refresh();
  }

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: ROUTES.dashboard,
    });

    if (error) {
      toast.error(error.message ?? "Google sign-in failed");
      setIsGoogleLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
          autoComplete="on"
          noValidate
        >
          {/* ─── Name ─────────────────────────────────── */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Full name
                </FormLabel>
                <FormControl>
                  <div className="relative group">
                    <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground transition-colors group-focus-within:text-foreground" />
                    <Input
                      placeholder="Rajesh Patel"
                      autoComplete="name"
                      className="h-11 pl-10"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ─── Email ────────────────────────────────── */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Email</FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground transition-colors group-focus-within:text-foreground" />
                    <Input
                      type="email"
                      placeholder="you@company.com"
                      autoComplete="email"
                      inputMode="email"
                      autoCapitalize="none"
                      className="h-11 pl-10"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ─── Password + Strength Meter ────────────── */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Password
                </FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground transition-colors group-focus-within:text-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      autoComplete="new-password"
                      className="h-11 pl-10 pr-10"
                      disabled={isSubmitting}
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                      tabIndex={-1}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />

                {/* Password strength indicator */}
                {passwordValue.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={cn(
                            "h-1 flex-1 rounded-full transition-colors",
                            i < passedRules
                              ? passedRules <= 2
                                ? "bg-red-500"
                                : passedRules === 3
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                              : "bg-muted"
                          )}
                        />
                      ))}
                    </div>
                    <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
                      {passwordRules.map((rule) => (
                        <li
                          key={rule.label}
                          className={cn(
                            "flex items-center gap-1.5 text-xs transition-colors",
                            rule.valid
                              ? "text-emerald-600 dark:text-emerald-500"
                              : "text-muted-foreground"
                          )}
                        >
                          {rule.valid ? (
                            <Check className="size-3 shrink-0" />
                          ) : (
                            <X className="size-3 shrink-0" />
                          )}
                          {rule.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </FormItem>
            )}
          />

          {/* ─── Confirm Password ─────────────────────── */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Confirm password
                </FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground transition-colors group-focus-within:text-foreground" />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter password"
                      autoComplete="new-password"
                      className="h-11 pl-10 pr-10"
                      disabled={isSubmitting}
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                      tabIndex={-1}
                      aria-label={
                        showConfirmPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ─── Submit ──────────────────────────────── */}
          <Button
            type="submit"
            className="group h-11 w-full font-medium"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                Create account
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </Button>
        </form>
      </Form>

      {/* ─── Google (conditional) ─────────────────────── */}
      {isGoogleEnabled && (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider">
              <span className="bg-background px-3 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-11 w-full font-medium"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isSubmitting}
          >
            {isGoogleLoading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <GoogleIcon className="mr-2 size-4" />
            )}
            Continue with Google
          </Button>
        </>
      )}

      {/* ─── Footer ───────────────────────────────────── */}
      <p className="pt-2 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href={ROUTES.login}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}