import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const jobId = url.searchParams.get("jobId");
    const applicantId = url.searchParams.get("applicantId");
    const client = await clientPromise;
    const db = client.db();
    const tasksCollection = db.collection("tasks");
    const query = { jobId, applicantId };
    const tasks = await tasksCollection.find(query).toArray();
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
