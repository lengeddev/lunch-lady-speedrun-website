import { isLoggedIn, navigateTo, saveToStorage, loadFromStorage, listenForAuthStateChanges, getCurrentUser, navigateToMyProfile, logout, updateLoginButton, fetchPlayerProfileImage, fetchPlayerProfile } from './utils.js';
import { doc, getDoc, collection, getDocs, query, orderBy } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';
import { auth, db } from './firebase.js';

// Fetch players from Firestore
async function fetchPlayers() {
    const playerCollection = collection(db, 'players');
    const playerSnapshot = await getDocs(playerCollection);
    
    const playerList = playerSnapshot.docs.map(doc => {
        const playerData = doc.data();
        return {
            id: doc.id, // Player name is the document ID
            ...playerData // Include the rest of the player data
        };
    });
    
    return playerList;
}

// Sort players by category (rating or leagueMedals)
function sortPlayers(playerList, sortBy) {
    if (sortBy === 'leaguePoints') {
        return playerList.sort((a, b) => b.leagueMedals - a.leagueMedals);  // Descending order
    } else if (sortBy === 'weight') {
        return playerList.sort((a, b) => b.rating - a.rating);  // Descending order
    }
    return playerList;
}

// Render the leaderboard, showing only relevant data based on selected category
function renderLeaderboard(sortedPlayers, activeCategory) {
    const leaderboardBody = document.getElementById('leaderboard-body');
    leaderboardBody.innerHTML = '';  // Clear previous leaderboard data

    sortedPlayers.forEach((player, index) => {
        const playerRow = document.createElement('tr');
        
        // Display data based on the active category
        const rating = player.rating !== undefined ? player.rating.toFixed(2) : 'N/A';  // Format to 2 decimal places
        const leagueMedals = player.leagueMedals !== undefined ? player.leagueMedals.toFixed(2) : 'N/A';  // Format to 2 decimal places

        // Conditionally display either rating or league medals
        let pointsToDisplay = '';
        if (activeCategory === 'leaguePoints') {
            pointsToDisplay = leagueMedals;  // Show league medals for the league points leaderboard
        } else if (activeCategory === 'weight') {
            pointsToDisplay = rating;  // Show rating for the weight leaderboard
        }

        // Create a clickable link for the username (player.id will be used as a player identifier)
        const usernameLink = document.createElement('a');
        usernameLink.href = `/pages/playerProfile.html?playerId=${player.id}`; // Assuming 'player.id' is the unique player ID
        usernameLink.textContent = player.id;  // Display player's name (player.id)
        usernameLink.classList.add('username-link'); // Optional class for styling

        // Insert the data into the row
        playerRow.innerHTML = `
            <td>${index + 1}</td>
            <td></td>  <!-- Placeholder for the username link -->
            <td>${pointsToDisplay}</td> <!-- Show either rating or league medals depending on active category -->
        `;
        
        // Append the username link inside the second column (Username column)
        playerRow.cells[1].appendChild(usernameLink);

        leaderboardBody.appendChild(playerRow);
    });
}

// Set up event listeners for the sorting buttons
function setupLeaderboardButtons() {
    const buttons = document.querySelectorAll('.leaderboard-button');
    
    buttons.forEach(button => {
        button.addEventListener('click', async (event) => {
            const category = event.target.dataset.category;  // Get the data-category of the clicked button

            // Remove 'active-button' class from all buttons
            buttons.forEach(btn => btn.classList.remove('active-button'));

            // Add 'active-button' class to the clicked button
            event.target.classList.add('active-button');

            // Fetch players and sort them by the selected category
            const players = await fetchPlayers();
            const sortedPlayers = sortPlayers(players, category);
            renderLeaderboard(sortedPlayers, category);
        });
    });
}

// Initial load and setup of event listeners
(async () => {
    const players = await fetchPlayers();
    const sortedPlayers = sortPlayers(players, 'weight');  // Default sorting by weight (rating)
    renderLeaderboard(sortedPlayers, 'weight');  // Initially display the weight leaderboard (rating)
    setupLeaderboardButtons();  // Set up the button click listeners

    // Set "Weight" button as the active one initially
    const weightButton = document.querySelector('[data-category="weight"]');
    weightButton.classList.add('active-button');  // Ensure only the Weight button is active
})();