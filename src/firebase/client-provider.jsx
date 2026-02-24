'use client';
import { FirebaseProvider } from './provider';
import { initializeFirebase } from './index';

let firebaseInstance = null;

function getFirebaseInstance() {
    if (typeof window !== 'undefined') {
        if (!firebaseInstance) {
            firebaseInstance = initializeFirebase();
        }
        return firebaseInstance;
    }
    return { app: null, auth: null, firestore: null };
}

export function FirebaseClientProvider({ children }) {
    const instances = getFirebaseInstance();
    return <FirebaseProvider value={instances}>{children}</FirebaseProvider>;
}
