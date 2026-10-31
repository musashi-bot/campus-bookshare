"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Phone, School, Mail, ShieldCheck, CheckCircle2, Save } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/lib/types";
import { isCollegeEmail, getCollegeNameFromEmail } from "@/lib/college-domains";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { CollegeBadge } from "@/components/auth/CollegeBadge";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [college, setCollege] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login?redirect=/profile");
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (data) {
          setProfile(data);
          setName(data.name || "");
          setPhone(data.phone || "");
          setCollege(data.college || "");
        } else {
          // Fallback from auth metadata
          const p: Profile = {
            id: user.id,
            email: user.email || "",
            name: user.user_metadata?.name || user.email?.split("@")[0] || "",
            phone: user.user_metadata?.phone || "",
            college: user.user_metadata?.college || "",
            role: user.user_metadata?.role || "student",
            college_verified: isCollegeEmail(user.email),
            created_at: new Date().toISOString(),
          };
          setProfile(p);
          setName(p.name);
          setPhone(p.phone || "");
          setCollege(p.college || "");
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router, supabase]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setSaving(true);
    try {
      const verified = isCollegeEmail(profile.email);

      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: profile.id,
          name: name.trim(),
          phone: phone.trim() || null,
          college: college.trim() || null,
          email: profile.email,
          role: profile.role,
          college_verified: verified,
        });

      if (profileError) {
        // Log error but proceed if updating auth user metadata succeeds
        console.warn("Profile table update issue:", profileError.message);
      }

      await supabase.auth.updateUser({
        data: {
          name: name.trim(),
          phone: phone.trim(),
          college: college.trim(),
          college_verified: verified,
        },
      });

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              name: name.trim(),
              phone: phone.trim() || null,
              college: college.trim() || null,
              college_verified: verified,
            }
          : null
      );

      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 w-full space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 w-full space-y-6">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="font-heading text-3xl font-bold text-ink">
          Student Profile
        </h1>
        <p className="text-sm text-charcoal/70">
          Manage your campus identity and contact details used during book handovers.
        </p>
      </div>

      {/* Profile Overview Card */}
      <Card className="space-y-6 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-paper-border gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-ink text-amber flex items-center justify-center font-heading text-2xl font-bold shadow-sm">
              {name ? name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-ink">{profile.name}</h2>
                <Badge variant={profile.role === "admin" ? "amber" : "neutral"} size="sm">
                  {profile.role.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-charcoal/60 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {profile.email}
              </p>
            </div>
          </div>

          <div>
            {profile.college_verified ? (
              <CollegeBadge collegeName={profile.college} />
            ) : (
              <Badge variant="neutral" size="sm">
                Personal Email
              </Badge>
            )}
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/80">
              Email Address
            </label>
            <input
              type="email"
              disabled
              value={profile.email}
              className="w-full px-4 py-2.5 rounded-xl border border-paper-border bg-paper-warm text-charcoal/60 text-sm cursor-not-allowed"
            />
            <p className="text-[11px] text-charcoal/60">
              Email is managed via your Supabase authentication account.
            </p>
          </div>

          <Input
            label="College / Institution"
            placeholder="e.g. IIT Bombay"
            value={college}
            onChange={(e) => setCollege(e.target.value)}
            helperText="Your campus peers see this when viewing book listings."
          />

          <Input
            label="Phone Number"
            type="tel"
            placeholder="e.g. 9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            helperText="Only revealed to the other student after a rental request is accepted."
          />

          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              variant="accent"
              size="md"
              isLoading={saving}
              className="w-full sm:w-auto"
            >
              <Save className="w-4 h-4 mr-1.5" /> Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

