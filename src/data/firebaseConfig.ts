/**
 * MULTI-DEVICE CLOUD SYNC (Firebase)
 * ----------------------------------
 * Right now orders live in each phone’s localStorage — that is why:
 *   Same phone guest + kitchen  → works
 *   Two different phones        → kitchen does not see the order
 *
 * Fix: create a free Firebase project and paste config below.
 * Both phones must open the SAME app URL and use the same room id.
 *
 * Setup (5 minutes):
 * 1. https://console.firebase.google.com → Add project
 * 2. Build → Realtime Database → Create (start in test mode for demo)
 * 3. Project settings → Your apps → Web app → copy config
 * 4. Paste values into firebaseWebConfig below
 * 5. Rebuild / refresh both phones
 *
 * Realtime Database rules (demo / restaurant Wi‑Fi only):
 * {
 *   "rules": {
 *     ".read": true,
 *     ".write": true
 *   }
 * }
 * For production, lock rules with Auth.
 */

export const CLOUD_ROOM_ID = 'aaranya-main';

/** Set to true after you paste a real Firebase web config */
export const CLOUD_SYNC_ENABLED = true;

export const firebaseWebConfig = {
  apiKey: 'AIzaSyDSE8P3CaIp3lFDvhJk0tCbLC0X4lxONzs',
  authDomain: 'aaranya-demo.firebaseapp.com',
  databaseURL: 'https://aaranya-demo-default-rtdb.firebaseio.com',
  projectId: 'aaranya-demo',
  storageBucket: 'aaranya-demo.firebasestorage.app',
  messagingSenderId: '505205573258',
  appId: '1:505205573258:web:f9bcbf565ac06c34e9cf73',
};

export function isFirebaseConfigured(): boolean {
  const c = firebaseWebConfig;
  if (!CLOUD_SYNC_ENABLED) return false;
  if (!c.apiKey || c.apiKey.includes('DemoReplace') || c.apiKey.includes('YOUR_')) {
    return false;
  }
  if (!c.databaseURL || c.databaseURL.includes('YOUR_PROJECT')) {
    return false;
  }
  if (!c.projectId || c.projectId.includes('YOUR_')) {
    return false;
  }
  return true;
}
