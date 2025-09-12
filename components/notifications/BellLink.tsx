"use client";
import useSWR from "swr";
import Link from "next/link";
import { Bell } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function BellLink() {
  const { data } = useSWR("/api/notifications?unread=1&limit=1", fetcher, {
    refreshInterval: 20000,
  });
  const unread = data?.unreadCount ?? 0;

  return (
    <Link
      href="/notifications"
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border hover:bg-gray-50 dark:hover:bg-white/5"
      aria-label="Notifications"
    >
      <Bell className="h-5 w-5" />
      {unread > 0 && (
        <span className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-blue-600 px-1 text-xs text-white">
          {unread}
        </span>
      )}
    </Link>
  );
}
