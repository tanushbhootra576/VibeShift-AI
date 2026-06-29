import { Timestamp } from "firebase/firestore";

export interface UserPreferences {
  workStartHour: number;
  workEndHour: number;
  breakDurationMinutes: number;
  ddrThreshold: number;
  focusSessionDuration: number;
  timezone: string;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  plan: 'free' | 'pro';
  streak: number;
  streakLastUpdated: Timestamp;
  googleAccessToken?: string;
  googleRefreshToken?: string;
  calendarWatchChannelId?: string;
  calendarWatchResourceId?: string;
  calendarWatchExpiry?: Timestamp;
  preferences: UserPreferences;
  onboardingComplete: boolean;
  createdAt: Timestamp;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: Timestamp;
  estimatedMinutes: number;
  actualMinutes: number[];
  status: 'pending' | 'in_progress' | 'completed' | 'rescheduled' | 'escalated';
  priority: 1 | 2 | 3;
  calendarEventId: string | null;
  calendarBlockIds: string[];
  driftVelocity: number;
  driftHistory: { ts: Timestamp; ddv: number }[];
  stakeholderEmail: string | null;
  aiRescheduledAt: Timestamp | null;
  aiRescheduleReason: string | null;
  tags: string[];
  sourceType: 'manual' | 'voice' | 'vision' | 'calendar_import';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FocusSession {
  id: string;
  taskId: string;
  taskTitle: string;
  startedAt: Timestamp;
  endedAt: Timestamp | null;
  plannedDurationMinutes: number;
  actualDurationMinutes: number | null;
  sessionType: 'deep_work' | 'review' | 'planning' | 'communication';
  status: 'active' | 'paused' | 'completed' | 'abandoned';
  pauseLog: { pausedAt: Timestamp; resumedAt: Timestamp | null }[];
  completionPercent: number;
  cognitiveLoadAtEnd?: 'low' | 'medium' | 'high';
  focusScore: number;
  notes: string;
}

export interface AgentLog {
  id: string;
  timestamp: Timestamp;
  toolName: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  durationMs: number;
  triggeredBy: 'user' | 'ddv_worker' | 'inactivity' | 'scheduler';
  undoable: boolean;
  undoneAt: Timestamp | null;
}

export interface StreakDay {
  date: string;
  tasksCompleted: number;
  tasksTotal: number;
  allCompleted: boolean;
  focusMinutes: number;
}

export interface Goal {
  id: string;
  title: string;
  type: 'weekly' | 'monthly';
  progress: number;
  tasksCompleted: number;
  tasksTotal: number;
  automations: string[];
  status: 'active' | 'completed' | 'failed';
  createdAt: Timestamp;
}

export interface VisualizerPhysicsState {
  id: string;
  userId: string;
  taskId: string;
  lastDraggedX: number | null;
  lastDraggedY: number | null;
  userAppliedTension: number;
  isFrozenByUser: boolean;
  updatedAt: Timestamp;
}

export interface UserCognitiveTelemetry {
  id: string;
  userId: string;
  heartRateVariability: number | null;
  interactionFrictionScore: number;
  inferredState: 'ZEN_MODE' | 'SPRINT_MODE' | 'RECOVERY_MODE';
  capturedAt: Timestamp;
}

export interface UserSacredBoundary {
  id: string;
  userId: string;
  blockName: string;
  dayOfWeek: number;
  startTimeLocal: string;
  endTimeLocal: string;
  visualAlertColor: string;
  createdAt: Timestamp;
}

export interface TaskEscalation {
  id: string;
  taskId: string;
  userId: string;
  currentLevel: number; // 0: Normal, 1: Nudge, 2: Hijack, 3: VoiceCall
  lastEscalatedAt: Timestamp;
  isResolved: boolean;
  updatedAt: Timestamp;
}

export interface UserDistractionFilter {
  id: string;
  userId: string;
  domainName: string;
}
