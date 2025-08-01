import { ObjectId } from "mongodb";

export interface Job {
  _id?: ObjectId;
  gigTitle: string;
  category: string;
  description: string;
  duration: string;
  stipend: string;
  location: string;
  skills: string[];
  requiredExperience: string;
  numberOfPositions: number;
  additionalRequirements?: string;
  applicationDeadline: string;
  datePosted: Date;
  status: "active" | "completed";
}

export interface Application {
  _id?: ObjectId;
  jobId: ObjectId;
  applicantEmail: string;
  applicantDetails: any;
  status: "pending" | "accepted" | "rejected";
  appliedAt: Date;
}
