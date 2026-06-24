import { Tool, SchemaType } from '@google/generative-ai';

export const tools: Tool[] = [
  {
    functionDeclarations: [
      {
        name: 'createCalendarEvent',
        description: 'Create a Google Calendar event for a task deadline or focus session',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            taskId:     { type: SchemaType.STRING, description: 'Firestore task document ID' },
            title:      { type: SchemaType.STRING, description: 'Event title' },
            startISO:   { type: SchemaType.STRING, description: 'Start time in ISO 8601 format' },
            endISO:     { type: SchemaType.STRING, description: 'End time in ISO 8601 format' },
            type:       { type: SchemaType.STRING, enum: ['deadline', 'focus_block'], format: 'enum' },
            description:{ type: SchemaType.STRING },
            attendeeEmails: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: 'Email addresses of attendees/stakeholders'
            },
          },
          required: ['taskId', 'title', 'startISO', 'endISO', 'type'],
        },
      },
      {
        name: 'rescheduleTask',
        description: 'Autonomously reschedule a task to a new time slot when deadline drift is detected',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            taskId:       { type: SchemaType.STRING },
            newStartISO:  { type: SchemaType.STRING },
            newEndISO:    { type: SchemaType.STRING },
            reason:       { type: SchemaType.STRING, description: 'Human-readable reason for reschedule' },
          },
          required: ['taskId', 'newStartISO', 'newEndISO', 'reason'],
        },
      },
      {
        name: 'analyzeTaskLoad',
        description: 'Analyze current task load and calendar density to assess cognitive state',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            lookAheadHours: {
              type: SchemaType.NUMBER,
              description: 'How many hours ahead to analyze (default 24)',
            },
          },
          required: [],
        },
      },
      {
        name: 'suggestTaskBreakdown',
        description: 'Break a complex task into smaller actionable subtasks with time estimates',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            taskId:          { type: SchemaType.STRING },
            taskTitle:       { type: SchemaType.STRING },
            taskDescription: { type: SchemaType.STRING },
            deadlineISO:     { type: SchemaType.STRING },
            totalEstimatedMinutes: { type: SchemaType.NUMBER },
          },
          required: ['taskId', 'taskTitle', 'deadlineISO'],
        },
      },
      {
        name: 'fetchContextDoc',
        description: 'Fetch external documentation or web page content to ground AI reasoning in current facts',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            url:    { type: SchemaType.STRING },
            reason: { type: SchemaType.STRING, description: 'Why this doc is relevant to the current task' },
          },
          required: ['url'],
        },
      },
      {
        name: 'draftStakeholderEmail',
        description: 'Draft a professional email requesting a deadline extension',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            taskId:           { type: SchemaType.STRING },
            taskTitle:        { type: SchemaType.STRING },
            stakeholderEmail: { type: SchemaType.STRING },
            currentDeadline:  { type: SchemaType.STRING },
            proposedDeadline: { type: SchemaType.STRING },
            reason:           { type: SchemaType.STRING },
          },
          required: ['taskTitle', 'stakeholderEmail', 'currentDeadline', 'proposedDeadline'],
        },
      },
      {
        name: 'updateTaskStatus',
        description: 'Update a task status or completion percentage in Firestore',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            taskId:    { type: SchemaType.STRING },
            status:    { type: SchemaType.STRING, enum: ['pending', 'in_progress', 'completed', 'rescheduled'], format: 'enum' },
            completionPercent: { type: SchemaType.NUMBER, description: '0 to 100' },
          },
          required: ['taskId', 'status'],
        },
      },
    ],
  },
];
