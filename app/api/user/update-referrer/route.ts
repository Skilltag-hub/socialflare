import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { UserDocument, ReferredUser } from "@/types/user";

interface RequestBody {
  referrerId: string;
  referredUser: ReferredUser;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { referrerId, referredUser } = await req.json() as RequestBody;
    
    if (!referrerId || !referredUser?.email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("waitlist");

    // Update the referrer's document to add the new referral
    const result = await db.collection<UserDocument>("users").updateOne(
      { _id: new ObjectId(referrerId) },
      { 
        $push: { 
          referredPeople: {
            email: referredUser.email,
            name: referredUser.name,
            image: referredUser.image,
            joinedAt: referredUser.joinedAt,
            referredAt: new Date()
          } as ReferredUser
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Referrer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error updating referrer:", error);
    return NextResponse.json(
      { error: "Failed to update referrer" },
      { status: 500 }
    );
  }
}
