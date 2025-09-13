import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { createNotification } from "@/lib/createNotification";

// Get applications for jobs
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const jobIds = searchParams.get('jobIds')?.split(',').filter(Boolean) || [];
  
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

    // Build the query
    const query: any = { "applications": { $exists: true, $ne: [] } };
    
    // If jobIds are provided, filter by them
    if (jobIds.length > 0) {
      query._id = { $in: jobIds.map((id: string) => new ObjectId(id)) };
    }

    // Get all gigs that have applications
    const gigsWithApplications = await db
      .collection("gigs")
      .find(query)
      .toArray();
      
    // Group applications by job ID
    const applicationsByJob: Record<string, any[]> = {};
    
    for (const gig of gigsWithApplications) {
      applicationsByJob[gig._id.toString()] = gig.applications || [];
    }

    return new Response(
      JSON.stringify({
        applications: applicationsByJob,
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

    // Enforce approval and profile completeness before allowing application submission
    if (!currentUser.approved) {
      return new Response(
        JSON.stringify({
          error: "User is not approved to apply for gigs",
          code: "USER_NOT_APPROVED",
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
    if (!currentUser.profileFilled) {
      return new Response(
        JSON.stringify({
          error: "Please complete your profile to apply for gigs",
          code: "PROFILE_INCOMPLETE",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
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

    // Check if there's an existing record (applied or bookmarked)
    const existingApplication = gig.applications?.find(
      (app: any) => app.userId === currentUser._id.toString()
    );
    const existingUserGig = currentUser.gigs?.find(
      (userGig: any) => userGig.gigId === gigId
    );

    const now = new Date();

    // If previously bookmarked, upgrade to applied instead of erroring out
    if (
      (existingApplication && existingApplication.status === "bookmarked") ||
      (existingUserGig && existingUserGig.status === "bookmarked")
    ) {
      // Use a transaction to promote bookmarked -> applied
      const dbSession = client.startSession();
      try {
        await dbSession.withTransaction(async () => {
          await db.collection("gigs").updateOne(
            {
              _id: new ObjectId(gigId),
              "applications.userId": currentUser._id.toString(),
            },
            {
              $set: {
                "applications.$.status": "applied",
                "applications.$.lastUpdated": now,
                "applications.$.timeApplied": now,
              },
            },
            { session: dbSession }
          );

          await db.collection("users").updateOne(
            { _id: currentUser._id, "gigs.gigId": gigId },
            {
              $set: {
                "gigs.$.status": "applied",
                "gigs.$.updatedAt": now,
                "gigs.$.appliedAt": now,
              },
            },
            { session: dbSession }
          );
        });
      } finally {
        await dbSession.endSession();
      }

      // Fire notification for applied
      try {
        const _gigTitle =
          (gig as any)?.companyName ?? (gig as any)?.name ?? "Gig";
        await createNotification({
          userId: currentUser.email,
          type: "GIG_STATUS",
          title: "Application applied",
          body: 'Your application for "' + _gigTitle + '" was submitted.',
          entityType: "gigApplication",
          entityId: gigId,
          metadata: { newStatus: "applied", promotedFrom: "bookmarked" },
        });
      } catch {}

      return new Response(
        JSON.stringify({ message: "Application submitted successfully" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // If an application exists in gig or user already with non-bookmarked status, block
    if (
      (existingApplication && existingApplication.status !== "bookmarked") ||
      (existingUserGig && existingUserGig.status !== "bookmarked")
    ) {
      return new Response(
        JSON.stringify({ error: "You have already applied to this gig" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

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
          } as any,
          { session: dbSession }
        );

        // Update the user's gigs array - initialize gigs array if it doesn't exist
        await db.collection("users").updateOne(
          { _id: currentUser._id },
          {
            $push: { gigs: userGig },
          } as any,
          { session: dbSession }
        );
      });
    } finally {
      await dbSession.endSession();
    }

    // Fire notification for applied
    try {
      const gigTitle = (gig as any)?.title ?? (gig as any)?.name ?? "Gig";
      await createNotification({
        userId: currentUser.email,
        type: "GIG_STATUS",
        title: "Application applied",
        body: 'Your application for "' + gigTitle + '" was submitted.',
        entityType: "gigApplication",
        entityId: gigId,
        metadata: { newStatus: "applied" },
      });
    } catch {}

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
    const gig = await db.collection("gigs").findOne({
      _id: new ObjectId(gigId),
      "applications.userId": currentUser._id.toString(),
    });

    if (!gig) {
      return new Response(
        JSON.stringify({
          error: "Gig not found or user has not applied to this gig",
        }),
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

    // Fire notification for status change
    try {
      const gigTitle = (gig as any)?.title ?? (gig as any)?.name ?? "Gig";
      const statusTitle = String(status).replace(/_/g, " ");
      await createNotification({
        userId: currentUser.email,
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
    } catch {}

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

  let reqBody;
  try {
    reqBody = await req.json();
    const { gigId, action, value } = reqBody;

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
    const validActions = ["bookmark", "boost", "submitWork", "withdraw"];
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

    const now = new Date();
    const fieldName = action === "bookmark" ? "bookmarked" : "boosted";
    const newValue = value !== undefined ? value : true; // Default to true if value not provided

    // Use a transaction to ensure both operations succeed or fail together
    const dbSession = client.startSession();

    try {
      await dbSession.withTransaction(async () => {
        if (!hasApplied && action === "bookmark" && newValue) {
          // Create a new application with status 'bookmarked'
          const application = {
            userId: currentUser._id.toString(),
            status: "bookmarked",
            timeApplied: now,
            lastUpdated: now,
            boosted: false,
            bookmarked: true,
          };
          const userGig = {
            gigId,
            status: "bookmarked",
            appliedAt: now,
            updatedAt: now,
            bookmarked: true,
            boosted: false,
          };
          await db
            .collection("gigs")
            .updateOne(
              { _id: new ObjectId(gigId) },
              { $push: { applications: application } } as any,
              { session: dbSession }
            );
          await db
            .collection("users")
            .updateOne(
              { _id: currentUser._id },
              { $push: { gigs: userGig } } as any,
              { session: dbSession }
            );
        } else if (action === "withdraw") {
          // Handle withdrawal request
          const { upiId, upiName } = reqBody;

          if (!upiId || !upiName) {
            throw new Error("UPI ID and UPI Name are required for withdrawal");
          }

          const withdrawalData = {
            upiId,
            upiName,
            status: "pending",
            requestedAt: now,
          };

          // Update user's gig with withdrawal request
          await db.collection("users").updateOne(
            {
              _id: currentUser._id,
              "gigs.gigId": gigId,
            },
            {
              $push: { "gigs.$.withdrawals": withdrawalData },
              $set: {
                "gigs.$.updatedAt": now,
                "gigs.$.status": "withdrawal_requested",
              },
            } as any,
            { session: dbSession }
          );

          // Update gig's application with withdrawal request
          await db.collection("gigs").updateOne(
            {
              _id: new ObjectId(gigId),
              "applications.userId": currentUser._id.toString(),
            },
            {
              $push: { "applications.$.withdrawals": withdrawalData },
              $set: {
                "applications.$.lastUpdated": now,
                "applications.$.status": "withdrawal_requested",
              },
            } as any,
            { session: dbSession }
          );
        } else if (action === "submitWork") {
          // Add a submission to both user's gigs and gig's applications
          const { submission } = reqBody;
          if (!submission) throw new Error("No submission provided");

          // Create submission object with required fields
          const submissionData = {
            ...submission,
            submittedAt: now,
            status: "submitted",
          };

          // Add to user's gigs array
          await db.collection("users").updateOne(
            {
              _id: currentUser._id,
              "gigs.gigId": gigId,
            },
            {
              $push: { "gigs.$.submissions": submissionData },
              $set: {
                "gigs.$.updatedAt": now,
                "gigs.$.status": "completed",
              },
            } as any,
            { session: dbSession }
          );

          // Add to gig's applications array for this user
          await db.collection("gigs").updateOne(
            {
              _id: new ObjectId(gigId),
              "applications.userId": currentUser._id.toString(),
            },
            {
              $push: { "applications.$.submissions": submissionData },
              $set: {
                "applications.$.lastUpdated": now,
                "applications.$.status": "completed",
              },
            } as any,
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
      if (
        error instanceof Error &&
        error.message === "Gig not found in user's applications"
      ) {
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
