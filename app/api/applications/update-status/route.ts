import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  const { jobId, applicantId, status } = await req.json();
  const client = await connectToDatabase();
  const db = client.db();
  await db.collection("applications").updateOne(
    { jobId, applicantId },
    { $set: { status } }
  );
  return NextResponse.json({ success: true });
}
