import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions";
import clientPromise from "@/lib/mongodb";

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { companyName, companyWebsite, contactName, businessEmail, logoUrl } = data;

    if (!companyName || !companyWebsite || !contactName || !businessEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("waitlist");

    const updateData = {
      companyName,
      companyWebsite,
      contactName,
      businessEmail,
      isOnboarded: true,
      updatedAt: new Date(),
      ...(logoUrl && { logoUrl }), // Only include logoUrl if provided
    };

    const result = await db.collection("companies").updateOne(
      { email: session.user.email },
      { $set: updateData },
      { upsert: true }
    );

    if (!result.acknowledged) {
      throw new Error("Failed to update company details");
    }

    return NextResponse.json({
      success: true,
      message: "Company details saved successfully",
    });
  } catch (error) {
    console.error("Error saving company details:", error);
    return NextResponse.json(
      { error: "Failed to save company details" },
      { status: 500 }
    );
  }
}
