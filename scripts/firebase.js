// Import the Firebase functions
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';
import { getFirestore, setDoc, doc, getDoc, } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyDgi49oumMLUn1giAynPv9pYN1THfQZnd4",
    authDomain: "lunch-lady-sr-website.firebaseapp.com",
    projectId: "lunch-lady-sr-website",
    storageBucket: "lunch-lady-sr-website.firebasestorage.app",
    messagingSenderId: "973879213218",
    appId: "1:973879213218:web:f26b03110330d3ba392bfb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {auth, db };