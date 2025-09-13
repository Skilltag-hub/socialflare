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
    const resolvedParams = params
    
    // Validate the ID format
    if (!ObjectId.isValid(resolvedParams.gigId)) {
      return NextResponse.json(
        { error: "Invalid gig ID format" },
        { status: 400 }
      )
    }

    // First get the gig
    const gig = await db.collection("gigs").findOne({
      _id: new ObjectId(resolvedParams.gigId)
    })

    if (!gig) {
      return NextResponse.json(
        { error: "Gig not found" },
        { status: 404 }
      )
    }

    // If the gig has a companyId, fetch the company data
    let company = null;
    if (gig.companyId) {
      company = await db.collection("companies").findOne({
        _id: new ObjectId(gig.companyId)
      });
    }

    // Convert ObjectId to string and format the response
    const response = {
      ...gig,
      _id: gig._id.toString(),
      datePosted: gig.datePosted 
        ? new Date(gig.datePosted).toISOString() 
        : new Date().toISOString(),
      // Handle special case where companyName is actually the job title
      title: gig.title || gig.gigTitle || gig.companyName || "Untitled Gig",
      gigTitle: gig.gigTitle || gig.title || gig.companyName || "Untitled Gig",
      // Clear the companyName since it's actually the job title
      companyName: company?.companyName || "",
      // Include company data if available
      company: company ? {
        _id: company._id.toString(),
        companyName: company.companyName,
        logoUrl: company.logoUrl
      } : null
    }
    
    console.log('Formatted gig response:', JSON.stringify(response, null, 2));

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
    const resolvedParams = params

    // Validate the ID format
    if (!ObjectId.isValid(resolvedParams.gigId)) {
      return NextResponse.json(
        { error: "Invalid gig ID format" },
        { status: 400 }
      )
    }

    const result = await db.collection("gigs").updateOne(
      { _id: new ObjectId(resolvedParams.gigId) },
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
