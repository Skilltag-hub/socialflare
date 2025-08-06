import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  
  if (!code) {
    return NextResponse.json(
      { error: "Referral code is required" },
      { status: 400 }
    );
  }

  try {
    const client = await clientPromise;
    const db = client.db("waitlist");
    
    // Find user with this referral code
    const user = await db.collection("users").findOne({ 
      referralCode: code,
      email: { $ne: null } // Ensure we don't match users without email
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid referral code" },
        { status: 404 }
      );
    }

    // Return minimal user info needed for the referral
    return NextResponse.json({
      userId: user._id,
      name: user.name,
      email: user.email,
      image: user.image
    });

  } catch (error) {
    console.error("Error validating referral code:", error);
    return NextResponse.json(
      { error: "Failed to validate referral code" },
      { status: 500 }
    );
  }
}
