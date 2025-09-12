import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

function isAdmin(email?: string | null) {
  if (!email) return false;
  const allowlist = (process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (allowlist.length === 0) return false;
  return allowlist.includes(email.toLowerCase());
}

const COLLECTION = "site_content";
const KEY = "terms_and_conditions";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("waitlist");
    const doc = await db.collection(COLLECTION).findOne({ key: KEY });
    return NextResponse.json({ content: doc?.content || "" });
  } catch (error) {
    console.error("Error fetching terms:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const body = await request.json();
    const { content } = body || {};
    if (typeof content !== "string") {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("waitlist");
    await db.collection(COLLECTION).updateOne(
      { key: KEY },
      { $set: { key: KEY, content, updatedAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating terms:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
