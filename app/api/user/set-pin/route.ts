import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }
  const { pin } = await req.json();
  if (!pin || pin.length < 4) {
    return new Response("Invalid PIN", { status: 400 });
  }
  const hashedPin = await bcrypt.hash(pin, 10);
  const client = await clientPromise;
  const db = client.db("waitlist");
  await db
    .collection("users")
    .updateOne({ email: session.user.email }, { $set: { pin: hashedPin } });
  return new Response("PIN set", { status: 200 });
}
