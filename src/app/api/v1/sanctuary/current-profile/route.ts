import { adminDb } from '@/lib/firebase-admin';
import { genAI } from '@/lib/gemini';

const STATE_ROUTER_PROMPT = `
System: You are a Cognitive State UI Routing Engine. Your job is to ingest user biometric telemetry, app engagement drop-offs, and scheduling realities to determine the absolute layout mode for the frontend workspace.

State Decision Logic:
1. If HRV is low (indicates stress) OR task cancellations > 3 within 2 hours: route directly to 'RECOVERY_MODE'.
2. If is_calendar_block_deep_work is true AND heart_rate is steady: route to 'SPRINT_MODE'.
3. Default baseline if user is actively organizing: route to 'ZEN_MODE'.

Output Your Response EXCLUSIVELY as a validated JSON object matching the schema below.

Output Schema:
{
  "recommended_mode": "ZEN_MODE | SPRINT_MODE | RECOVERY_MODE",
  "confidence_score": 0.94,
  "transition_animation_speed_ms": 800,
  "ui_tokens_override": {
    "background_class": "string",
    "font_family_css": "string",
    "hide_navigation": true
  },
  "rationale": "High cancellation counts detected alongside elevated heart rate thresholds. Forcing recovery decompression UI."
}
`;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return Response.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Fetch the most recent telemetry snapshot for this user
    const telemetrySnap = await adminDb
      .collection('users')
      .doc(userId)
      .collection('cognitive_telemetry')
      .orderBy('capturedAt', 'desc')
      .limit(1)
      .get();

    let telemetryContext = {
      heart_rate_variability_hrv: 45, // default mock
      average_heart_rate: 72,
      task_cancellation_count_last_2_hours: 0,
      input_typing_speed_wpm: 60,
      is_calendar_block_deep_work_true_false: false
    };

    if (!telemetrySnap.empty) {
      const data = telemetrySnap.docs[0].data();
      telemetryContext = {
        ...telemetryContext,
        heart_rate_variability_hrv: data.heartRateVariability || telemetryContext.heart_rate_variability_hrv,
        task_cancellation_count_last_2_hours: data.interactionFrictionScore || 0,
      };
    }

    const contextPrompt = `
Context Provided:
- Biometric Telemetry: HRV=${telemetryContext.heart_rate_variability_hrv}, Avg HR=${telemetryContext.average_heart_rate}
- Interaction Analytics: Cancellations (2h)=${telemetryContext.task_cancellation_count_last_2_hours}, Typing Speed=${telemetryContext.input_typing_speed_wpm} WPM
- Active Context: Deep Work Block Active=${telemetryContext.is_calendar_block_deep_work_true_false}
`;

    // In @google/genai syntax:
    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: STATE_ROUTER_PROMPT + '\n' + contextPrompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    let config;
    try {
      config = JSON.parse(response.text || '{}');
    } catch (e) {
      // Fallback
      config = {
        recommended_mode: "ZEN_MODE",
        confidence_score: 1.0,
        transition_animation_speed_ms: 800,
        ui_tokens_override: {
          background_class: "bg-slate-900",
          font_family_css: "font-sans",
          hide_navigation: false
        },
        rationale: "Fallback mode activated."
      };
    }

    // Save the inferred state back to telemetry record if it existed
    if (!telemetrySnap.empty && config.recommended_mode) {
      await telemetrySnap.docs[0].ref.update({
        inferredState: config.recommended_mode
      });
    }

    return Response.json({ success: true, data: config });

  } catch (error: any) {
    console.error('Sanctuary Routing Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
