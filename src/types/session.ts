import { Timestamp } from "firebase/firestore";

export interface Session {
  id: string;
  userId: string;
  taskId?: string; // Optional linkage to a specific task

  startedAt: Timestamp;
  endedAt?: Timestamp;

  duration: number; // calculated duration in minutes

  productivityScore?: number; // 1-10 rating from the user
}
