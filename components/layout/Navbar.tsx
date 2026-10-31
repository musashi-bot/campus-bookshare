"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, PlusCircle, LayoutDashboard, Shield, User, LogOut, Menu, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/lib/types";
import { CollegeBadge } from "@/components/auth/CollegeBadge";
import { Button } from "@/components/ui/Button";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function getProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (data && !error) {
            setProfile(data);
          } else {
            setProfile({
              id: user.id,
              name: user.user_metadata?.name || user.email?.split("@")[0] || "Student",
              email: user.email || "",
              phone: user.user_metadata?.phone || null,
              college: user.user_metadata?.college || null,
              role: (user.user_metadata?.role as any) || "student",
              college_verified: Boolean(user.user_metadata?.college_verified),
              created_at: new Date().toISOString(),
            });
          }
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error("Error loading user profile:", err);
      } finally {
        setLoading(false);
      }
    }

    getProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        getProfile();
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const navLinks = [
    { href: "/", label: "Browse Novels" },
    { href: "/books/new", label: "Lend a Novel", icon: PlusCircle, requiresAuth: true },
    { href: "/dashboard", label: "My Rentals", icon: LayoutDashboard, requiresAuth: true },
    ...(profile?.role === "admin"
      ? [{ href: "/admin", label: "Admin Panel", icon: Shield, badge: "Admin" }]
      : []),
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-paper-border bg-paper/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15 sm:h-20 py-2 sm:py-0">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber rounded-xl"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-ink flex items-center justify-center text-amber shadow-sm transition-transform group-hover:scale-105 shrink-0">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-base sm:text-xl font-bold tracking-tight text-ink leading-tight">
                Campus BookShare
              </span>
              <span className="text-[9px] sm:text-[11px] text-charcoal/60 font-semibold tracking-wider uppercase">
                Novel Club
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              if (link.requiresAuth && !profile) return null;
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? "bg-ink text-white font-semibold shadow-sm"
                      : "text-charcoal/80 hover:text-ink hover:bg-paper-warm"
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 opacity-80" />}
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] uppercase font-bold rounded bg-amber text-ink">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Area - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <NotificationBell />
            {profile ? (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 pr-3 rounded-full border border-paper-border hover:bg-paper-warm transition text-left focus-visible:ring-2 focus-visible:ring-amber"
                  >
                    <div className="w-8 h-8 rounded-full bg-ink text-amber flex items-center justify-center text-xs font-bold uppercase">
                      {profile.name ? profile.name.charAt(0) : "U"}
                    </div>
                    <div className="flex flex-col text-xs">
                      <span className="font-semibold text-ink line-clamp-1 max-w-[120px]">
                        {profile.name}
                      </span>
                      {profile.college_verified ? (
                        <span className="text-[10px] text-teal font-medium">
                          Verified
                        </span>
                      ) : (
                        <span className="text-[10px] text-charcoal/60 truncate max-w-[100px]">
                          {profile.college || "Student"}
                        </span>
                      )}
                    </div>
                  </button>

                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-soft-lg border border-paper-border py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                      onMouseLeave={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-paper-border/70 mb-1">
                        <p className="text-xs font-semibold text-ink truncate">{profile.name}</p>
                        <p className="text-[11px] text-charcoal/60 truncate">{profile.email}</p>
                        {profile.college_verified && (
                          <div className="mt-1.5">
                            <CollegeBadge collegeName={profile.college} />
                          </div>
                        )}
                      </div>

                      <Link
                        href="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal hover:bg-paper-warm transition"
                      >
                        <User className="w-4 h-4 text-charcoal/70" />
                        <span>Profile Settings</span>
                      </Link>

                      <Link
                        href="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal hover:bg-paper-warm transition"
                      >
                        <LayoutDashboard className="w-4 h-4 text-charcoal/70" />
                        <span>My Rentals</span>
                      </Link>

                      {profile.role === "admin" && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-ink font-medium hover:bg-paper-warm transition"
                        >
                          <Shield className="w-4 h-4 text-amber" />
                          <span>Admin Console</span>
                        </Link>
                      )}

                      <div className="my-1 border-t border-paper-border/70" />

                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-terracotta hover:bg-terracotta/10 transition text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Right Controls: Hamburger & Profile Shortcut */}
          <div className="flex md:hidden items-center gap-1.5">
            <NotificationBell />
            {profile && (
              <Link
                href="/profile"
                className="w-8 h-8 rounded-full bg-ink text-amber flex items-center justify-center text-xs font-bold uppercase shrink-0"
              >
                {profile.name ? profile.name.charAt(0) : "U"}
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-ink hover:bg-paper-warm transition active:scale-95"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-paper-border bg-paper-warm/98 px-4 pt-4 pb-6 space-y-4 shadow-lg animate-in slide-in-from-top-2 duration-150">
          {profile ? (
            <div className="p-3 bg-white rounded-2xl border border-paper-border flex items-center justify-between">
              <div>
                <p className="font-bold text-ink text-sm">{profile.name}</p>
                <p className="text-xs text-charcoal/60 truncate max-w-[200px]">{profile.email}</p>
              </div>
              {profile.college_verified && (
                <CollegeBadge collegeName={profile.college} />
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pb-1">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" size="md" className="w-full min-h-[44px]">
                  Log In
                </Button>
              </Link>
              <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="accent" size="md" className="w-full min-h-[44px]">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}

          <div className="space-y-1">
            {navLinks.map((link) => {
              if (link.requiresAuth && !profile) return null;
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition min-h-[48px] ${
                    active
                      ? "bg-ink text-white"
                      : "text-charcoal hover:bg-white border border-transparent hover:border-paper-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {Icon && <Icon className="w-4 h-4 opacity-80" />}
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold rounded bg-amber text-ink">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {profile && (
            <div className="pt-2 border-t border-paper-border space-y-1">
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-charcoal hover:bg-white rounded-xl min-h-[44px]"
              >
                <User className="w-4 h-4" />
                <span>Profile Settings</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-terracotta hover:bg-terracotta/10 rounded-xl min-h-[44px] text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
