import { create } from 'zustand';

export interface TelemetryEvent {
  type: "HEALTHY" | "WARNING" | "HIGH_RISK" | "VELOCITY_CRITICAL";
  score: number;
  timestamp: number;
}

interface TelemetryState {
  vibeScore: number;
  driftVelocity: number;
  events: TelemetryEvent[];
  
  processDriftData: (data: { driftVelocity: number, classification: string }) => void;
  updateVibeScore: (score: number) => void;
}

export const useTelemetryStore = create<TelemetryState>((set) => ({
  vibeScore: 85,
  driftVelocity: 0.12,
  events: [],

  processDriftData: (data) => set((state) => {
    let eventType: TelemetryEvent["type"] = "HEALTHY";
    
    if (data.classification === "Critical") eventType = "VELOCITY_CRITICAL";
    else if (data.classification === "High Risk") eventType = "HIGH_RISK";
    else if (data.classification === "Warning") eventType = "WARNING";

    const newEvent: TelemetryEvent = {
      type: eventType,
      score: data.driftVelocity,
      timestamp: Date.now()
    };

    return {
      driftVelocity: data.driftVelocity,
      events: [newEvent, ...state.events].slice(0, 100) // Keep last 100 events
    };
  }),

  updateVibeScore: (score) => set({ vibeScore: score })
}));
