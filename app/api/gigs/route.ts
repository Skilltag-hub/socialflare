import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { Job } from "@/lib/jobTypes";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const client = await clientPromise;
    const db = client.db();
    const jobsCollection = db.collection("jobs");
    const job: Job = {
      ...body,
      datePosted: new Date(),
      status: "active",
    };
    const result = await jobsCollection.insertOne(job);
    return NextResponse.json({ success: true, jobId: result.insertedId });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const jobsCollection = db.collection("jobs");
    const jobs = await jobsCollection.find({ status: "active" }).toArray();
    return NextResponse.json(jobs);
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
