import { Timestamp } from "firebase/firestore";

export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "pending" | "scheduled" | "active" | "completed";

export interface Task {
  id: string;
  userId: string;

  title: string;
  description?: string;

  duration: number; // in minutes

  priority: TaskPriority;
  status: TaskStatus;

  deadline?: Timestamp;
  calendarEventId?: string; // Links to Google Calendar Event

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
