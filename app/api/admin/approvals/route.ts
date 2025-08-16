import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

function isAdmin(email?: string | null) {
  if (!email) return false;
  const allowlist = (process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (allowlist.length === 0) return false; // No admins configured => deny by default
  return allowlist.includes(email.toLowerCase());
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const client = await clientPromise;
    const db = client.db("waitlist");

    const companiesRaw = await db
      .collection("companies")
      .find({}, {
        projection: {
          _id: 1,
          name: 1,
          email: 1,
          approved: 1,
          isOnboarded: 1,
          createdAt: 1,
          logoUrl: 1,
        }
      })
      .toArray();

    const usersRaw = await db
      .collection("users")
      .find({}, {
        projection: {
          _id: 1,
          name: 1,
          email: 1,
          approved: 1,
          setupComplete: 1,
          createdAt: 1,
          image: 1,
        }
      })
      .toArray();

    const companies = companiesRaw.map((c: any) => ({
      _id: c._id.toString(),
      name: c.name || "",
      email: c.email,
      approved: !!c.approved,
      isOnboarded: !!c.isOnboarded,
      createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : undefined,
      logoUrl: c.logoUrl || "",
    }));

    const users = usersRaw.map((u: any) => ({
      _id: u._id.toString(),
      name: u.name || "",
      email: u.email,
      approved: !!u.approved,
      setupComplete: !!u.setupComplete,
      createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : undefined,
      image: u.image || "",
    }));

    return NextResponse.json({ companies, users });
  } catch (error) {
    console.error("Error fetching approvals:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const body = await request.json();
    const { entity, id, approved } = body || {};

    if (!entity || !id || typeof approved !== "boolean") {
      return NextResponse.json(
        { error: "entity, id and approved are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("waitlist");

    const collectionName = entity === "company" ? "companies" : entity === "user" ? "users" : null;
    if (!collectionName) {
      return NextResponse.json(
        { error: "Invalid entity. Must be 'company' or 'user'" },
        { status: 400 }
      );
    }

    const result = await db.collection(collectionName).updateOne(
      { _id: new ObjectId(id) },
      { $set: { approved, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: `${entity} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating approval:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
