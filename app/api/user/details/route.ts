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
  
  // Add setupComplete field to indicate user has completed the setup process
  const result = await db
    .collection("users")
    .updateOne(
      { email: session.user.email }, 
      { $set: { ...details, setupComplete: true } }
    );
  
  console.log(
    "Matched:",
    result.matchedCount,
    "Modified:",
    result.modifiedCount
  );
  return new Response("Details updated", { status: 200 });
}
