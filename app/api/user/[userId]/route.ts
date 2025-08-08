import { NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    if (!userId) {
      return new Response("User ID is required", { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("waitlist");

    // Try to find user by ObjectId first, then by string ID if that fails
    let user;
    try {
      // First try to find by ObjectId
      user = await db
        .collection("users")
        .findOne({ _id: new ObjectId(userId) });
    } catch (error) {
      // If ObjectId conversion fails, try finding by other fields (not _id as string)
      user = await db.collection("users").findOne({
        $or: [
          { userId: userId },
          { id: userId },
          { email: userId }, // In case userId is actually an email
        ],
      });
    }

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    // Return only the necessary user data
    const userData = {
      _id: user._id.toString(),
      email: user.email,
      name: user.name || user.firstName || null,
      profileImage: user.profileImage || user.avatar || null,
    };

    return Response.json(userData);
  } catch (error) {
    console.error("Error fetching user:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
