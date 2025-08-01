import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }) {
  try {
    const { applicantId } = params;
    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({ _id: applicantId });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
