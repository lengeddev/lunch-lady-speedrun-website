import { isLoggedIn, navigateTo, saveToStorage, loadFromStorage, listenForAuthStateChanges, getCurrentUser, navigateToMyProfile, logout, updateLoginButton } from './utils.js';
import { doc, getDoc, collection, getDocs, query, orderBy } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';
import { auth, db } from './firebase.js';

// Firebase references to the seasons (now separate collections for each season)
const season1Ref = collection(db, 'season1');
const season2Ref = collection(db, 'season2');

async function loadLeaderboard(season) {
    // Get the correct Firestore collection based on the season
    const seasonRef = season === 'season1' ? season1Ref : season2Ref;

    // Create a query with orderBy('points', 'desc')
    const seasonQuery = query(seasonRef, orderBy('points', 'desc'));

    // Get the leaderboard container and prepare for transition
    const leaderboardContainer = document.getElementById('league-leaderboard-container');
    leaderboardContainer.style.opacity = 0; // Fade out
    await new Promise((resolve) => setTimeout(resolve, 300)); // Wait for the fade-out effect

    // Clear previous content and fetch data from Firestore
    leaderboardContainer.innerHTML = '';
    const snapshot = await getDocs(seasonQuery);

    if (snapshot.empty) {
        leaderboardContainer.innerHTML = '<tr><td colspan="3">No data available for this season.</td></tr>';
    } else {
        // Loop through each document in the Firestore collection
        snapshot.forEach((doc) => {
            const playerData = doc.data();

            // Create a new row for each player
            const row = document.createElement('tr');

            // Create a cell for the player's rank or place
            const placeCell = document.createElement('td');
            placeCell.textContent = playerData.place;
            row.appendChild(placeCell);

            // Create a cell for the player's username, linking it to their profile
            const usernameCell = document.createElement('td');
            usernameCell.innerHTML = `<a href="playerProfile.html?playerId=${playerData.username}" class="username-link">${playerData.username}</a>`;
            row.appendChild(usernameCell);

            // Create a cell for the player's points
            const pointsCell = document.createElement('td');
            pointsCell.textContent = playerData.points;
            row.appendChild(pointsCell);

            // Append the row to the table
            leaderboardContainer.appendChild(row);
        });
    }

    // Apply a fade-in effect after updating content
    leaderboardContainer.style.opacity = 1; // Fade back in
}

// Function to highlight the active season button
function setActiveSeason(seasonButton) {
    // Get the season buttons
    const season1Btn = document.getElementById('season1-btn');
    const season2Btn = document.getElementById('season2-btn');

    // Remove 'selected' class from both buttons
    season1Btn.classList.remove('selected');
    season2Btn.classList.remove('selected');

    // Add 'selected' class to the clicked button
    seasonButton.classList.add('selected');
}



// KEEP AT BOTTOM - EVENT LISTENERS
document.addEventListener('DOMContentLoaded', () => {
    updateLoginButton();
    listenForAuthStateChanges();

    loadLeaderboard('season2');  // Automatically load season 2 on page load
    setActiveSeason(document.getElementById('season2-btn'));  // Set season 2 as the active button


    // top nav
    document.getElementById('home-btn').addEventListener('click', () => navigateTo('index'));
    document.getElementById('leaderboard-btn').addEventListener('click', () => navigateTo('leaderboard'));
    document.getElementById('myProfileButton').addEventListener('click', navigateToMyProfile);
    document.getElementById('league-btn').addEventListener('click', () => navigateTo('league'));
    document.getElementById('login-btn').addEventListener('click', () => navigateTo('login'));
    document.getElementById('logout-btn').addEventListener('click', logout);

    // league buttons
    document.getElementById('season1-btn').addEventListener('click', () => {
        loadLeaderboard('season1');
        setActiveSeason(document.getElementById('season1-btn'));  // Highlight the clicked button
    });
    
    document.getElementById('season2-btn').addEventListener('click', () => {
        loadLeaderboard('season2');
        setActiveSeason(document.getElementById('season2-btn'));  // Highlight the clicked button
    });
});