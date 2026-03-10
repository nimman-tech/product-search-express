/**
 * Firebase Admin SDK initialization and configuration
 */

import admin from 'firebase-admin';

let firebaseInitialized = false;

/**
 * Initialize Firebase Admin SDK if not already initialized
 */
export function initializeFirebase(): void {
  if (firebaseInitialized) {
    return;
  }

  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

    if (!serviceAccountJson) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set');
    }

    let serviceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountJson);
    } catch (err) {
      throw new Error(`Invalid FIREBASE_SERVICE_ACCOUNT JSON: ${err}`);
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    firebaseInitialized = true;
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
}

/**
 * Get Firebase Auth instance
 */
export function getFirebaseAuth(): admin.auth.Auth {
  if (!firebaseInitialized) {
    initializeFirebase();
  }
  return admin.auth();
}

/**
 * Verify Firebase ID token
 */
export async function verifyToken(token: string): Promise<admin.auth.DecodedIdToken> {
  try {
    const auth = getFirebaseAuth();
    return await auth.verifyIdToken(token);
  } catch (error) {
    const err = error as admin.FirebaseError;
    throw new Error(`Token verification failed: ${err.message}`);
  }
}
