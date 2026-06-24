"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<TimerMode>("Focus");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Automatically switch modes or play sound here
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    if (mode === "Focus") setTimeLeft(25 * 60);
    else if (mode === "Short Break") setTimeLeft(5 * 60);
    else setTimeLeft(15 * 60);
  };

  const handleSetMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsActive(false);
    if (newMode === "Focus") setTimeLeft(25 * 60);
    else if (newMode === "Short Break") setTimeLeft(5 * 60);
    else setTimeLeft(15 * 60);
  };

  const setCustomTime = (minutes: number) => {
    setIsActive(false);
    setTimeLeft(minutes * 60);
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
