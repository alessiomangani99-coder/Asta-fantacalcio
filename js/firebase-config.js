/**
 * Configurazione Condivisa Firebase Realtime Database
 * Asta Fantacalcio 2026/2027
 */

const firebaseConfig = {
  apiKey: "AIzaSyDGIbLWD5o_vK9rbp-Ia2MDL86r_A_jbQk",
  authDomain: "asta-fantacalcio-5c5a4.firebaseapp.com",
  databaseURL: "https://asta-fantacalcio-5c5a4-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "asta-fantacalcio-5c5a4",
  storageBucket: "asta-fantacalcio-5c5a4.firebasestorage.app",
  messagingSenderId: "886621974457",
  appId: "1:886621974457:web:f3869a515d213acb869068"
};

if (typeof firebase !== 'undefined') {
  if (!firebase.apps || !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  window.fantaDb = firebase.database();
  window.db = window.fantaDb;
} else {
  console.warn('Firebase SDK compat non trovato in window.');
}
