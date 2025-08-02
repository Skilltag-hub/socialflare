import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"

export async function GET(
  request: Request,
  { params }: { params: { gigId: string } }
) {
  try {
    const client = await clientPromise
    const db = client.db("waitlist")
    
    // Validate the ID format
    if (!ObjectId.isValid(params.gigId)) {
      return NextResponse.json(
        { error: "Invalid gig ID format" },
        { status: 400 }
      )
    }

    const gig = await db.collection("gigs").findOne({
      _id: new ObjectId(params.gigId)
    })

    if (!gig) {
      return NextResponse.json(
        { error: "Gig not found" },
        { status: 404 }
      )
    }

    // Convert ObjectId to string and format the response
    const response = {
      ...gig,
      _id: gig._id.toString(),
      datePosted: gig.datePosted?.toISOString() || new Date().toISOString()
    }

    return NextResponse.json({ gig: response })
  } catch (error) {
    console.error("Error fetching gig:", error)
    return NextResponse.json(
      { error: "Failed to fetch gig" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { gigId: string } }
) {
  try {
    const client = await clientPromise
    const db = client.db("waitlist")
    const data = await request.json()

    // Validate the ID format
    if (!ObjectId.isValid(params.gigId)) {
      return NextResponse.json(
        { error: "Invalid gig ID format" },
        { status: 400 }
      )
    }

    const result = await db.collection("gigs").updateOne(
      { _id: new ObjectId(params.gigId) },
      { $set: data }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Gig not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating gig:", error)
    return NextResponse.json(
      { error: "Failed to update gig" },
      { status: 500 }
    )
  }
}
