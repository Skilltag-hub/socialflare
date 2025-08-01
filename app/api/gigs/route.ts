import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("waitlist");
    const gigsCollection = db.collection("gigs");

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
