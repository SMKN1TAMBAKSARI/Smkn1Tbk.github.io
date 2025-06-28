// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCXZT8-MwABIiggX80Sx_Z6X76jLY8YuV0",
  authDomain: "absensi-f662d.firebaseapp.com",
  projectId: "absensi-f662d",
  storageBucket: "absensi-f662d.firebasestorage.app",
  messagingSenderId: "522491068345",
  appId: "1:522491068345:web:cf7128720194d69e980068",
  measurementId: "G-1WFY6G68NZ"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Export for use in other files
window.auth = auth;
window.db = db;