import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { Application } from "@/lib/jobTypes";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const client = await clientPromise;
    const db = client.db();
    const applicationsCollection = db.collection("applications");
    const application: Application = {
      ...body,
      status: "pending",
      appliedAt: new Date(),
    };
    const result = await applicationsCollection.insertOne(application);
    return NextResponse.json({ success: true, applicationId: result.insertedId });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const jobId = url.searchParams.get("jobId");
    const client = await clientPromise;
    const db = client.db();
    const applicationsCollection = db.collection("applications");
    const query = jobId ? { jobId } : {};
    const applications = await applicationsCollection.find(query).toArray();
    return NextResponse.json(applications);
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
