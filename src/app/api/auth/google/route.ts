import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { encrypt } from '@/lib/encryption';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { idToken, accessToken, refreshToken } = await request.json();

    if (!idToken) return new Response('Missing idToken', { status: 400 });

    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const updateData: any = {};
    if (accessToken) updateData.googleAccessToken = encrypt(accessToken);
    if (refreshToken) updateData.googleRefreshToken = encrypt(refreshToken);

    await adminDb.collection('users').doc(uid).set(updateData, { merge: true });

    // Optional: Create session cookie for SSR if needed
    // const expiresIn = 60 * 60 * 24 * 5 * 1000;
    // const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    // cookies().set('__session', sessionCookie, { maxAge: expiresIn, httpOnly: true, secure: true });

    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
