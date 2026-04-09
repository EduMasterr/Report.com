// Firebase Configuration and Initialization for Report System
const firebaseConfig = {
    apiKey: "AIzaSyB0cSh1kSSaqumLeLNrN_7eWa5JFV-valg",
    authDomain: "report-20026.firebaseapp.com",
    databaseURL: "https://report-20026-default-rtdb.firebaseio.com",
    projectId: "report-20026",
    storageBucket: "report-20026.firebasestorage.app",
    messagingSenderId: "72790875487",
    appId: "1:72790875487:web:3b21e2a6e1ae4c0524eaea",
    measurementId: "G-9CFZ6VJ4RS"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Initialize Firebase Database and share it globally
window.db = firebase.database();
console.log("🔥 Firebase Initialized and Connected");
