const admin = require('firebase-admin');
const { firebase } = require('./env');

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: firebase.projectId || 'demo-project',
        privateKey: firebase.privateKey?.includes('BEGIN PRIVATE KEY') ? firebase.privateKey.replace(/\\n/g, '\n') : '-----BEGIN PRIVATE KEY-----\nMOCK_KEY\n-----END PRIVATE KEY-----\n',
        clientEmail: firebase.clientEmail || 'mock@example.com',
      }),
      storageBucket: firebase.storageBucket || 'mock.appspot.com',
    });
  } catch (error) {
    console.warn('⚠️ Firebase Admin initialization bypassed: Invalid or missing credentials provided in .env');
    // Fallback for local dev without credentials
    admin.initializeApp({ projectId: 'demo-project' });
  }
}

const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

module.exports = { admin, db, auth, storage };
