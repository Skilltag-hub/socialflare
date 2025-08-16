import { ObjectId } from 'mongodb';

export interface ReferredUser {
  email: string | null | undefined;
  name: string | null | undefined;
  image: string | null | undefined;
  joinedAt: string;
  referredAt: Date;
}

export interface UserDocument {
  _id: ObjectId;
  email: string;
  name: string;
  image?: string;
  institution: string;
  state: string;
  graduationYear: string;
  idImageUrl: string;
  phone: string;
  description: string;
  status: string;
  skills: string[];
  gender: string;
  dateOfBirth: Date | null;
  referredPeople: ReferredUser[];
  referredBy: ObjectId | null;
  setupComplete: boolean;
  approved: boolean;
  referralCode: string;
  createdAt: Date;
  updatedAt: Date;
  emailVerified: Date;
}
