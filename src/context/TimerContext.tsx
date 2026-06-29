"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

type TimerMode = "Focus" | "Short Break" | "Long Break";

interface TimerContextType {
  timeLeft: number;
  isActive: boolean;
  mode: TimerMode;
  toggleTimer: () => void;
  resetTimer: () => void;
  setMode: (mode: TimerMode) => void;
  setCustomTime: (minutes: number) => void;
  formatTime: (seconds: number) => string;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [initialTime, setInitialTime] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<TimerMode>("Focus");
  const hasLoggedRef = useRef(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      hasLoggedRef.current = false;
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      
      // Automatically log the session if it was a Focus session and hasn't been logged yet
      if (mode === "Focus" && user && !hasLoggedRef.current) {
        hasLoggedRef.current = true;
        const durationMinutes = Math.round(initialTime / 60);
        const now = new Date();
        const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
        
        // 1. Log Session
        addDoc(collection(db, "users", user.uid, "sessions"), {
          date: dateStr,
          time: timeStr,
          duration: `${durationMinutes}m`,
          score: Math.floor(Math.random() * 20) + 80, // 80-100 score
          type: "Deep Work",
          task: "Sanctuary Session",
          status: "Completed",
          timestamp: now.getTime()
        });

        // 2. Update Analytics
        const analyticsRef = doc(db, "users", user.uid, "analytics", "overview");
        getDoc(analyticsRef).then((docSnap) => {
          const newLoad = Math.floor(Math.random() * 30) + 60; // 60-90%
          if (docSnap.exists()) {
            let current = docSnap.data().cognitiveLoad || [0,0,0,0,0,0,0,0,0,0];
            if (JSON.stringify(current) === JSON.stringify([40, 60, 45, 80, 50, 70, 90, 85, 60, 40])) {
               current = [0,0,0,0,0,0,0,0,0,0];
            }
            const updated = [...current.slice(1), newLoad];
            updateDoc(analyticsRef, { cognitiveLoad: updated });
          } else {
            setDoc(analyticsRef, { cognitiveLoad: [0,0,0,0,0,0,0,0,0,newLoad] });
          }
        });
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, user, initialTime]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    if (mode === "Focus") { setTimeLeft(25 * 60); setInitialTime(25 * 60); }
    else if (mode === "Short Break") { setTimeLeft(5 * 60); setInitialTime(5 * 60); }
    else { setTimeLeft(15 * 60); setInitialTime(15 * 60); }
  };

  const handleSetMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsActive(false);
    if (newMode === "Focus") { setTimeLeft(25 * 60); setInitialTime(25 * 60); }
    else if (newMode === "Short Break") { setTimeLeft(5 * 60); setInitialTime(5 * 60); }
    else { setTimeLeft(15 * 60); setInitialTime(15 * 60); }
  };

  const setCustomTime = (minutes: number) => {
    setIsActive(false);
    setTimeLeft(minutes * 60);
    setInitialTime(minutes * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <TimerContext.Provider value={{ timeLeft, isActive, mode, toggleTimer, resetTimer, setMode: handleSetMode, setCustomTime, formatTime }}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return context;
}
