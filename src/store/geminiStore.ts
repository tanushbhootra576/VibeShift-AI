import { create } from 'zustand';
import { DDVResult } from '@/workers/ddv.worker';
import { useTaskStore } from './taskStore';

interface Message {
  role: 'user' | 'model' | 'system';
  content: string;
}

interface GeminiState {
  messages: Message[];
  isStreaming: boolean;
  addMessage: (msg: Message) => void;
  triggerGeminiReschedule: (criticalTask: DDVResult) => void;
  callGeminiAPI: (msgs: Message[]) => Promise<void>;
}

export const useGeminiStore = create<GeminiState>((set, get) => ({
  messages: [],
  isStreaming: false,
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),

  callGeminiAPI: async (msgs) => {
    set({ isStreaming: true });
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: msgs,
          userId: useTaskStore.getState().userId
        })
      });

      if (!response.body) throw new Error('No readable stream');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      let aiResponseText = '';
      set((state) => ({ messages: [...state.messages, { role: 'model', content: '' }] }));

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n\n').filter(Boolean);
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'text') {
              aiResponseText += data.content;
              set((state) => {
                const newMsgs = [...state.messages];
                newMsgs[newMsgs.length - 1] = { role: 'model', content: aiResponseText };
                return { messages: newMsgs };
              });
            } else if (data.type === 'done') {
              break;
            }
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      set({ isStreaming: false });
    }
  },

  triggerGeminiReschedule: async (criticalTask) => {
    const task = useTaskStore.getState().getTask(criticalTask.taskId);
    if (!task) return;

    const message = `
AUTONOMOUS TRIGGER: Deadline drift detected.
Task: "${task.title}"
DDV: ${criticalTask.ddv} (critical — task is falling behind mathematically)
Hours until deadline: ${criticalTask.hoursUntilDeadline}
Remaining work: ${criticalTask.remainingMinutes} minutes

Take immediate action to reschedule this task. Choose the best available slot.
Do not ask for confirmation.
    `.trim();

    const newMessages: Message[] = [...get().messages, { role: 'user', content: message }];
    set({ messages: newMessages });
    await get().callGeminiAPI(newMessages);
  }
}));
