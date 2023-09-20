import admin, { ServiceAccount, credential } from 'firebase-admin';
import serviceAccount from './serviceAccountKeyDev';

admin.initializeApp({
  // credential: admin.credential.cert(serviceAccount as ServiceAccount),
  credential: credential.cert(serviceAccount as ServiceAccount),
});

export const db = admin.firestore();
