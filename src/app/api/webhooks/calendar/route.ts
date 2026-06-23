import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    // Google Calendar sends resource state headers in the webhook
    const resourceState = req.headers.get('x-goog-resource-state');
    const channelId = req.headers.get('x-goog-channel-id');
    const resourceId = req.headers.get('x-goog-resource-id');

    if (resourceState === 'sync') {
      return NextResponse.json({ message: 'Sync successful' });
    }

    if (!channelId || !resourceId) {
      return NextResponse.json({ error: 'Missing webhook headers' }, { status: 400 });
    }

    // Identify user by channelId (in a real app, you'd store channelId in the user's Firestore doc)
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('calendarChannelId', '==', channelId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json({ error: 'User not found for channel' }, { status: 404 });
    }

    const userId = snapshot.docs[0].id;
    
    // Here we would fetch the incremental delta using syncToken from the Calendar API
    // and then reconcile it into Firestore.
    // For now, we update the user document to trigger a client-side fetch refresh.
    
    await updateDoc(doc(db, 'users', userId), {
      lastCalendarSync: new Date().toISOString()
    });

    return NextResponse.json({ success: true, message: 'Webhook processed' });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
