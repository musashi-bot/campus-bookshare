import React from "react";
import Link from "next/link";
import { Mail, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { email?: string };
}) {
  const email = searchParams.email || "your college email";

  return (
    <div className="flex-1 flex items-center justify-center p-4 py-12">
      <Card className="max-w-md w-full text-center space-y-6 p-8 shadow-soft-lg">
        <div className="w-16 h-16 rounded-full bg-amber/15 text-amber mx-auto flex items-center justify-center">
          <Mail className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="font-heading text-2xl font-bold text-ink">
            Verify Your Email
          </h1>
          <p className="text-sm text-charcoal/70 leading-relaxed">
            We sent a verification link to{" "}
            <span className="font-semibold text-ink">{email}</span>.
            Please click the link in your inbox to activate your Campus BookShare account.
          </p>
        </div>

        <div className="bg-paper-warm p-4 rounded-xl text-left space-y-2 border border-paper-border">
          <div className="flex items-start gap-2 text-xs text-charcoal/80">
            <CheckCircle2 className="w-4 h-4 text-teal shrink-0 mt-0.5" />
            <span>Verifies student identity and enables safe campus handovers</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-charcoal/80">
            <CheckCircle2 className="w-4 h-4 text-teal shrink-0 mt-0.5" />
            <span>Validates college domain to grant the "College Verified" badge</span>
          </div>
        </div>

        <div className="pt-2 flex flex-col gap-2.5">
          <Link href="/login">
            <Button variant="primary" className="w-full">
              Proceed to Login <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          <Link href="/signup">
            <Button variant="ghost" size="sm" className="w-full text-xs">
              Entered wrong email? Sign up again
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

