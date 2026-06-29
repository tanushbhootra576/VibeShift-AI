"use client";
import React, { createContext, useContext, useState } from "react";

type SanctuaryMode = "zen" | "sprint" | "recovery";

interface SanctuaryContextValue {
  sanctuaryMode: SanctuaryMode;
  setSanctuaryMode: (m: SanctuaryMode) => void;
}

const SanctuaryContext = createContext<SanctuaryContextValue>({
  sanctuaryMode: "zen",
  setSanctuaryMode: () => {},
});

export function SanctuaryProvider({ children }: { children: React.ReactNode }) {
  const [sanctuaryMode, setSanctuaryMode] = useState<SanctuaryMode>("zen");
  return (
    <SanctuaryContext.Provider value={{ sanctuaryMode, setSanctuaryMode }}>
      {children}
    </SanctuaryContext.Provider>
  );
}

export function useSanctuary() {
  return useContext(SanctuaryContext);
}
