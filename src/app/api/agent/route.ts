import { GoogleGenAI, Type, Schema } from "@google/genai";
import { NextResponse } from "next/server";
import { getFreeBusyBlocks, createCalendarEvent } from "@/lib/google/calendar";
import { updateTaskStatus } from "@/lib/firestore/tasks";

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_AI_API_KEY,
});

// Define tool schemas
const checkCalendarSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    durationMinutes: {
      type: Type.INTEGER,
      description: "Duration of the task in minutes to find an available focus block.",
    },
  },
  required: ["durationMinutes"],
};

const scheduleTaskSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    taskId: {
      type: Type.STRING,
      description: "The unique ID of the task to schedule.",
    },
    title: {
      type: Type.STRING,
      description: "The title of the task.",
    },
    startTime: {
      type: Type.STRING,
      description: "ISO string representing the start time.",
    },
    endTime: {
      type: Type.STRING,
      description: "ISO string representing the end time.",
    },
  },
  required: ["taskId", "title", "startTime", "endTime"],
};

export async function POST(req: Request) {
  try {
    const { prompt, userId } = await req.json();
    const authHeader = req.headers.get("Authorization");
    const accessToken = authHeader?.replace("Bearer ", "");

    if (!userId || !prompt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const systemInstruction = `
You are an elite productivity coach and AI scheduling assistant for VibeShift.
Your goal is to help users manage their tasks and schedule them effectively.
You can use tools to check the user's calendar for available focus blocks and schedule tasks directly into their Google Calendar.

Rules:
1. Analyze the user's request for task priority, urgency, and deadlines.
2. If the user wants to schedule a task, first check their calendar availability using the check_calendar_availability tool.
3. Once you find a suitable time block that fits the task duration, propose it to the user or schedule it using the schedule_task tool.
4. Always prioritize urgent tasks and encourage deep work.
5. Explain your scheduling decisions briefly and professionally.
`;

    // Start a chat session with tool definitions
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction,
        tools: [
          {
            functionDeclarations: [
              {
                name: "check_calendar_availability",
                description: "Find available focus blocks in the user's calendar.",
                parameters: checkCalendarSchema,
              },
              {
                name: "schedule_task",
                description: "Create a calendar event and update the task status.",
                parameters: scheduleTaskSchema,
              },
            ],
          },
        ],
      },
    });

    let finalResponse = "";

    // Send the user prompt
    const response = await chat.sendMessage({ message: prompt });
    let currentResponse = response;

    // Handle tool calling loop
    while (
      currentResponse.functionCalls &&
      currentResponse.functionCalls.length > 0
    ) {
      const toolCall = currentResponse.functionCalls[0];
      let toolResult: any = {};

      if (!accessToken) {
         toolResult = { error: "Google Calendar access token missing. Please sign in again." };
      } else {
        if (toolCall.name === "check_calendar_availability") {
          const args = toolCall.args as { durationMinutes: number };
          const now = new Date();
          const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Look ahead 7 days
          
          try {
            const freeSlots = await getFreeBusyBlocks(accessToken, now, endDate);
            toolResult = { freeSlots };
          } catch (e: any) {
            toolResult = { error: e.message };
          }
        } else if (toolCall.name === "schedule_task") {
          const args = toolCall.args as { taskId: string; title: string; startTime: string; endTime: string };
          
          try {
            const event = await createCalendarEvent(
              accessToken,
              args.title,
              new Date(args.startTime),
              new Date(args.endTime)
            );
            
            // Update Firestore task
            await updateTaskStatus(args.taskId, "scheduled");
            
            toolResult = { success: true, eventLink: event.htmlLink };
          } catch (e: any) {
            toolResult = { error: e.message };
          }
        }
      }

      // Send the tool response back to Gemini
      currentResponse = await chat.sendMessage({
        message: [{
          functionResponse: {
            name: toolCall.name,
            response: toolResult,
          }
        }]
      });
    }

    finalResponse = currentResponse.text || "I processed your request but had nothing to say.";

    // Return the response stream or text
    // Using simple Response for MVP, but can be converted to ReadableStream for streaming
    return new Response(finalResponse, {
      headers: { "Content-Type": "text/plain" }
    });

  } catch (error: any) {
    console.error("Agent Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
