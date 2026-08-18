import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private firebaseApp: admin.app.App | null = null;

  onModuleInit() {
    if (admin.apps.length > 0) return;

    const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (credPath) {
      try {
        const fs = require('fs');
        if (fs.existsSync(credPath)) {
          const serviceAccount = JSON.parse(fs.readFileSync(credPath, 'utf8'));
          this.firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
          console.log('Firebase Admin initialized');
          return;
        }
      } catch {
        console.warn('Firebase credentials not found at:', credPath);
      }
    }

    console.warn('Firebase not configured — running in dev mode (token = email)');
  }

  async verifyIdToken(token: string) {
    if (this.firebaseApp) {
      return this.firebaseApp.auth().verifyIdToken(token);
    }

    const role = token === 'admin@admin.com' ? 'admin' : 'user';
    return { uid: token, email: token, role };
  }
}
