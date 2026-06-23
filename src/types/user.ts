import { Timestamp } from "firebase/firestore";

export interface UserPreferences {
  workStartHour: number;
  workEndHour: number;
  timezone: string;
  focusSessionLength: number; // in minutes
}

export interface User {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  
  // To interact with Google APIs on behalf of the user
  accessToken?: string;
  refreshToken?: string;

  preferences: UserPreferences;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
