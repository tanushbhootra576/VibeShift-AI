import { adminDb } from './firebase-admin';
import { decrypt, encrypt } from './encryption';

export async function getValidAccessToken(userId: string): Promise<string> {
  const userDoc = await adminDb.collection('users').doc(userId).get();
  
  if (!userDoc.exists) {
    throw new Error('User not found');
  }

  const user = userDoc.data();
  if (!user?.googleAccessToken) {
    throw new Error('No Google Access Token found');
  }

  const decryptedToken = decrypt(user.googleAccessToken);

  // Check token validity
  try {
    const tokenInfo = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?access_token=${decryptedToken}`
    );
    
    if (tokenInfo.ok) {
      const { expires_in } = await tokenInfo.json();
      // If token expires in more than 5 minutes (300s), it's valid
      if (parseInt(expires_in) > 300) {
        return decryptedToken;
      }
    }
  } catch (err) {
    console.error('Failed to verify token info', err);
  }

  // Need to refresh
  if (!user.googleRefreshToken) {
    throw new Error('No Google Refresh Token available. User must re-authenticate.');
  }

  const decryptedRefresh = decrypt(user.googleRefreshToken);
  
  const refreshed = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      refresh_token: decryptedRefresh,
      grant_type: 'refresh_token',
    }),
  });

  if (!refreshed.ok) {
    throw new Error('Failed to refresh Google token');
  }

  const { access_token } = await refreshed.json();

  // Update Firestore with new encrypted access token
  await adminDb.collection('users').doc(userId).update({
    googleAccessToken: encrypt(access_token),
  });

  return access_token;
}
