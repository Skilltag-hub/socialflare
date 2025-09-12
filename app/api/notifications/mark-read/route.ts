import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import Notification from "@/models/Notification";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: Request) {
  const session = (await getServerSession(authOptions as any)) as Session | null;
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.email as string;

  const { ids, allBefore } = await req.json();

  await dbConnect();

  if (Array.isArray(ids) && ids.length) {
    await Notification.updateMany({ userId, _id: { $in: ids } }, { $set: { isRead: true } });
  } else if (allBefore) {
    await Notification.updateMany(
      { userId, createdAt: { $lte: new Date(allBefore) } },
      { $set: { isRead: true } }
    );
  }

  const unreadCount = await Notification.countDocuments({ userId, isRead: false });

  return NextResponse.json({ ok: true, unreadCount });
}
