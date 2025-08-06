import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Get all referrals for the current user
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

    // Get people referred by the user
    const referredPeople = currentUser.referredPeople || [];

    // Get people who referred the user
    const referredById = currentUser.referredBy;
    let referredByUser = null;

    if (referredById) {
      const objectId =
        typeof referredById === "string"
          ? new ObjectId(referredById)
          : referredById;
      referredByUser = await db
        .collection("users")
        .findOne(
          { _id: objectId },
          { projection: { name: 1, email: 1, image: 1 } }
        );
    }

    console.log("Referrals API response:", { referredPeople, referredByUser });
    return new Response(
      JSON.stringify({
        referredPeople,
        referredByUser,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching referrals:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch referrals" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Add a new referral
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { referredEmail } = await req.json();

    if (!referredEmail) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
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

    // Check if the referred user exists
    const referredUser = await db
      .collection("users")
      .findOne({ email: referredEmail });

    if (!referredUser) {
      return new Response(
        JSON.stringify({ error: "Referred user not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if the user is trying to refer themselves
    if (referredEmail === session.user.email) {
      return new Response(JSON.stringify({ error: "Cannot refer yourself" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Update the current user's referredPeople array
    const referredPeople = currentUser.referredPeople || [];
    if (
      !referredPeople.some(
        (id) => id.toString() === referredUser._id.toString()
      )
    ) {
      await db
        .collection("users")
        .updateOne(
          { email: session.user.email },
          { $addToSet: { referredPeople: referredUser._id } }
        );
    }

    // Update the referred user's referredBy field
    await db
      .collection("users")
      .updateOne(
        { email: referredEmail },
        { $set: { referredBy: currentUser._id } }
      );

    return new Response(
      JSON.stringify({
        message: "Referral added successfully",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error adding referral:", error);
    return new Response(JSON.stringify({ error: "Failed to add referral" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
