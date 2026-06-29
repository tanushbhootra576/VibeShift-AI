import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { idToken, accessToken, refreshToken } = await request.json();

    if (!idToken) {
      return NextResponse.json({ error: 'Missing idToken' }, { status: 400 });
    }

    // Only attempt token storage if Firebase Admin env vars are configured.
    // Sign-in on the client has already succeeded at this point regardless.
    const hasAdminConfig =
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY &&
      process.env.ENCRYPTION_KEY;

    if (hasAdminConfig) {
      try {
        const { adminAuth, adminDb } = await import('@/lib/firebase-admin');
        const { encrypt } = await import('@/lib/encryption');

        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const uid = decodedToken.uid;

        const updateData: Record<string, string> = {};
        if (accessToken) updateData.googleAccessToken = encrypt(accessToken);
        if (refreshToken) updateData.googleRefreshToken = encrypt(refreshToken);

        if (Object.keys(updateData).length > 0) {
          await adminDb.collection('users').doc(uid).set(updateData, { merge: true });
        }
      } catch (adminError: any) {
        // Log but do not fail the request -- client auth already succeeded
        console.warn('Token storage skipped:', adminError.message);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('/api/auth/google error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
