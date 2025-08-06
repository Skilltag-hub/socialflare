import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import clientPromise from "@/lib/mongodb";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }
  const details = await req.json();
  console.log(details);
  const client = await clientPromise;
  const db = client.db("waitlist");
  console.log(session.user.email);
  console.log(db);
  
  // Prepare the update data
  const updateData = { ...details };
  
  // Remove referredBy from the main update if it exists
  const { referredBy, ...otherDetails } = updateData;
  
  // Start with the base update
  const update: any = { 
    $set: { ...otherDetails, setupComplete: true } 
  };
  
  // Only set referredBy if it's provided and not already set
  if (referredBy) {
    // Check if the user already has a referredBy field
    const existingUser = await db.collection("users").findOne({ email: session.user.email });
    if (!existingUser?.referredBy) {
      update.$set.referredBy = referredBy;
    }
  }n
  
  // Perform the update
  const result = await db
    .collection("users")
    .updateOne(
      { email: session.user.email },
      update,
      { upsert: false }
    );
  
  console.log(
    "Matched:",
    result.matchedCount,
    "Modified:",
    result.modifiedCount
  );
  return new Response("Details updated", { status: 200 });
}
