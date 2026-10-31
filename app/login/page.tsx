"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, LogIn, Shield } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(urlError || "");

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const isPlaceholder = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").includes("placeholder.supabase.co");

      if (isPlaceholder) {
        toast.info("Supabase is in placeholder demo mode. Provide live credentials in .env.local to persist sessions.");
        router.push(redirectPath);
        return;
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        setError(authError.message);
        toast.error(authError.message);
        return;
      }

      if (data.user) {
        toast.success("Welcome back!");
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profile?.role === "admin" && redirectPath === "/dashboard") {
          router.push("/admin");
        } else {
          router.push(redirectPath);
        }
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Failed to log in");
      toast.error(err.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md w-full p-5 sm:p-8 space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="text-center space-y-1.5 sm:space-y-2">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-ink text-amber mx-auto flex items-center justify-center shadow-sm">
          <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-black text-ink">
          Welcome Back
        </h1>
        <p className="text-xs sm:text-sm text-charcoal/70">
          Sign in to access your rentals, listings, and campus novel swaps.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-terracotta/10 border border-terracotta/20 text-xs text-terracotta font-medium">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-3.5 sm:space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="student@college.ac.in"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="space-y-1">
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2 min-h-[48px] font-bold"
          isLoading={loading}
        >
          Sign In <LogIn className="w-4 h-4 ml-1.5" />
        </Button>
      </form>

      {/* Demo Credentials Quick-Fill */}
      <div className="p-3 bg-paper-warm rounded-xl border border-paper-border space-y-2 text-xs">
        <span className="font-bold text-charcoal flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-amber" />
          Quick Test Accounts:
        </span>
        <div className="flex flex-wrap gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => {
              setEmail("admin@campusshare.internal");
              setPassword("AdminPass123!");
            }}
            className="px-2.5 py-1.5 min-h-[36px] bg-white hover:bg-paper-border/40 border border-paper-border rounded-lg text-ink font-semibold transition active:scale-95"
          >
            Admin Demo
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail("rahul@iitb.ac.in");
              setPassword("StudentPass123!");
            }}
            className="px-2.5 py-1.5 min-h-[36px] bg-white hover:bg-paper-border/40 border border-paper-border rounded-lg text-ink font-semibold transition active:scale-95"
          >
            Rahul (IITB)
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail("ananya@du.ac.in");
              setPassword("StudentPass123!");
            }}
            className="px-2.5 py-1.5 min-h-[36px] bg-white hover:bg-paper-border/40 border border-paper-border rounded-lg text-ink font-semibold transition active:scale-95"
          >
            Ananya (DU)
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-2 border-t border-paper-border text-xs text-charcoal/70">
        Don't have an account yet?{" "}
        <Link href="/signup" className="font-bold text-ink hover:underline">
          Sign up for free
        </Link>
      </div>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-3 sm:p-6 py-6 sm:py-12 w-full">
      <Suspense
        fallback={
          <div className="max-w-md w-full p-6 space-y-4">
            <Skeleton className="h-12 w-12 rounded-2xl mx-auto" />
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
