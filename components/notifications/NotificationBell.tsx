"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bell, Check, Clock, Sparkles, BookOpen, CreditCard } from "lucide-react";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  link?: string;
}

const SAMPLE_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "",
    message: "No new notifications",
    time: "",
    read: false,
    link: "/dashboard",
  }
];

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(SAMPLE_NOTIFICATIONS);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
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
                  className={`block px-4 py-3 hover:bg-paper-warm transition ${!notif.read ? "bg-amber/5" : ""
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

