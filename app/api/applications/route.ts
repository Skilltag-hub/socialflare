import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

// Get all applications for the current user
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const client = await clientPromise;
    const db = client.db("waitlist");

    // Get the current user
    const currentUser = await db
      .collection("users")
      .findOne({ email: session.user.email });

    if (!currentUser) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get applications for the user
    const applications = await db
      .collection("applications")
      .find({ userId: currentUser._id.toString() })
      .toArray();

    // For each application, get the gig details
    const applicationsWithGigs = await Promise.all(
      applications.map(async (application) => {
        const gig = await db
          .collection("gigs")
          .findOne({ _id: new ObjectId(application.gigId) });
        return {
          ...application,
          gig: gig
            ? {
                ...gig,
                _id: gig._id.toString(),
                datePosted: gig.datePosted.toISOString(),
              }
            : null,
        };
      })
    );

    return new Response(
      JSON.stringify({
        applications: applicationsWithGigs,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching applications:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch applications" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Create a new application
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { gigId } = await req.json();

    if (!gigId) {
      return new Response(JSON.stringify({ error: "Gig ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const client = await clientPromise;
    const db = client.db("waitlist");

    // Get the current user
    const currentUser = await db
      .collection("users")
      .findOne({ email: session.user.email });

    if (!currentUser) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if the gig exists
    const gig = await db
      .collection("gigs")
      .findOne({ _id: new ObjectId(gigId) });

    if (!gig) {
      return new Response(JSON.stringify({ error: "Gig not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if the user has already applied to this gig
    const existingApplication = await db.collection("applications").findOne({
      userId: currentUser._id.toString(),
      gigId,
    });

    if (existingApplication) {
      return new Response(
        JSON.stringify({ error: "You have already applied to this gig" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create the application
    const application = {
      userId: currentUser._id.toString(),
      gigId,
      status: "applied", // Initial status: applied, shortlisted, selected, completed
      appliedAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("applications").insertOne(application);

    return new Response(
      JSON.stringify({
        message: "Application submitted successfully",
        applicationId: result.insertedId.toString(),
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating application:", error);
    return new Response(
      JSON.stringify({ error: "Failed to submit application" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Update application status
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { applicationId, status } = await req.json();

    if (!applicationId || !status) {
      return new Response(
        JSON.stringify({ error: "Application ID and status are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate status
    const validStatuses = ["applied", "shortlisted", "selected", "completed"];
    if (!validStatuses.includes(status)) {
      return new Response(JSON.stringify({ error: "Invalid status" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const client = await clientPromise;
    const db = client.db("waitlist");

    // Get the current user
    const currentUser = await db
      .collection("users")
      .findOne({ email: session.user.email });

    if (!currentUser) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Update the application
    const result = await db.collection("applications").updateOne(
      { _id: new ObjectId(applicationId), userId: currentUser._id.toString() },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return new Response(
        JSON.stringify({ error: "Application not found or not owned by user" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        message: "Application status updated successfully",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error updating application:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update application" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
