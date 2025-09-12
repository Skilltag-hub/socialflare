import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { createNotification } from "@/lib/createNotification";

export async function PATCH(
  request: Request,
  context: { params: { gigId: string } }
) {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const params = await context.params;
    const { gigId } = params;
    const { userId, status } = await request.json();

    // Validate inputs
    if (!gigId || !userId || !status) {
      return NextResponse.json(
        { error: "Gig ID, User ID, and status are required" },
        { status: 400 }
      );
    }

    // Validate the gig ID format
    if (!ObjectId.isValid(gigId)) {
      return NextResponse.json(
        { error: "Invalid gig ID format" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("waitlist");
    // Resolve applicant user email for notifications
    let targetUser: any = null;
    try {
      const userQuery: any = ObjectId.isValid(userId)
        ? { _id: new ObjectId(userId) }
        : {
            $or: [{ userId: userId }, { id: userId }, { email: userId }],
          };
      targetUser = await db.collection("users").findOne(userQuery);
    } catch {}

    // Read gig title for better notification body
    let gigDoc: any = null;
    try {
      gigDoc = await db.collection("gigs").findOne({ _id: new ObjectId(gigId) });
    } catch {}
    const now = new Date();

    // Start a session for transaction
    const dbSession = client.startSession();

    try {
      await dbSession.withTransaction(async () => {
        // Update the applicant's status in the gig's applications array
        const gigResult = await db.collection("gigs").updateOne(
          {
            _id: new ObjectId(gigId),
            "applications.userId": userId,
          },
          {
            $set: {
              "applications.$.status": status,
              "applications.$.lastUpdated": now,
            },
          },
          { session: dbSession }
        );

        if (gigResult.matchedCount === 0) {
          throw new Error("Gig or applicant not found");
        }

        // Also update the applicant's status in their user gigs array
        const userResult = await db.collection("users").updateOne(
          {
            $or: [
              { _id: new ObjectId(userId) },
              { userId: userId },
              { id: userId },
            ],
            "gigs.gigId": gigId,
          },
          {
            $set: {
              "gigs.$.status": status,
              "gigs.$.updatedAt": now,
            },
          },
          { session: dbSession }
        );

        if (userResult.matchedCount === 0) {
          throw new Error("User not found or user has not applied to this gig");
        }
      });
    } finally {
      await dbSession.endSession();
    }

    // Emit notification (best-effort)
    try {
      const email = targetUser?.email as string | undefined;
      if (email) {
        const gigTitle = (gigDoc && (gigDoc.title || gigDoc.companyName || gigDoc.name)) || "Gig";
        const statusTitle = String(status).replace(/_/g, " ");
        await createNotification({
          userId: email,
          type: "GIG_STATUS",
          title: "Application " + statusTitle,
          body:
            'Your application for "' +
            gigTitle +
            '" is now "' +
            String(status) +
            '".',
          entityType: "gigApplication",
          entityId: gigId,
          metadata: { newStatus: status },
        });
      }
    } catch {}

    return NextResponse.json({
      success: true,
      message: `Application status updated to ${status} successfully`,
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    if (
      errorMessage === "Gig or applicant not found" ||
      errorMessage === "User not found or user has not applied to this gig"
    ) {
      return NextResponse.json({ error: errorMessage }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to update application status" },
      { status: 500 }
    );
  }
}
