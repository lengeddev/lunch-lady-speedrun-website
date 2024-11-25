import { logout, navigateTo, updateLoginButton, listenForAuthStateChanges, navigateToMyProfile } from './utils.js'
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';
import { setDoc, doc, getDoc } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';
import { auth, db } from './firebase.js';

// KEEP AT BOTTOM - EVENT LISTENERS
document.addEventListener('DOMContentLoaded', () => {
    updateLoginButton();
    listenForAuthStateChanges();

    // top nav
    document.getElementById('home-btn').addEventListener('click', () => navigateTo('index'));
    document.getElementById('leaderboard-btn').addEventListener('click', () => navigateTo('leaderboard'));
    document.getElementById('playerlb-btn').addEventListener('click', () => navigateTo('playerlb'));
    document.getElementById('myProfileButton').addEventListener('click', navigateToMyProfile);
    document.getElementById('league-btn').addEventListener('click', () => navigateTo('league'));
    document.getElementById('login-btn').addEventListener('click', () => navigateTo('login'));
    document.getElementById('logout-btn').addEventListener('click', logout);
});
