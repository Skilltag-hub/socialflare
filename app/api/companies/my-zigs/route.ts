import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("test");
    
    // Get all gigs/jobs posted by the current company/user
    const gigs = await db.collection("jobs").find({
      // Add filter for company/user if needed
      // companyEmail: session.user.email
    }).toArray();

    // Get applications for each gig
    const gigsWithApplications = await Promise.all(
      gigs.map(async (gig) => {
        const applications = await db.collection("applications")
          .find({ jobId: gig._id.toString() })
          .toArray();
        
        return {
          ...gig,
          _id: gig._id.toString(),
          applications: applications.length,
          applicationsData: applications
        };
      })
    );

    return NextResponse.json(gigsWithApplications);
  } catch (error) {
    console.error("Error fetching my-zigs data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, gigId } = await req.json();
    
    if (action === "mark-completed" && gigId) {
      const client = await clientPromise;
      const db = client.db("test");
      
      // Update gig status to completed
      const result = await db.collection("jobs").updateOne(
        { _id: gigId },
        { $set: { status: "completed" } }
      );

      if (result.modifiedCount > 0) {
        return NextResponse.json({ success: true, message: "Gig marked as completed" });
      } else {
        return NextResponse.json({ error: "Gig not found" }, { status: 404 });
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating gig:", error);
    return NextResponse.json({ error: "Failed to update gig" }, { status: 500 });
  }
}
