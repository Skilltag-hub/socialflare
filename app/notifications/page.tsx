"use client";

import useSWRInfinite from "swr/infinite";
import { useCallback, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";

const fetcher = (url: string) => fetch(url).then((r) => r.json());
const PAGE_SIZE = 20;

export default function NotificationsPage() {
  const [showUnread, setShowUnread] = useState(false);

  const getKey = useCallback(
    (pageIndex: number, previousPageData: any) => {
      if (previousPageData && previousPageData.items && previousPageData.items.length === 0)
        return null; // reached end
      const cursor = pageIndex === 0 ? "" : previousPageData?.nextCursor || "";
      const unreadParam = showUnread ? "&unread=1" : "";
      return `/api/notifications?limit=${PAGE_SIZE}${unreadParam}${
        cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""
      }`;
    },
    [showUnread]
  );

  const { data, size, setSize, mutate } = useSWRInfinite(getKey, fetcher, {
    refreshInterval: 20000, // poll every 20s
  });

  const flat = useMemo(() => (data ? data.flatMap((d: any) => d.items || []) : []), [data]);
  const nextCursor = data?.[data.length - 1]?.nextCursor;
  const unreadCount = data?.[0]?.unreadCount ?? 0;

  const markRead = async (ids?: string[]) => {
    const body = ids?.length ? { ids } : { allBefore: new Date().toISOString() };
    await fetch("/api/notifications/mark-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    await mutate(); // refresh pages
  };

  return (
    <>
      {/* Mobile Layout */}
      <div className="min-h-screen flex flex-col lg:hidden bg-gradient-to-b from-purple-100 to-purple-200">
        <div className="w-full max-w-sm mx-auto overflow-hidden flex flex-col h-screen relative">
          <div className="fixed bottom-1 inset-x-0 z-50">
            <Navbar />
          </div>
          {/* Header */}
          <div className="flex items-center justify-between p-4 pt-8 sticky top-0 z-10 bg-transparent">
            <div>
              <p className="text-skill text-xl font-semibold">Notifications</p>
            </div>
          </div>
          {/* Content */}
          <div className="px-4 space-y-4 pb-[100px] flex-1 overflow-y-auto">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-gray-600">Unread: {unreadCount}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowUnread((v) => !v)}
                  className="rounded-lg border px-3 py-1.5 text-xs bg-white/70 hover:bg-white"
                >
                  {showUnread ? "Show All" : "Show Unread"}
                </button>
                <button
                  onClick={() => markRead()}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-700"
                >
                  Mark all read
                </button>
              </div>
            </div>

            <ul className="space-y-2">
              {flat.map((n: any) => (
                <li
                  key={n._id}
                  className={`rounded-xl border p-3 ${
                    n.isRead
                      ? "border-transparent bg-white/70"
                      : "border-blue-200 bg-blue-50/60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium">{n.title}</div>
                      <div className="text-xs text-gray-600">{n.body}</div>
                      {n.entityType && n.entityId && (
                        <a
                          href={linkForEntity(n.entityType, n.entityId)}
                          className="mt-1 inline-block text-xs text-blue-600 hover:underline"
                        >
                          View details
                        </a>
                      )}
                    </div>
                    {!n.isRead && (
                      <button
                        onClick={() => markRead([n._id])}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                  <div className="mt-1 text-[11px] text-gray-500">
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </li>
              ))}

              {flat.length === 0 && (
                <li className="rounded-lg border border-dashed p-6 text-center text-sm text-gray-500 bg-white/70">
                  No notifications
                </li>
              )}
            </ul>

            <div className="mt-2 flex justify-center">
              {nextCursor ? (
                <button
                  onClick={() => setSize(size + 1)}
                  className="rounded-lg border px-4 py-2 text-sm bg-white/70 hover:bg-white"
                >
                  Load more
                </button>
              ) : (
                flat.length > 0 && (
                  <div className="text-xs text-gray-500">No more</div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen bg-black">
        <Navbar />
        <div className="flex-1 p-8 lg:ml-64">
          <h2 className="text-2xl font-semibold text-white mb-6">Notifications</h2>
          <div className="max-w-3xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-gray-300">Unread: {unreadCount}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowUnread((v) => !v)}
                  className="rounded-lg border px-3 py-1.5 text-xs text-white/90 border-white/20 hover:bg-white/5"
                >
                  {showUnread ? "Show All" : "Show Unread"}
                </button>
                <button
                  onClick={() => markRead()}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-700"
                >
                  Mark all read
                </button>
              </div>
            </div>

            <ul className="space-y-2">
              {flat.map((n: any) => (
                <li
                  key={n._id}
                  className={`rounded-xl border p-3 ${
                    n.isRead
                      ? "border-transparent bg-white/5"
                      : "border-blue-500/30 bg-blue-500/10"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-white">{n.title}</div>
                      <div className="text-xs text-gray-300">{n.body}</div>
                      {n.entityType && n.entityId && (
                        <a
                          href={linkForEntity(n.entityType, n.entityId)}
                          className="mt-1 inline-block text-xs text-blue-400 hover:underline"
                        >
                          View details
                        </a>
                      )}
                    </div>
                    {!n.isRead && (
                      <button
                        onClick={() => markRead([n._id])}
                        className="text-xs text-blue-400 hover:underline"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                  <div className="mt-1 text-[11px] text-gray-400">
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </li>
              ))}

              {flat.length === 0 && (
                <li className="rounded-lg border border-dashed border-white/20 p-6 text-center text-sm text-gray-400">
                  No notifications
                </li>
              )}
            </ul>

            <div className="mt-4 flex justify-center">
              {nextCursor ? (
                <button
                  onClick={() => setSize(size + 1)}
                  className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/5"
                >
                  Load more
                </button>
              ) : (
                flat.length > 0 && <div className="text-xs text-gray-500">No more</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Map entities to deep links in your app
function linkForEntity(entityType: string, entityId: string) {
  if (entityType === "gigApplication") return `/gigs/applications/${entityId}`;
  return "#";
}
