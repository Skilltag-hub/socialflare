import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

// Define the Gig type for TypeScript
type Gig = {
  companyName: string;
  openings: number;
  description: string;
  payment: string;
  skills: string[];
  aboutCompany: string;
  datePosted: Date;
  status?: string;
};

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("waitlist");
    const gigsCollection = db.collection<Gig>("gigs");

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

export async function POST(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("waitlist");
    const gigsCollection = db.collection<Gig>("gigs");

    // Parse the request body
    const gigData = await request.json();
    
    // Validate required fields
    if (!gigData.companyName || !gigData.description || !gigData.payment) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create a new gig document
    const newGig: Gig = {
      companyName: gigData.companyName,
      openings: gigData.openings || 1,
      description: gigData.description,
      payment: gigData.payment,
      skills: Array.isArray(gigData.skills) ? gigData.skills : [],
      aboutCompany: gigData.aboutCompany || "",
      datePosted: new Date(gigData.datePosted || Date.now()),
      status: "active" // Default status
    };

    // Insert the new gig into the database
    const result = await gigsCollection.insertOne(newGig);

    // Return the created gig with its ID
    return NextResponse.json(
      { 
        ...newGig,
        _id: result.insertedId.toString(),
        datePosted: newGig.datePosted.toISOString()
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating gig:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
