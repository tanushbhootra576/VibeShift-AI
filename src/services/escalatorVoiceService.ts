import twilio from 'twilio';

// Use environment variables or pass placeholders for testing
const accountSid = process.env.TWILIO_ACCOUNT_SID || 'AC_MOCK_SID';
const authToken = process.env.TWILIO_AUTH_TOKEN || 'MOCK_TOKEN';

// We wrap client instantiation to allow the app to compile even if Twilio isn't fully configured
let client: twilio.Twilio;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  client = twilio(accountSid, authToken);
}

export const triggerVoiceEscalation = async (userPhone: string, userName: string, taskTitle: string, minutesLeft: number) => {
  try {
    // 1. Generate the spoken script using natural syntax
    const speechText = `Hi ${userName}, I notice you haven't opened your ${taskTitle} file yet. There are only ${minutesLeft} minutes left before your deadline. Let's get moving, I've already opened the workspace for you.`;

    // 2. Build TwiML instruction payload for Twilio's natural neural voice
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say({
      voice: 'Polly.Joanna-Neural', // High-quality, natural human-sounding AI voice
      language: 'en-US'
    }, speechText);

    // If Twilio is not configured, simulate success for hackathon demo purposes
    if (!client) {
      console.log('[MOCK TWILIO CALL] Outbound voice call triggered!');
      console.log('[MOCK TWILIO SCRIPT]:', speechText);
      return { success: true, callSid: 'CA_mock_call_sid_12345', simulated: true };
    }

    // 3. Fire the outbound phone call live
    const call = await client.calls.create({
      twiml: twiml.toString(),
      to: userPhone,
      from: process.env.TWILIO_PHONE_NUMBER || '+1234567890'
    });

    return { success: true, callSid: call.sid };
  } catch (error: any) {
    console.error('Twilio Outbound Call Error:', error);
    return { success: false, error: error.message };
  }
};
