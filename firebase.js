import { initializeApp } from 'firebase/app';

import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
  apiKey: "AIzaSyDxIEZK9y6gqdGpMGas_cC9eI7RpJrqZWg",
  authDomain: "inventory-management-app-7c586.firebaseapp.com",
  projectId: "inventory-management-app-7c586",
  storageBucket: "inventory-management-app-7c586.appspot.com",
  messagingSenderId: "466504715054",
  appId: "1:466504715054:web:cdb3ad307a43ca54da88bf"
 };
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export { firestore };