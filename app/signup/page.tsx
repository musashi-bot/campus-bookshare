"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, ShieldCheck, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { isCollegeEmail, getCollegeNameFromEmail } from "@/lib/college-domains";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { CollegeBadge } from "@/components/auth/CollegeBadge";

export default function SignUpPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [college, setCollege] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const collegeVerified = isCollegeEmail(email);
  const detectedCollege = getCollegeNameFromEmail(email);

  const handleEmailChange = (val: string) => {
    setEmail(val);
    const detected = getCollegeNameFromEmail(val);
    if (detected && !college) {
      setCollege(detected);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Full name is required";
    if (!email.trim() || !email.includes("@")) errs.email = "Valid email is required";
    if (!phone.trim() || phone.trim().length < 10)
      errs.phone = "Valid 10-digit phone number is required";
    if (!college.trim()) errs.college = "College/University name is required";
    if (!password || password.length < 6)
      errs.password = "Password must be at least 6 characters";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      const isPlaceholder = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").includes("placeholder.supabase.co");

      if (isPlaceholder) {
        toast.info("Supabase is in preview mode with placeholder keys. Connect live keys in .env.local to persist auth.");
        router.push("/login");
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
            phone: phone.trim(),
            college: college.trim(),
            college_verified: collegeVerified,
            role: "student",
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data.user) {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          college: college.trim(),
          role: "student",
          college_verified: collegeVerified,
        });

        toast.success("Account created successfully!");

        if (data.session === null) {
          router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
        } else {
          router.push("/dashboard");
          router.refresh();
        }
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred during signup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-3 sm:p-6 py-6 sm:py-12 w-full">
      <Card className="max-w-md w-full p-5 sm:p-8 space-y-5 sm:space-y-6">
        {/* Header */}
        <div className="text-center space-y-1.5 sm:space-y-2">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-ink text-amber mx-auto flex items-center justify-center shadow-sm">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-ink">
            Join Novel Share
          </h1>
          <p className="text-xs sm:text-sm text-charcoal/70">
            Create an account to borrow and lend novels with readers on your campus.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Rahul Sharma"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            required
          />

          <div className="space-y-1.5">
            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. rahul@iitb.ac.in or rahul@college.edu"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              error={errors.email}
              required
            />
            {collegeVerified ? (
              <div className="p-2 sm:p-2.5 rounded-xl bg-teal/10 border border-teal/20 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-1 animate-in fade-in">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal shrink-0" />
                  <span className="text-[11px] sm:text-xs font-bold text-teal">
                    College Recognized!
                  </span>
                </div>
                <CollegeBadge collegeName={detectedCollege} />
              </div>
            ) : (
              <p className="text-[11px] text-charcoal/60 px-1">
                Tip: Use your college email (.edu, .ac.in, etc.) for instant verification.
              </p>
            )}
          </div>

          <Input
            label="College / University"
            placeholder="e.g. IIT Bombay, Delhi University"
            value={college}
            onChange={(e) => setCollege(e.target.value)}
            error={errors.college}
            required
          />

          <Input
            label="Phone Number"
            type="tel"
            placeholder="e.g. 9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={errors.phone}
            helperText="Shared with lender/borrower only after rental acceptance."
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            required
          />

          <Button
            type="submit"
            variant="accent"
            size="lg"
            className="w-full mt-2 min-h-[48px] font-bold"
            isLoading={loading}
          >
            Create Account <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-2 border-t border-paper-border text-xs text-charcoal/70">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-ink hover:underline">
            Log in here
          </Link>
        </div>
      </Card>
    </div>
  );
}
