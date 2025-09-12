import { dbConnect } from "@/lib/mongoose";
import Notification, { NotificationType } from "@/models/Notification";

export type CreateNotificationInput = {
  userId: string;
  type: NotificationType; // "ACCOUNT_STATUS" | "GIG_STATUS" | string
  title: string;
  body: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, any>;
};

export async function createNotification(input: CreateNotificationInput) {
  await dbConnect();
  const doc = await Notification.create(input);
  return { id: doc._id.toString() };
}
