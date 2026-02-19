import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCyG7Qo2eLhrDISEOm96c-57ZNWpqYb9e4',
  authDomain: 'webaffe.firebaseapp.com',
  projectId: 'webaffe',
  storageBucket: 'webaffe.firebasestorage.app',
  messagingSenderId: '773656193574',
  appId: '1:773656193574:web:af28d2c04c6e95185c14e7',
  measurementId: 'G-P8S6ZJ3SPC',
};

let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

function getFirebaseApp(): FirebaseApp {
  if (!app) {
    const existingApps = getApps();
    app = existingApps.length > 0 ? existingApps[0] : initializeApp(firebaseConfig);
  }

  return app;
}

function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }

  return auth;
}

function getFirebaseFirestore(): Firestore {
  if (!firestore) {
    firestore = getFirestore(getFirebaseApp());
  }

  return firestore;
}

export { getFirebaseApp, getFirebaseAuth, getFirebaseFirestore };
