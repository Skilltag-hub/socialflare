import { Schema, model, models } from "mongoose";

export type NotificationType = "ACCOUNT_STATUS" | "GIG_STATUS" | string;

export interface NotificationDoc {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  entityType?: string; // e.g., "gigApplication"
  entityId?: string;   // e.g., application _id
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

const NotificationSchema = new Schema(
  {
    userId: { type: String, index: true, required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    entityType: { type: String },
    entityId: { type: String },
    isRead: { type: Boolean, default: false, index: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

// Fast unread queries
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const Notification =
  (models as any).Notification || model("Notification", NotificationSchema);

export default Notification;
