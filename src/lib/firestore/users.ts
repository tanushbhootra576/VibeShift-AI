import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebase.config";
import { User } from "@/types/user";

export const createUser = async (user: Partial<User> & { uid: string, email: string }) => {
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    const newUser: User = {
      uid: user.uid,
      name: user.name || "User",
      email: user.email,
      photoURL: user.photoURL || "",
      preferences: {
        workStartHour: 9,
        workEndHour: 17,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        focusSessionLength: 60,
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    await setDoc(userRef, newUser);
    return newUser;
  }

  return snap.data() as User;
};

export const getUser = async (uid: string): Promise<User | null> => {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  
  if (snap.exists()) {
    return snap.data() as User;
  }
  return null;
};

export const updateUser = async (uid: string, updates: Partial<User>) => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
};
