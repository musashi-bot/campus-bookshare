"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  link?: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? "Yesterday" : `${days} days ago`;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20);

        if (data) {
          setNotifications(
            data.map((n: any) => ({
              id: n.id,
              title: n.title,
              message: n.message,
              time: timeAgo(n.created_at),
              read: n.read,
              link: n.link || "/dashboard",
            }))
          );
        }
      } catch {
        // Silently ignore — bell shows empty if DB unavailable
      }
    }
    loadNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("notifications")
          .update({ read: true })
          .eq("user_id", user.id)
          .eq("read", false);
      }
    } catch { /* ignore */ }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-charcoal/80 hover:text-ink hover:bg-paper-warm transition active:scale-95"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-amber text-ink font-black text-[10px] flex items-center justify-center shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-soft-lg border border-paper-border py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="px-4 py-2.5 border-b border-paper-border flex items-center justify-between">
            <span className="font-heading font-bold text-sm text-ink">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] font-bold text-amber hover:underline flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-paper-border/60">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <Link
                  key={notif.id}
                  href={notif.link || "/dashboard"}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 hover:bg-paper-warm transition ${
                    !notif.read ? "bg-amber/5" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-xs ${!notif.read ? "font-bold text-ink" : "font-semibold text-charcoal/80"}`}>
                      {notif.title}
                    </p>
                    <span className="text-[10px] text-charcoal/40 shrink-0">
                      {notif.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-charcoal/70 mt-0.5 leading-relaxed">
                    {notif.message}
                  </p>
                </Link>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-charcoal/50">
                No notifications right now
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
