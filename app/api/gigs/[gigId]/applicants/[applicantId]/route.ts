import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"

export async function PATCH(
  request: Request,
  { params }: { params: { gigId: string; applicantId: string } }
) {
  try {
    const client = await clientPromise
    const db = client.db("waitlist")
    const { status } = await request.json()

    // Validate the IDs
    if (!ObjectId.isValid(params.gigId) || !ObjectId.isValid(params.applicantId)) {
      return NextResponse.json(
        { error: "Invalid ID format" },
        { status: 400 }
      )
    }

    // Update the applicant's status in the gig's applicants array
    const result = await db.collection("gigs").updateOne(
      { 
        _id: new ObjectId(params.gigId),
        "applicants._id": new ObjectId(params.applicantId)
      },
      { 
        $set: { "applicants.$.status": status } 
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Gig or applicant not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating applicant status:", error)
    return NextResponse.json(
      { error: "Failed to update applicant status" },
      { status: 500 }
    )
  }
}
