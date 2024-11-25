import { isLoggedIn, navigateTo, formatTime, saveToStorage, loadFromStorage, listenForAuthStateChanges, getCurrentUser, gameId, difficultyValue, runTypeValue, navigateToMyProfile, logout, searchForValue, getTimeFromRun, fetchPlayerUsername, getVideoLink, updateLoginButton } from './utils.js';
import { doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';
import { auth, db } from './firebase.js';

// manualRuns array here in case a run ever needs to be added manually for whatever reason
const manualRuns = [

];

// Function to show map selection after login or registration
export function showMapSelection(show = true) {
    const mapSelectionSection = document.getElementById('map-selection');
    mapSelectionSection.style.display = show ? 'block' : 'none';
}

// Function to hide leaderboard section
export function hideLeaderboard() {
    const leaderboardSection = document.getElementById('leaderboard-section');
    leaderboardSection.style.display = 'none';
}

function displayLeaderboard(mapData) {
    const leaderboardSection = document.getElementById('leaderboard-section');
    leaderboardSection.innerHTML = ''; // Clear previous leaderboard content
    
    if (mapData && mapData.length > 0) {
        mapData.forEach(map => {
            const mapItem = document.createElement('div');
            mapItem.classList.add('map-item');
            mapItem.textContent = `${map.name} - ${map.bestTime}`;
            leaderboardSection.appendChild(mapItem);
        });
    } else {
        leaderboardSection.innerHTML = 'No leaderboard data available.';
    }
}

// Fetch the categories from spedrun.com API
export function fetchMaps() {
    console.log('Fetching maps...');
    fetch(`https://www.speedrun.com/api/v1/games/${gameId}/categories`)
        .then(response => response.json())
        .then(data => {
            console.log('Fetched map categories:', data.data);

            // Filter out "All Maps" category, check if the condition is correct
            const filteredCategories = data.data.filter(category => category.name !== 'All Maps');
            console.log('Filtered categories:', filteredCategories);

            const mapSelector = document.getElementById('map-selector');
            mapSelector.innerHTML = '';  // Clear any previous selections

            if (filteredCategories.length === 0) {
                console.log('No categories after filtering.');
            }

            filteredCategories.forEach(map => {
                console.log('Creating button for map:', map.name);
                const button = document.createElement('button');
                button.textContent = map.name;
                button.onclick = () => fetchLeaderboard(map.id);
                mapSelector.appendChild(button);
            });
        })
        .catch(error => {
            console.error('Error fetching map categories:', error);
        });
}

// Fetch the leaderboard data for the selected map, using all runs and filter client-side
export function fetchLeaderboard(mapId, playerId) {
    console.log(`Fetching leaderboard for map ${mapId}...`);
    const apiUrl = `https://www.speedrun.com/api/v1/leaderboards/268we996/category/${mapId}?var-2lg3kv7n=jq6mk7o1&var-ql619ok8=81pjwnn1`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Fetched leaderboard data:', data);

            // Ensure data contains runs
            if (!data || !data.data || !data.data.runs || data.data.runs.length === 0) {
                document.getElementById('leaderboard-container').innerHTML = "<p>No leaderboard data found for this selection.</p>";
                return;
            }

            // Filter runs by difficulty (Normal) and Solo (1 player)
            const filteredRuns = data.data.runs.filter(run => {
                console.log('Full Run Data:', run);

                const difficultyMatch = searchForValue(run, difficultyValue);
                const soloMatch = searchForValue(run, runTypeValue);

                console.log('Difficulty match found:', difficultyMatch);
                console.log('Solo match found:', soloMatch);

                return difficultyMatch && soloMatch;
            });

            // Add manual runs for the specific map/category selected
            const manualRunsForMap = manualRuns.filter(run => run.category === mapId); // Filter by category
            const allRuns = [...filteredRuns, ...manualRunsForMap];

            // Sort the runs by time (ascending), with a safeguard to ensure times are valid
            const sortedRuns = allRuns.sort((a, b) => {
                const timeA = getTimeFromRun(a);
                const timeB = getTimeFromRun(b);

                console.log(`Time A: ${timeA}, Time B: ${timeB}`);

                return timeA - timeB;
            });

            // Fetch player names and generate leaderboard rows
            const leaderboardPromises = sortedRuns.map((run, index) => {
                return fetchPlayerUsername(run).then(playerName => {
                    const time = getTimeFromRun(run);
                    const formattedTime = time === 'N/A' ? 'N/A' : formatTime(time);
                    const videoLink = getVideoLink(run);

                    return {
                        rank: index + 1,  // Rank (1-based index)
                        playerName: playerName,
                        time: formattedTime,
                        videoLink: videoLink
                    };
                });
            });

            // After all player names are fetched and leaderboard rows are ready
            Promise.all(leaderboardPromises)
                .then(leaderboardData => {
                    // Save the leaderboard data to localStorage
                    localStorage.setItem(`leaderboard-${mapId}`, JSON.stringify(leaderboardData));

                    let leaderboardHTML = 
                        `<table>
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Player</th>
                                    <th>Time</th>
                                    <th>Video</th>
                                </tr>
                            </thead>
                            <tbody>`;

                    leaderboardData.forEach(runData => {
                        leaderboardHTML += 
                            `<tr>
                                <td>${runData.rank}</td>
                                <td><a href="#" class='playerprofile-btn' data-playername='${runData.playerName}'>${runData.playerName}</a></td>
                                <td>${runData.time}</td>
                                <td>${runData.videoLink}</td>
                            </tr>`;
                    });

                    leaderboardHTML += '</tbody></table>';
                    document.getElementById('leaderboard-container').innerHTML = leaderboardHTML;

                    // Show the leaderboard section only after data has been processed
                    document.getElementById('leaderboard-section').style.display = 'block';

                    // Add event listener for player profile button clicks
                    const leaderboardContainer = document.getElementById('leaderboard-container');
                    leaderboardContainer.addEventListener('click', function(event) {
                        if (event.target && event.target.matches('a.playerprofile-btn')) {
                            const playerName = event.target.getAttribute('data-playername');
                            showPlayerProfile(playerName);
                        }
                    });
                })
                .catch(error => console.error('Error fetching player names:', error));
        })
        .catch(error => {
            console.error('Error fetching leaderboard data:', error);
            document.getElementById('leaderboard-container').innerHTML = "<p>Error fetching leaderboard data.</p>";
        });
}

// Check if the leaderboard data is available in localStorage for the selected map
function displayLeaderboardFromStorage(mapId) {
    const leaderboardData = localStorage.getItem(`leaderboard-${mapId}`);
    
    if (leaderboardData) {
        const parsedData = JSON.parse(leaderboardData);
        let leaderboardHTML = 
            `<table>
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Player</th>
                        <th>Time</th>
                        <th>Video</th>
                    </tr>
                </thead>
                <tbody>`;

        parsedData.forEach(runData => {
            leaderboardHTML += 
                `<tr>
                    <td>${runData.rank}</td>
                    <td><a href="#" class='playerprofile-btn' data-playername='${runData.playerName}'>${runData.playerName}</a></td>
                    <td>${runData.time}</td>
                    <td>${runData.videoLink}</td>
                </tr>`;
        });

        leaderboardHTML += '</tbody></table>';
        document.getElementById('leaderboard-container').innerHTML = leaderboardHTML;
        document.getElementById('leaderboard-section').style.display = 'block';
    } else {
        // Handle the case where no data is available in localStorage
        document.getElementById('leaderboard-container').innerHTML = "<p>No leaderboard data found for this selection.</p>";
    }
}

// Function to show the player's profile page when their name is clicked
export function showPlayerProfile(playerId) {
    // Redirect to the player profile page with the playerId in the URL query string
    const currentTheme = localStorage.getItem('selectedTheme') || 'dark';
    window.location.href = `playerProfile.html?playerId=${playerId}&theme=${currentTheme}`;
}

// KEEP AT BOTTOM - EVENT LISTENERS
document.addEventListener('DOMContentLoaded', () => {
    updateLoginButton();
    listenForAuthStateChanges();

    fetchMaps();  // Load the list of maps when the page is ready

    // top nav
    document.getElementById('home-btn').addEventListener('click', () => navigateTo('index'));
    document.getElementById('leaderboard-btn').addEventListener('click', () => navigateTo('leaderboard'));
    document.getElementById('myProfileButton').addEventListener('click', navigateToMyProfile);
    document.getElementById('league-btn').addEventListener('click', () => navigateTo('league'));
    document.getElementById('login-btn').addEventListener('click', () => navigateTo('login'));
    document.getElementById('logout-btn').addEventListener('click', logout);
});