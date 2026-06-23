import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface Step {
  id: string;
  title: string;
  estimatedMinutes: number;
  completed: boolean;
}

export interface Doc {
  title: string;
  url: string;
  snippet: string;
}

export interface WorkspacePayload {
  motivation: string;
  runwayMinutes: number;
  executionPlan: Step[];
  documentation: Doc[];
  commands: string[];
  starterCode: string[];
}

interface AgentState {
  isAssembling: boolean;
  workspace: WorkspacePayload | null;
  isInterventionMode: boolean;
  interventionMicroStep: string | null;
  error: string | null;
  
  assembleWorkspace: (taskTitle: string, context: any) => Promise<void>;
  triggerIntervention: (context: string) => Promise<void>;
  resolveIntervention: () => void;
  closeWorkspace: () => void;
}

export const useAgentStore = create<AgentState>()(
  devtools(
    (set) => ({
      isAssembling: false,
      workspace: null,
      isInterventionMode: false,
      interventionMicroStep: null,
      error: null,

      assembleWorkspace: async (taskTitle, context) => {
        set({ isAssembling: true, error: null, workspace: null, isInterventionMode: false });
        try {
          const res = await fetch('/api/agent/workspace', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ taskTitle, context })
          });
          
          if (!res.ok) throw new Error('Failed to assemble workspace');
          
          const payload: WorkspacePayload = await res.json();
          set({ workspace: payload, isAssembling: false });
        } catch (error: any) {
          set({ error: error.message, isAssembling: false });
        }
      },

      triggerIntervention: async (context) => {
        set({ isInterventionMode: true, isAssembling: true });
        try {
          const res = await fetch('/api/agent/intervention', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ context })
          });
          
          if (!res.ok) throw new Error('Failed to generate intervention');
          
          const { microStep } = await res.json();
          set({ interventionMicroStep: microStep, isAssembling: false });
        } catch (error: any) {
          set({ error: error.message, isAssembling: false });
        }
      },

      resolveIntervention: () => {
        set({ isInterventionMode: false, interventionMicroStep: null });
      },

      closeWorkspace: () => {
        set({ workspace: null, isInterventionMode: false, interventionMicroStep: null, error: null });
      }
    })
  )
);
