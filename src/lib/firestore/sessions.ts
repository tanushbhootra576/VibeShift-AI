import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebase.config";
import { Session } from "@/types/session";

export const createSession = async (sessionData: Omit<Session, "id" | "endedAt" | "duration" | "productivityScore">): Promise<Session> => {
  const sessionsRef = collection(db, "sessions");
  const newSessionRef = doc(sessionsRef);
  
  const newSession: Session = {
    ...sessionData,
    id: newSessionRef.id,
    duration: 0,
  };

  await setDoc(newSessionRef, newSession);
  return newSession;
};

export const endSession = async (sessionId: string, productivityScore?: number) => {
  const sessionRef = doc(db, "sessions", sessionId);
  
  // To accurately calculate duration, we should retrieve the session first in a real app
  // For simplicity, we just set the end time. Real duration needs startedAt.
  
  await updateDoc(sessionRef, {
    endedAt: Timestamp.now(),
    ...(productivityScore !== undefined && { productivityScore }),
  });
};

export const getUserSessions = async (userId: string): Promise<Session[]> => {
  const sessionsRef = collection(db, "sessions");
  const q = query(
    sessionsRef,
    where("userId", "==", userId),
    orderBy("startedAt", "desc")
  );
  
  const snap = await getDocs(q);
  return snap.docs.map((doc) => doc.data() as Session);
};
