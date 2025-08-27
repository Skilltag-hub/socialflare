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
    const {
      companyName,
      companyWebsite,
      contactName,
      businessEmail,
      logoUrl,
      gstCertificate,
      cinDocument,
    } = data;

    if (!companyName || !companyWebsite || !contactName || !businessEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("waitlist");

    const updateData: Record<string, any> = {
      companyName,
      companyWebsite,
      contactName,
      businessEmail,
      isOnboarded: true,
      updatedAt: new Date(),
      ...(logoUrl && { logoUrl }), // Only include logoUrl if provided
    };

    // Optionally persist document metadata if provided
    if (gstCertificate && (gstCertificate.url || typeof gstCertificate.uploaded === "boolean")) {
      updateData.gstCertificate = {
        uploaded: Boolean(gstCertificate.uploaded),
        url: gstCertificate.url || null,
      };
    }

    if (cinDocument && (cinDocument.url || typeof cinDocument.uploaded === "boolean")) {
      updateData.cinDocument = {
        uploaded: Boolean(cinDocument.uploaded),
        url: cinDocument.url || null,
      };
    }

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
