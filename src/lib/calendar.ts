import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function fetchCalendarEvents(uid: string) {
  try {
    const docSnap = await getDoc(doc(db, "users", uid));
    if (!docSnap.exists()) return [];
    
    const token = docSnap.data().calendarAccessToken;
    if (!token) return [];

    const timeMin = new Date().toISOString();
    const timeMax = new Date();
    timeMax.setDate(timeMax.getDate() + 7); // Next 7 days
    
    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax.toISOString()}&singleEvents=true&orderBy=startTime`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      console.warn("Calendar API disabled or token invalid. Skipping live sync.");
      return [];
    }

    const data = await res.json();
    return data.items || [];
  } catch (error) {
    console.error("Calendar fetch error:", error);
    return [];
  }
}
