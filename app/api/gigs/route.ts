import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { Job } from "@/lib/jobTypes";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("test");
    const gigsCollection = db.collection("jobs");

    // Fetch all gigs from the collection
    const gigs = await gigsCollection.find({}).toArray();

    // Format dates for JSON serialization
    const formattedGigs = gigs.map((gig) => ({
      ...gig,
      datePosted: gig.datePosted.toISOString(),
      _id: gig._id.toString(),
    }));

    return NextResponse.json({ gigs: formattedGigs });
  } catch (error) {
    console.error("Error fetching gigs:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const client = await clientPromise;
    const db = client.db("test");
    const gigsCollection = db.collection("jobs");

    // Create new gig with required fields
    const newGig: Job = {
      ...body,
      datePosted: new Date(),
      status: "active",
      // Initialize empty applications array for consistency
      applications: []
    };

    const result = await gigsCollection.insertOne(newGig);
    
    const createdGig = {
      ...newGig,
      _id: result.insertedId.toString(),
      datePosted: newGig.datePosted.toISOString()
    };

    return NextResponse.json({ 
      success: true, 
      gigId: result.insertedId,
      gig: createdGig
    });
  } catch (error) {
    console.error("Error creating gig:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
