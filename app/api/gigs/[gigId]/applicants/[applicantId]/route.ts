import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export async function PATCH(
  request: Request,
  context: { params: { gigId: string; applicantId: string } }
) {
  const params = await context.params;
  const { gigId, applicantId } = params;
  try {
    const client = await clientPromise;
    const db = client.db("waitlist");
    const { status } = await request.json();

    // Validate the IDs
    if (!ObjectId.isValid(gigId) || !ObjectId.isValid(applicantId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    // Update the applicant's status in the gig's applications array
    const result = await db.collection("gigs").updateOne(
      {
        _id: new ObjectId(gigId),
        "applications.userId": applicantId,
      },
      {
        $set: { "applications.$.status": status },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Gig or applicant not found" },
        { status: 404 }
      );
    }

    // Also update the applicant's status in their user gigs array
    const userUpdateResult = await db.collection("users").updateOne(
      {
        $or: [
          { _id: new ObjectId(applicantId) },
          { userId: applicantId },
          { id: applicantId },
          { email: applicantId },
        ],
        "gigs.gigId": gigId,
      },
      {
        $set: { "gigs.$.status": status },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating applicant status:", error);
    return NextResponse.json(
      { error: "Failed to update applicant status" },
      { status: 500 }
    );
  }
}
