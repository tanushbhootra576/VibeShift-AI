import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const channelId = request.headers.get('X-Goog-Channel-ID');
    const resourceState = request.headers.get('X-Goog-Resource-State');

    if (resourceState === 'sync') return new Response('OK', { status: 200 });

    if (!channelId) {
      return new Response('Missing Channel ID', { status: 400 });
    }

    // Find user by channel ID
    const usersSnap = await adminDb.collection('users')
      .where('calendarWatchChannelId', '==', channelId)
      .limit(1)
      .get();

    if (usersSnap.empty) {
      return new Response('Not found', { status: 404 });
    }

    const userDoc = usersSnap.docs[0];
    const userId = userDoc.id;

    // Ideally here we would fetch recent calendar events and sync to Firestore tasks.
    // For hackathon, we acknowledge we received it.
    console.log(`Received calendar webhook for user ${userId}`);

    return new Response('OK', { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
