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
    const currentUser: any = await db
      .collection("users")
      .findOne({ email: session.user.email });

    if (!currentUser) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get all gigs that have applications from this user
    const gigsWithUserApplications = await db
      .collection("gigs")
      .find({
        "applications.userId": currentUser._id.toString(),
      })
      .toArray();

    // Extract applications with gig details
    const applicationsWithGigs = gigsWithUserApplications.map((gig) => {
      const userApplication = gig.applications.find(
        (app: any) => app.userId === currentUser._id.toString()
      );
      
      return {
        ...userApplication,
        gigId: gig._id.toString(),
        gig: {
          ...gig,
          _id: gig._id.toString(),
          datePosted: gig.datePosted.toISOString(),
          // Remove applications array from gig details to avoid circular data
          applications: undefined,
        },
      };
    });

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
    const currentUser: any = await db
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

    // Check if the user has already applied to this gig by looking in the gig's applications array
    const existingApplication = gig.applications?.find(
      (app: any) => app.userId === currentUser._id.toString()
    );

    if (existingApplication) {
      return new Response(
        JSON.stringify({ error: "You have already applied to this gig" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if the gig is already in user's gigs array
    const gigAlreadyInUser = currentUser.gigs?.some(
      (userGig: any) => userGig.gigId === gigId
    );

    if (gigAlreadyInUser) {
      return new Response(
        JSON.stringify({ error: "You have already applied to this gig" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const now = new Date();

    // Create the application object to be added to the gig's applications array
    const application: any = {
      userId: currentUser._id.toString(),
      status: "applied", // Initial status: applied, shortlisted, selected, completed
      timeApplied: now,
      lastUpdated: now,
      boosted: false,
    };

    // Create the gig object for user's gigs array
    const userGig: any = {
      gigId,
      status: "applied", // applied, shortlisted, selected, completed
      appliedAt: now,
      updatedAt: now,
      bookmarked: false,
      boosted: false,
    };

    // Use a transaction to ensure both operations succeed or fail together
    const dbSession = client.startSession();

    try {
      await dbSession.withTransaction(async () => {
        // Add the application to the gig's applications array
        await db.collection("gigs").updateOne(
          { _id: new ObjectId(gigId) },
          {
            $push: { applications: application },
          },
          { session: dbSession }
        );

        // Update the user's gigs array - initialize gigs array if it doesn't exist
        await db.collection("users").updateOne(
          { _id: currentUser._id },
          {
            $push: { gigs: userGig as any },
          },
          { session: dbSession }
        );
      });
    } finally {
      await dbSession.endSession();
    }

    return new Response(
      JSON.stringify({
        message: "Application submitted successfully",
        gigId: gigId,
        userId: currentUser._id.toString(),
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
    const { gigId, status } = await req.json();

    if (!gigId || !status) {
      return new Response(
        JSON.stringify({ error: "Gig ID and status are required" }),
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
    const currentUser: any = await db
      .collection("users")
      .findOne({ email: session.user.email });

    if (!currentUser) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if the gig exists and user has applied
    const gig = await db
      .collection("gigs")
      .findOne({
        _id: new ObjectId(gigId),
        "applications.userId": currentUser._id.toString(),
      });

    if (!gig) {
      return new Response(
        JSON.stringify({ error: "Gig not found or user has not applied to this gig" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const now = new Date();

    // Use a transaction to ensure both operations succeed or fail together
    const dbSession = client.startSession();

    try {
      await dbSession.withTransaction(async () => {
        // Update the application status in the gig's applications array
        await db.collection("gigs").updateOne(
          {
            _id: new ObjectId(gigId),
            "applications.userId": currentUser._id.toString(),
          },
          {
            $set: {
              "applications.$.status": status,
              "applications.$.lastUpdated": now,
            },
          },
          { session: dbSession }
        );

        // Update the user's gigs array
        await db.collection("users").updateOne(
          {
            _id: currentUser._id,
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
      });
    } finally {
      await dbSession.endSession();
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

// Update gig bookmark/boost status
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { gigId, action, value } = await req.json();

    if (!gigId || !action) {
      return new Response(
        JSON.stringify({ error: "Gig ID and action are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate action
    const validActions = ["bookmark", "boost", "submitWork"];
    if (!validActions.includes(action)) {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const client = await clientPromise;
    const db = client.db("waitlist");

    // Get the current user
    const currentUser: any = await db
      .collection("users")
      .findOne({ email: session.user.email });

    if (!currentUser) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if the user has applied to this gig
    const hasApplied = currentUser.gigs?.some(
      (userGig: any) => userGig.gigId === gigId
    );

    if (!hasApplied) {
      return new Response(
        JSON.stringify({ error: "You have not applied to this gig" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const now = new Date();
    const fieldName = action === "bookmark" ? "bookmarked" : "boosted";
    const newValue = value !== undefined ? value : true; // Default to true if value not provided

    // Use a transaction to ensure both operations succeed or fail together
    const dbSession = client.startSession();

    try {
      await dbSession.withTransaction(async () => {
        if (action === "submitWork") {
          // Add a submission to both user's gigs and gig's applications
          const { submission } = reqBody;
          if (!submission) throw new Error("No submission provided");
          // Add to user's gigs array
          await db.collection("users").updateOne(
            {
              _id: currentUser._id,
              "gigs.gigId": gigId,
            },
            {
              $push: { "gigs.$.submissions": submission },
              $set: { "gigs.$.updatedAt": now },
            },
            { session: dbSession }
          );
          // Add to gig's applications array for this user
          await db.collection("gigs").updateOne(
            {
              _id: new ObjectId(gigId),
              "applications.userId": currentUser._id.toString(),
            },
            {
              $push: { "applications.$.submissions": submission },
              $set: { "applications.$.lastUpdated": now },
            },
            { session: dbSession }
          );
        } else {
          // Update the user's gigs array (bookmark/boost)
          const userResult = await db.collection("users").updateOne(
            {
              _id: currentUser._id,
              "gigs.gigId": gigId,
            },
            {
              $set: {
                [`gigs.$.${fieldName}`]: newValue,
                "gigs.$.updatedAt": now,
              },
            },
            { session: dbSession }
          );

          if (userResult.matchedCount === 0) {
            throw new Error("Gig not found in user's applications");
          }

          // If action is boost, also update the boosted status in the gig's applications array
          if (action === "boost") {
            await db.collection("gigs").updateOne(
              {
                _id: new ObjectId(gigId),
                "applications.userId": currentUser._id.toString(),
              },
              {
                $set: {
                  "applications.$.boosted": newValue,
                  "applications.$.lastUpdated": now,
                },
              },
              { session: dbSession }
            );
          }
        }
      });
    } catch (error) {
      await dbSession.endSession();
      if (error instanceof Error && error.message === "Gig not found in user's applications") {
        return new Response(
          JSON.stringify({ error: "Gig not found in user's applications" }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      throw error;
    } finally {
      await dbSession.endSession();
    }

    return new Response(
      JSON.stringify({
        message: `Gig ${action} status updated successfully`,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error updating gig status:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update gig status" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
