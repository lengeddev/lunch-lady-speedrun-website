import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';
import { auth, db } from './firebase.js';


// Handle the login state changes
export let userId = null;
export let userSpeedrunUsername = null;  // Global variable

export const gameId = '268we996';  // Game ID for Lunch Lady from Speedrun.com
export const difficultyValue = 'jq6mk7o1';  // ID for "Normal" difficulty
export const runTypeValue = '81pjwnn1';  // ID for "Solo" run type

export function listenForAuthStateChanges() {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // User is signed in
            userId = user.uid;  // Set global userId
            console.log('User is signed in:', userId);

            // Fetch user data from Firestore to check if the Speedrun.com account is linked
            const userDoc = doc(db, 'users', userId);
            const userSnapshot = await getDoc(userDoc);

            if (userSnapshot.exists()) {
                console.log('User data found:', userSnapshot.data());

                // Check if speedrunProfile exists in Firestore document
                if (userSnapshot.data().speedrunProfile) {
                    userSpeedrunUsername = userSnapshot.data().speedrunProfile;  // Update global variable
                    console.log("Speedrun username updated:", userSpeedrunUsername);  // Check the value
                    document.getElementById('myProfileButton').style.display = 'block';
                } else {
                    console.log('No speedrunProfile field found in user data');
                    alert("Please link your Speedrun.com account.");
                }
            } else {
                console.log('No user data found for the user');
                alert("Please link your Speedrun.com account.");
            }
        } else {
            // User is not signed in
            userSpeedrunUsername = null;  // Reset the global variable
            console.log('User is not signed in');
            document.getElementById('myProfileButton').style.display = 'none';
        }
        updateLoginButton();
    });
}



export function isLoggedIn() {
    return !!auth.currentUser;  // Check if there is a logged-in user in Firebase
}

export function getCurrentUser() {
    return auth.currentUser || null;  // Returns Firebase user object or null if not logged in
}

export function navigateTo(page) {
    window.location.href = `${page}.html`;
}

// Helper function to search for a specific value in the "values" object (for difficulty and solo)
export function searchForValue(run, value) {
    if (run && run.run && run.run.values) {
        const runValues = run.run.values;
        return Object.values(runValues).includes(value);
    }
    return false;
}

// Helper function to format time (seconds to minutes:seconds with 3 decimal places)
export function formatTime(seconds) {
    if (seconds === 'N/A') return 'N/A';
    
    const minutes = Math.floor(seconds / 60);
    let remainingSeconds = (seconds % 60).toFixed(3);  // Keep three decimal places
    
    // Ensure seconds have 2 digits
    const [wholeSeconds, decimal] = remainingSeconds.split('.');
    const formattedSeconds = wholeSeconds.padStart(2, '0') + '.' + decimal;

    return `${minutes}:${formattedSeconds}`;
}

export function saveToStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

export function loadFromStorage(key) {
    return JSON.parse(localStorage.getItem(key));
}

export function removeFromStorage(key) {
    localStorage.removeItem(key);
}

export function navigateToMyProfile() {
    console.log('userSpeedrunUsername:', userSpeedrunUsername); // Check the value
    if (userSpeedrunUsername) {
        // Redirect to the user's profile page
        window.location.href = `playerProfile.html?playerId=${userSpeedrunUsername}`;
    } else {
        alert("You must link your Speedrun.com account first.");
    }
}

// Update the login/logout button after a successful login or logout
export function updateLoginButton() {
    const loginButton = document.getElementById('login-btn');
    const logoutButton = document.getElementById('logout-btn');

    // This check is to make sure that the login/logout button visibility
    // is correctly updated on page load and immediately after any auth state change
    if (auth.currentUser) {
        // User is logged in
        if (loginButton) {
            loginButton.style.display = 'none'; // Hide login button
        }
        if (logoutButton) {
            logoutButton.style.display = 'block'; // Show logout button
        }
    } else {
        // User is not logged in
        if (loginButton) {
            loginButton.style.display = 'block'; // Show login button
        }
        if (logoutButton) {
            logoutButton.style.display = 'none'; // Hide logout button
        }
    }
}

// User logout
export function logout() {
    signOut(auth).then(() => {
        console.log('User logged out');
        updateLoginButton();  // Change logout button back to login
    }).catch(error => {
        console.error('Error logging out:', error.message);
    });
}

// Fetch player profile data to get their international username
export function fetchPlayerUsername(run) {
    // If the run is a manual entry, use the manually provided name
    if (run.players && run.players[0] && run.players[0].names && run.players[0].names.international) {
        return Promise.resolve(run.players[0].names.international);
    }

    // For non-manual runs, fetch the player info using the API
    if (run.run && run.run.players && run.run.players[0] && run.run.players[0].uri) {
        const playerUri = run.run.players[0].uri;
        return fetch(playerUri)
            .then(response => response.json())
            .then(playerData => {
                if (playerData && playerData.data && playerData.data.names && playerData.data.names.international) {
                    return playerData.data.names.international;  // Return the player's international name
                } else {
                    return 'N/A';  // If no player name, return 'N/A'
                }
            })
            .catch(() => 'N/A');  // In case of any error, return 'N/A'
    }
    return Promise.resolve('N/A');  // If no player info, return 'N/A'
}

// Function to get time from run object
export function getTimeFromRun(run) {
    if (run && run.run && run.run.times && run.run.times.primary_t !== undefined && run.run.times.primary_t !== null) {
        const time = parseFloat(run.run.times.primary_t);  // Convert to float
        return isNaN(time) ? 'N/A' : time;
    }
    return 'N/A';
}

// Helper function to get video link from the run object
export function getVideoLink(run) {
    // Check for video link in the run object
    if (run.run && run.run.videos && run.run.videos.links && run.run.videos.links.length > 0) {
        return `<a href="${run.run.videos.links[0].uri}" target="_blank">Watch</a>`;
    } else {
        return 'N/A'; // No video link available
    }
}

// Function to show the player's profile page when their name is clicked
export function showPlayerProfile(playerId) {
    // Redirect to the player profile page with the playerId in the URL query string
    const currentTheme = localStorage.getItem('selectedTheme') || 'dark';
    window.location.href = `playerProfile.html?playerId=${playerId}&theme=${currentTheme}`;
}

// Fetch player profile image
export function fetchPlayerProfileImage(playerId) {
    const apiUrl = `https://www.speedrun.com/api/v1/users/${playerId}`;
    
    console.log('Player profile data:', data);
    console.log('Fetched player ID:', playerId);

    return fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data && data.data && data.data.assets && data.data.assets.image) {
                return data.data.assets.image.uri; // Return the URL of the player's profile picture
            }
            return 'assets/user-placeholder.png'; // Default fallback image
        })
        .catch(error => {
            console.error('Error fetching player profile image:', error);
            return 'assets/user-placeholder.png'; // Default fallback image on error
        });
}

// Fetch player profile from Speedrun.com API
export function fetchPlayerProfile(playerId) {
    const apiUrl = `https://www.speedrun.com/api/v1/users/${playerId}`;
    return fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => data.data || null)
        .catch((error) => {
            console.error('Error fetching player profile:', error);
            return null;
        });
}