import { doc, getDoc, setDoc} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';
import { auth, db } from './firebase.js';
import { isLoggedIn, navigateTo, saveToStorage, updateLoginButton, logout, listenForAuthStateChanges, getCurrentUser, navigateToMyProfile } from './utils.js';

// register button event listener
document.getElementById('register-button').addEventListener('click', showRegisterForm);

// Event listener for the login form submission
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
            const user = userCredential.user;
            console.log('User logged in:', user);
            navigateTo('index'); 
            updateLoginButton(); 
        })
        .catch(error => {
            console.error('Error logging in:', error.message);
            alert('Login failed: ' + error.message);
        });
});

// Event listener for the register form submission
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const speedrunProfile = document.getElementById('speedrun-profile').value;

    try {
        // Validate the Speedrun.com profile
        const isValid = await validateSpeedrunProfile(speedrunProfile);
        if (!isValid) {
            alert('Invalid Speedrun.com profile. Please provide a valid username or URL.');
            return;
        }

        // Register the user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save user data to Firestore
        await setDoc(doc(db, 'users', user.uid), {
            email: email,
            speedrunProfile: speedrunProfile, 
        });
        alert('Registration successful!');
        showLoginForm(); // Show login form after successful registration
    } catch (error) {
        console.error('Error during registration:', error);
        alert('Error: ' + error.message);
    }
});

// Function to validate the Speedrun.com profile
async function validateSpeedrunProfile(profile) {
    const baseUrl = 'https://www.speedrun.com/api/v1/users/';
    const profileId = extractProfileId(profile);

    try {
        const response = await fetch(`${baseUrl}${profileId}`);
        if (response.ok) {
            return true;
        }
    } catch (error) {
        console.error('Error validating Speedrun.com profile:', error);
    }
    return false;
}

// Helper function to extract Speedrun.com username or ID
export function extractProfileId(profile) {
    if (profile.startsWith('https://www.speedrun.com/')) {
        return profile.split('/').pop(); // Extract username/ID from URL
    }
    return profile; // Assume input is the username
}

// Show the login form
export function showLoginForm() {
    // Hide the registration form and show the login form
    document.getElementById('register-form-container').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-button').style.display = 'block'; // Show the register button
}

// Show the registration form
export function showRegisterForm() {
    // Hide the login form and show the registration form
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form-container').style.display = 'block';
    document.getElementById('register-button').style.display = 'none'; // Hide the register button in registration view
}

// KEEP AT BOTTOM - EVENT LISTENERS
document.addEventListener('DOMContentLoaded', () => {
    updateLoginButton();
    listenForAuthStateChanges();

    // top nav
    document.getElementById('home-btn').addEventListener('click', () => navigateTo('index'));
    document.getElementById('leaderboard-btn').addEventListener('click', () => navigateTo('leaderboard'));
    document.getElementById('myProfileButton').addEventListener('click', navigateToMyProfile);
    document.getElementById('league-btn').addEventListener('click', () => navigateTo('league'));
    document.getElementById('login-btn').addEventListener('click', () => navigateTo('login'));
    document.getElementById('logout-btn').addEventListener('click', logout);
});