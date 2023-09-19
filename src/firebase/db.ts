import admin, { ServiceAccount } from 'firebase-admin';
import serviceAccount from './serviceAccountKeyDev';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
});

export const db = admin.firestore();
