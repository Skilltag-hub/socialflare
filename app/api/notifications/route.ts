import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import Notification from "@/models/Notification";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const onlyUnread = searchParams.get("unread") === "1";
  const after = searchParams.get("after");
  const cursor = searchParams.get("cursor");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);

  const session = (await getServerSession(authOptions as any)) as Session | null;
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.email as string; // use email as stable identifier in this app

  await dbConnect();

  const query: any = { userId };
  if (onlyUnread) query.isRead = false;
  if (after) query.createdAt = { $gt: new Date(after) };
  if (cursor) {
    query.createdAt = { ...(query.createdAt || {}), $lt: new Date(cursor) };
  }

  const items = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  const unreadCount = await Notification.countDocuments({ userId, isRead: false });

  const nextCursor =
    items.length > 0 ? new Date(items[items.length - 1].createdAt as any).toISOString() : null;

  return NextResponse.json({
    items,
    unreadCount,
    now: new Date().toISOString(),
    nextCursor,
  });
}
