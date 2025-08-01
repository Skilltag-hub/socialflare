import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

// Get user's gigs data
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

    // Get the current user with their gigs
    const currentUser = await db
      .collection("users")
      .findOne({ email: session.user.email });

    if (!currentUser) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        gigs: currentUser.gigs || [],
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching user gigs:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch user gigs" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
