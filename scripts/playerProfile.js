import { isLoggedIn, navigateTo, formatTime, loadFromStorage, saveToStorage, navigateToMyProfile, listenForAuthStateChanges, getCurrentUser, logout, updateLoginButton, fetchPlayerProfileImage, fetchPlayerProfile } from './utils.js';
import { doc, getDoc, getDocs, query, orderBy, collection, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';
import { auth, db } from './firebase.js';


// Firestore references for season 1 and season 2 collections
const season1Ref = collection(db, 'season1');
const season2Ref = collection(db, 'season2');

let userId = null;
let userSpeedrunUsername = null;

// Retrieve user login status from localStorage
const myProfileButton = document.getElementById('myProfileButton');
const logoutButton = document.getElementById('logout-btn');
const achievementsContainer = document.getElementById("achievements");
const loadingSpinner = document.getElementById('loading');
const profileDetails = document.getElementById('profile-details');

if (isLoggedIn) {
    userId = localStorage.getItem('userId');
    userSpeedrunUsername = localStorage.getItem('userSpeedrunUsername');
    
    // Enable "My Profile" button and hide login/logout buttons
    myProfileButton.style.display = 'block';
    logoutButton.style.display = 'block';
} else {
    myProfileButton.style.display = 'none';
    logoutButton.style.display = 'none';
}

// Handle user login state
onAuthStateChanged(auth, async (user) => {
    if (user) {
        userId = user.uid;
        const userDoc = doc(db, 'users', userId);
        const userSnapshot = await getDoc(userDoc);

        if (userSnapshot.exists()) {
            userSpeedrunUsername = userSnapshot.data().speedrunProfile;
            myProfileButton.style.display = 'block';
        } else {
            alert("Please link your Speedrun.com account.");
        }
    } else {
        myProfileButton.style.display = 'none';
    }
});

// Load player data when the page loads
function loadPlayerData(playerId) {
    // Fetch player profile data
    fetchPlayerProfile(playerId).then(playerData => {
        if (playerData) {
            displayPlayerProfile(playerData);  // Display the player's profile details
        }
    });
}

// Evaluate and display achievements
function evaluateAndDisplayAchievements(pbArray, totalRating) {
    const achievements = [
        {
            id: 1,
            name: "First Speedrun!",
            description: "Completed your first speedrun!",
            condition: (data) => data.pbArray.length > 0,
            icon: "../achievements/first_speedrun.png",
        },
        {
            id: 2,
            name: "Cruxville Champion",
            description: "Achieved a time under 1:45 on Cruxville Junior High.",
            mapName: "Cruxville Junior High",
            condition: (data) =>
                data.pbArray.some((run) => run.mapName === "Cruxville Junior High" && run.time < 105),
            icon: "../achievements/first_speedrun.png",
        },
        {
            id: 3,
            name: "Swim Hall Savant",
            description: "Achieved a time under 1:20 on Higgins Swimming Hall.",
            mapName: "Higgins Swimming Hall",
            condition: (data) =>
                data.pbArray.some((run) => run.mapName === "Higgins Swimming Hall" && run.time < 80),
            icon: "../achievements/first_speedrun.png",
        },
        {
            id: 4,
            name: "Hig High Heater",
            description: "Achieved a time under 1:45 on Higgins High School.",
            mapName: "Higgins High School",
            condition: (data) =>
                data.pbArray.some((run) => run.mapName === "Higgins High School" && run.time < 105),
            icon: "../achievements/first_speedrun.png",
        },
        {
            id: 5,
            name: "Burcksley Barbarian",
            description: "Achieved a time under 2:20 on Burcksley High School.",
            mapName: "Burcksley High School",
            condition: (data) =>
                data.pbArray.some((run) => run.mapName === "Burcksley High School" && run.time < 140),
            icon: "../achievements/first_speedrun.png",
        },
        {
            id: 6,
            name: "Melbury Master",
            description: "Achieved a time under 1:25 on Melbury High School.",
            mapName: "Melbury High School",
            condition: (data) =>
                data.pbArray.some((run) => run.mapName === "Melbury High School" && run.time < 85),
            icon: "../achievements/first_speedrun.png",
        },
        {
            id: 7,
            name: "Manic Messiah",
            description: "Achieved a time under 1:40 on Manic University.",
            mapName: "Manic University",
            condition: (data) =>
                data.pbArray.some((run) => run.mapName === "Manic University" && run.time < 100),
            icon: "../achievements/first_speedrun.png",
        },
        {
            id: 8,
            name: "Hibashi Hero",
            description: "Achieved a time under 1:40 on Hibashi High School.",
            mapName: "Hibashi High School",
            condition: (data) =>
                data.pbArray.some((run) => run.mapName === "Hibashi High School" && run.time < 100),
            icon: "../achievements/first_speedrun.png",
        },
        {
            id: 9,
            name: "Nightmare Necromancer",
            description: "Achieved a time under 1:45 on Nightmare High.",
            mapName: "Nightmare High",
            condition: (data) =>
                data.pbArray.some((run) => run.mapName === "Nightmare High" && run.time < 105),
            icon: "../achievements/first_speedrun.png",
        },
        {
            id: 10,
            name: "Bronze Rank",
            description: "Achieved the Bronze rank.",
            condition: (data) => data.totalRating >= 0,
            icon: "../achievements/first_speedrun.png",
        },
        {
            id: 11,
            name: "Silver Rank",
            description: "Achieved the Silver rank by reaching 300 weight.",
            condition: (data) => data.totalRating >= 300,
            icon: "../achievements/first_speedrun.png",
        },
        {
            id: 12,
            name: "Gold Rank",
            description: "Achieved the Gold rank by reaching 600 weight.",
            condition: (data) => data.totalRating >= 600,
            icon: "../achievements/first_speedrun.png",
        },
        {
            id: 13,
            name: "Platinum Rank",
            description: "Achieved the Platinum rank by reaching 900 weight.",
            condition: (data) => data.totalRating >= 900,
            icon: "../achievements/first_speedrun.png",
        },
        {
            id: 14,
            name: "Diamond Rank",
            description: "Achieved the Diamond rank by reaching 1300 weight.",
            condition: (data) => data.totalRating >= 1300,
            icon: "../achievements/first_speedrun.png",
        },
        {
        id: 14,
        name: "Legend Rank",
        description: "Achieved the Legend rank by reaching 1700+ weight.",
        condition: (data) => data.totalRating >= 1700,
        icon: "../achievements/first_speedrun.png",
    },
    {
        id: 15,
        name: "Jack Of All Trades",
        description: "Completed a run on every map.",
        condition: (data) => data.pbArray.length === 9,
        icon: "../achievements/first_speedrun.png",
    },
    ];

    // Combine player data (e.g., personal bests and totalRating)
    const playerData = { pbArray, totalRating };

    const unlockedAchievements = achievements.filter((achievement) =>
        achievement.condition(playerData)
    );

    achievementsContainer.innerHTML = achievements
        .map((achievement) => {
            const unlocked = unlockedAchievements.includes(achievement);
            return `
                <div class="achievement-card ${unlocked ? "unlocked" : "locked"}">
                    <img src="${achievement.icon}" alt="${achievement.name}" class="achievement-icon">
                    <div class="achievement-info">
                        <h3>${achievement.name}</h3>
                        <p>${achievement.description}</p>
                    </div>
                </div>`;
        })
        .join("");
}

// Display player profile
function displayPlayerProfile(playerData) {
    if (playerData) {
        document.querySelector('.profile-picture img').src =
            playerData.assets?.image?.uri || '../assets/images/user-placeholder.png';
        document.querySelector('.player-name').textContent = playerData.names?.international || 'Unknown Player';
        document.querySelector('.player-location').textContent =
            `Location: ${playerData.location?.country?.names?.international || 'Unknown'}`;
        
        // Make profile details visible
        document.getElementById('profile-details').style.display = 'block';
        document.getElementById('loading').style.display = 'none';
    } else {
        console.error('No player data found.');
    }
}

// Fetch leaderboard and extract player ID
function fetchLeaderboardPlayerId(categoryId) {
    const apiUrl = `https://www.speedrun.com/api/v1/leaderboards/${gameId}/category/${categoryId}`;

    console.log('Player profile data:', data);
    console.log('Fetched player ID:', playerId);

    return fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data && data.data && data.data.runs && data.data.runs.length > 0) {
                const playerUri = data.data.runs[0].run.players[0].uri;
                const playerId = playerUri.split('/').pop(); // Extract the player ID from the URI
                return playerId;
            }
            throw new Error('No players found in the leaderboard.');
        })
        .catch(error => {
            console.error('Error fetching leaderboard player ID:', error);
            return null; // Return null if no player found
        });
}

// Function to update player profile picture
function updatePlayerProfilePicture(playerId) {
    fetchPlayerProfileImage(playerId).then(imageUrl => {
        document.querySelector('.profile-picture img').src = imageUrl; // Set the image URL
    });
}

// Load the player profile from the leaderboard and update the profile picture
function loadLeaderboardAndPlayerProfile(categoryId) {
    fetchLeaderboardPlayerId(categoryId).then(playerId => {
        if (playerId) {
            updatePlayerProfilePicture(playerId);
        } else {
            console.log('No player found.');
        }
    });
}

// PLAYER PB SYSTEM

const nameCache = {
    categories: {
        "w208x35d": "Cruxville Junior High",
        "jdzenw3d": "Higgins Swimming Hall",
        "wdm9r04k": "Higgins High School",
        "xk9w8eg2": "Burcksley High School",
        "xk9x0m4k": "Melbury High School",
        "w20ero5d": "Manic University",
        "824oxynd": "Hibashi High School",
        "rkl87p62": "Nightmare High",
        "5dwzo9ed": "Community Swimming Hall",
    }
};

// Define the category ID for "All Maps"
const allMapsCategoryId = "w208ex8d";

// Helper function to get the map name using the category ID
function getMapNameFromCategory(categoryId) {
    return nameCache.categories[categoryId] || "Unknown Map";
}

// Helper function to search for a specific value in the "values" object (for difficulty and solo)
export function searchForValue(run, value) {
    if (run && run.run && run.run.values) {
        const runValues = run.run.values;
        return Object.values(runValues).includes(value);
    }
    return false;
}

function fetchUserId(playerId) {
    const url = `https://www.speedrun.com/api/v1/users/${playerId}`;
    
    fetch(url)
      .then(response => response.json())
      .then(data => {
        const userId = data.data.id; // This is the user ID
        console.log("User ID:", userId);
        
        // Now, use this user ID to fetch the runs
        fetchSpeedrunData(playerId, userId);
      })
      .catch(error => {
        console.error("Error fetching user ID:", error);
      });
  }

function fetchAllRuns(userId, offset = 0, allRuns = []) {
    const limit = 20; // Speedrun.com API returns 20 runs per page
    const url = `https://www.speedrun.com/api/v1/runs?user=${userId}&offset=${offset}`;

    return fetch(url)
        .then(response => response.json())
        .then(data => {
            const runs = data.data;
            console.log(`Fetched ${runs.length} runs at offset ${offset}`);
            
            // Add the fetched runs to the allRuns array
            allRuns.push(...runs);

            // If we received less than the limit, we've reached the end
            if (runs.length < limit) {
                return allRuns; // Return the accumulated runs
            } else {
                // Otherwise, fetch the next batch
                return fetchAllRuns(userId, offset + limit, allRuns);
            }
        })
        .catch(error => {
            console.error("Error fetching runs:", error);
            return allRuns; // Return whatever data we managed to fetch
        });
}

function fetchSpeedrunData(playerId, userId) {
    fetchAllRuns(userId).then(allRuns => {
        console.log("Total runs fetched:", allRuns.length);

        const difficultyValue = "jq6mk7o1"; // Replace with actual value for difficulty
        const runTypeValue = "81pjwnn1";   // Replace with actual value for solo

        // Filter the runs that contain both target strings anywhere in the run object
        const filteredRuns = allRuns.filter(run => {
            console.log("Inspecting run:", run);

            // Convert the run object to a string and check for both values
            const runString = JSON.stringify(run);
            const difficultyMatch = runString.includes(difficultyValue);
            const soloMatch = runString.includes(runTypeValue);

            console.log("Difficulty Match:", difficultyMatch);
            console.log("Solo Match:", soloMatch);

            return difficultyMatch && soloMatch;
        });

        console.log("Filtered runs:", filteredRuns);

        // Process the filtered runs to extract PBs for each map
        processFilteredRuns(playerId, filteredRuns);
    }).catch(error => {
        console.error("Error fetching all runs:", error);
    });
}
  
// Process filtered runs and get the player's rank for each map
function processFilteredRuns(playerId, filteredRuns) {
    console.log("Filtered runs:", filteredRuns);

    const pbMap = {};

    // Iterate through filtered runs to determine best times for each map
    filteredRuns.forEach(run => {
        const categoryId = run.category; // Get category ID
        const status = run.status?.status || "active"; // Get run status (active or rejected)
        const mapName = getMapNameFromCategory(categoryId); // Get map name from category ID
        const time = run.times.primary_t; // Time in seconds
        const videoUrl = run.videos?.links?.[0]?.uri || "N/A"; // Safely retrieve video URL or default to "N/A"

        // Skip "All Maps" category and rejected runs
        if (categoryId === allMapsCategoryId || status === "rejected") {
            console.log(`Skipping run: category '${categoryId}' or status '${status}'`);
            return;
        }

        console.log(`Processing run for map: ${mapName}, time: ${time}`);

        // If this is the player's best time for the map, update the PB
        if (!pbMap[mapName] || time < pbMap[mapName].time) {
            pbMap[mapName] = {
                time: time,
                mapName: mapName, // Store map name and time
                categoryId: categoryId, // Store category ID for other uses
                status: status, // Store status for other uses
                videoUrl: videoUrl
            };
        }
    });

    console.log("PB Map:", pbMap);

    // Now calculate the rating for each map based on the player's best time
    let totalRating = 0; // Initialize total rating

    for (const mapName in pbMap) {
        const bestTime = pbMap[mapName].time;
        const rating = calculateRunRating(bestTime, mapName); // Calculate rating based on best time
        pbMap[mapName].rating = rating; // Store the rating in the PB map

        // Log the individual rating for this map
        console.log(`Map: ${mapName}, Best Time: ${bestTime}s, Rating: ${rating}`);

        // Add this map's rating to the total
        totalRating += rating;
    }

    // Log the total rating
    console.log("Total Rating (sum of all map ratings):", totalRating);

    // Update the total rating in the profile stats card
    updateTotalRating(playerId, totalRating);
    savePlayerBestTimes(playerId, pbMap);

    // Fetch leaderboard positions for each map and update the PB table
    const leaderboardPromises = Object.keys(pbMap).map(mapName => {
        const categoryId = pbMap[mapName].categoryId;
        return fetchLeaderboardPlace(categoryId, pbMap[mapName].time).then(place => {
            pbMap[mapName].place = place; // Add place to PB map
        });
    });

    // Update the profile table after all leaderboard positions are fetched
    Promise.all(leaderboardPromises).then(() => {
        updateProfileTable(pbMap); // Pass updated PB data to the table
    });

    // Evaluate and display achievements
    const pbArray = Object.values(pbMap);
    evaluateAndDisplayAchievements(pbArray, totalRating);
}

// Fetch the leaderboard and return the player's rank/position directly from the 'place' field
async function fetchLeaderboardPlace(categoryId, playerTime) {
    const gameId = "268we996"; // Replace with your game's ID
    const url = `https://www.speedrun.com/api/v1/leaderboards/${gameId}/category/${categoryId}?var-2lg3kv7n=jq6mk7o1&var-ql619ok8=81pjwnn1`;

    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP status ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const leaderboard = data.data?.runs; // Ensure 'runs' array exists in the data
            if (!leaderboard || leaderboard.length === 0) {
                console.warn("No runs found on leaderboard");
                return null; // Return null if no leaderboard data is available
            }

            // Find the run that matches the player's time and return the place
            const playerRun = leaderboard.find(run => run.run?.times?.primary_t === playerTime);
            if (playerRun) {
                const place = playerRun.place; // Get the place directly from the run object
                return place; // Return the place value (e.g., 1, 2, 3, etc.)
            } else {
                console.warn("Player's run not found in leaderboard");
                return null; // Return null if the player's run is not found in the leaderboard
            }
        })
        .catch(error => {
            console.error("Error fetching leaderboard data:", error);
            return null; // If the leaderboard fetch fails, return null (no rank)
        });
}

// Define the chronological order of maps
const mapOrder = [
    "Cruxville Junior High",
    "Higgins Swimming Hall",
    "Higgins High School",
    "Burcksley High School",
    "Melbury High School",
    "Manic University",
    "Hibashi High School",
    "Nightmare High",
    "Community Swimming Hall"
];

// Update the table with the filtered PBs for each map
function updateProfileTable(pbMap) {
    const tableBody = document.querySelector("#best-times-table tbody");
    tableBody.innerHTML = "";  // Clear existing rows

    // Convert the pbMap object into an array of rows with the place, map data, and weight
    const rows = [];

    // Iterate through pbMap and create rows
    for (const map in pbMap) {
        const pbData = pbMap[map];
        const place = pbData.place || 'N/A'; // Get the place value or 'N/A' if not available
        const weight = calculateRunRating(pbData.time, map); // Calculate the weight based on the time

        rows.push({
            place: place,
            map: map,
            time: pbData.time,
            videoUrl: pbData.videoUrl,
            weight: weight // Add weight to the row data
        });
    }

    // Sort the rows by the defined map order
    rows.sort((a, b) => {
        return mapOrder.indexOf(a.map) - mapOrder.indexOf(b.map);
    });

    // If pbMap is empty, display a "No personal bests found" message
    if (rows.length === 0) {
        const noDataRow = document.createElement("tr");
        noDataRow.innerHTML = "<td colspan='5'>No personal bests found</td>"; // Adjust column span to 5 for the new weight column
        tableBody.appendChild(noDataRow);
    } else {
        // Create table rows and append them in the sorted order
        rows.forEach(rowData => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>#${rowData.place}</td> <!-- Place column is now first -->
                <td>${rowData.map}</td>
                <td>${formatTime(rowData.time)}</td>
                <td><a href="${rowData.videoUrl}" target="_blank">Watch</a></td>
                <td>${rowData.weight.toFixed(2)}</td> <!-- Display the weight of the run -->
            `;
            tableBody.appendChild(row);
        });
    }
}

// PLAYER STATISTICS CALCULATIONS

// Function to calculate league medals
async function calculateLeagueMedals(playerId) {
    // Get the data for both seasons
    const season1Query = query(season1Ref, orderBy('points', 'desc'));
    const season2Query = query(season2Ref, orderBy('points', 'desc'));

    // Fetch data for season 1
    const season1Snapshot = await getDocs(season1Query);
    const season1Data = season1Snapshot.docs.map(doc => doc.data());

    // Fetch data for season 2
    const season2Snapshot = await getDocs(season2Query);
    const season2Data = season2Snapshot.docs.map(doc => doc.data());

    // Combine the data from both seasons
    const allSeasonData = [...season1Data, ...season2Data];

    // Calculate the total points for all players across both seasons
    const totalPoints = allSeasonData.reduce((total, player) => total + player.points, 0);

    // Sort the players by points in descending order (leaderboard ranking)
    allSeasonData.sort((a, b) => b.points - a.points);

    // Find the player's data and rank based on the playerId (username)
    const playerData = allSeasonData.find(player => player.username === playerId);

    if (!playerData) {
        return 0; // No data found for the player
    }

    // Calculate the player's rank (1-based index)
    const playerRank = allSeasonData.indexOf(playerData) + 1;

    // Adjust scaling factor
    const scalingFactor = allSeasonData.length < 10 ? 1.5 : 100 / allSeasonData.length;

    // Exponential points with a lower base to prevent huge gaps
    const base = 1.05; // Adjust base to lower the growth rate
    const exponentialPoints = Math.pow(base, playerRank - 1); // Player rank starts from 1, so we subtract 1

    // Calculate the player's league medals, factoring in exponential points and the scaling factor
    const playerPercentage = playerData.points / totalPoints; // Player's percentage of total points
    const leagueMedals = playerPercentage * 100 * scalingFactor * exponentialPoints; // Exponentially scaled points

    // Return the final result, rounded to 2 decimal places
    return leagueMedals.toFixed(2); // Return as a float with 2 decimal places
}

// weight

// Map ranges with new constants for each map
const mapRanges = {
    "Cruxville Junior High": {
        bestTime: 90,  // Theoretical best time (TBT) in seconds
        weight: 1.34,   // Weight multiplier for this map
        decayRate: 0.06, // Decay rate (B) for exponential function
    },
    "Higgins Swimming Hall": {
        bestTime: 70,
        weight: 1.11,
        decayRate: 0.07,
    },
    "Higgins High School": {
        bestTime: 90,
        weight: 1.1,
        decayRate: 0.049,
    },
    "Burcksley High School": {
        bestTime: 120,
        weight: 1.1,
        decayRate: 0.035,
    },
    "Melbury High School": {
        bestTime: 70,
        weight: 1.25,
        decayRate: 0.057,
    },
    "Manic University": {
        bestTime: 85,
        weight: 1,
        decayRate: 0.04,
    },
    "Hibashi High School": {
        bestTime: 85,
        weight: 1,
        decayRate: 0.04,
    },
    "Nightmare High": {
        bestTime: 90,
        weight: 1,
        decayRate: 0.04,
    },
    "Community Swimming Hall": {
        bestTime: 58,
        weight: 1.1,
        decayRate: 0.06,
    },
};


// Function to calculate the weight for a given run
function calculateRunRating(playerTime, mapName) {
    const mapData = mapRanges[mapName];
    if (!mapData) {
        console.log(`No data for map: ${mapName}`);
        return 0;
    }

    const { bestTime, weight, decayRate } = mapData;

    if (typeof playerTime !== 'number' || playerTime <= 0) {
        console.log(`Invalid player time: ${playerTime}`);
        return 0;
    }

    // Calculate the time difference from the theoretical best time
    const timeDifference = playerTime - bestTime;

    // Apply the exponential decay function
    const decayFactor = Math.exp(-decayRate * Math.max(0, timeDifference)); // Ensure no negative decay
    const baseWeight = 1 + 2 * decayFactor; // Base weight with maximum bonus of 2

    console.log(`Map: ${mapName}, Player Time: ${playerTime}, Decay Factor: ${decayFactor}, Base Weight: ${baseWeight}`);

    // Apply the map-specific weight multiplier
    const finalRating = baseWeight * weight * 100; // Scaling by 100 for better readability
    console.log(`Map: ${mapName}, Final Rating: ${finalRating}`);

    return finalRating;
}

// Determine rank based on weight brackets
function getRank(totalRating) {
    if (totalRating < 300) {
        return 'Bronze';
    } else if (totalRating < 600) {
        return 'Silver';
    } else if (totalRating < 900) {
        return 'Gold';
    } else if (totalRating < 1300) {
        return 'Platinum';
    } else if (totalRating < 1700) {
        return 'Diamond';
    } else {
        return 'Legend';
    }
}

function updateTotalRating(playerId, totalRating) {
    const totalRatingContainer = document.getElementById('totalRating');
    const rankElement = document.getElementById('player-rank');
    
    if (totalRatingContainer) {
        totalRatingContainer.textContent = totalRating.toFixed(2); // Display the total rating rounded to 2 decimal places
    }

    savePlayerRating(playerId, totalRating);
    const rank = getRank(totalRating);

    if (rankElement) {
        rankElement.textContent = rank; // Update the rank text

        // Remove any existing rank classes
        rankElement.className = ''; 

        // Add the appropriate rank class
        switch (rank) {
            case 'Bronze':
                rankElement.classList.add('bronze-box');
                break;
            case 'Silver':
                rankElement.classList.add('silver-box');
                break;
            case 'Gold':
                rankElement.classList.add('gold-box');
                break;
            case 'Platinum':
                rankElement.classList.add ('platinum-box');
                break;
            case 'Diamond':
                rankElement.classList.add('diamond-box');
                break;
            case 'Legend':
                rankElement.classList.add('legend-box');
                break;
            default:
                rankElement.classList.add('default-box'); // Fallback for unranked or unknown
                break;
        }
    }
}

// database shit

// Assuming you have a db reference for Firestore
// const db = firebase.firestore();  // Reference to Firestore
function savePlayerBestTimes(playerId, pbMap) {
    const playerData = {
        bestTimes: {},
        timestamp: serverTimestamp(),
    };

    // Add best times to the playerData object
    for (const mapName in pbMap) {
        playerData.bestTimes[mapName] = {
            time: pbMap[mapName].time,
            mapName: pbMap[mapName].mapName,
        };
    }

    // Update Firestore document with best times
    setDoc(doc(db, 'players', playerId), playerData, { merge: true })
        .then(() => {
            console.log(`Best times saved for player: ${playerId}`);
        })
        .catch((error) => {
            console.error(`Error saving best times for ${playerId}: `, error);
        });
}

function savePlayerLeagueMedals(playerId, leagueMedals) {
    const playerData = {
        leagueMedals: leagueMedals,  // Assuming leagueMedals is an object or array
        timestamp: serverTimestamp(),
    };

    // Update Firestore document with league medals
    setDoc(doc(db, 'players', playerId), playerData, { merge: true })
        .then(() => {
            console.log(`League medals saved for player: ${playerId}`);
        })
        .catch((error) => {
            console.error(`Error saving league medals for ${playerId}: `, error);
        });
}

function savePlayerRating(playerId, totalRating) {
    const playerData = {
        rating: totalRating,  // Save the total rating
        timestamp: serverTimestamp(),
    };

    // Update Firestore document with player rating
    setDoc(doc(db, 'players', playerId), playerData, { merge: true })
        .then(() => {
            console.log(`Rating saved for player: ${playerId}`);
        })
        .catch((error) => {
            console.error(`Error saving rating for ${playerId}: `, error);
        });
}

// KEEP AT BOTTOM - EVENT LISTENERS
document.addEventListener('DOMContentLoaded', () => {
    updateLoginButton();
    listenForAuthStateChanges();

    // Top nav event listeners
    document.getElementById('home-btn').addEventListener('click', () => navigateTo('index'));
    document.getElementById('leaderboard-btn').addEventListener('click', () => navigateTo('leaderboard'));
    document.getElementById('myProfileButton').addEventListener('click', navigateToMyProfile);
    document.getElementById('league-btn').addEventListener('click', () => navigateTo('league'));
    document.getElementById('login-btn').addEventListener('click', () => navigateTo('login'));
    document.getElementById('logout-btn').addEventListener('click', logout);

    // Fetch player ID and load profile data
    const playerId = new URLSearchParams(window.location.search).get('playerId') || 'defaultPlayerId';
    fetchUserId(playerId);
    loadPlayerData(playerId);

    // Calculate and display the league medals for the player
    calculateLeagueMedals(playerId).then(medals => {
        // Find the League Medals <p> element and update it
        const leagueMedalsElement = document.querySelector('.stat-item:nth-child(3) p');
        if (leagueMedalsElement) {
            leagueMedalsElement.textContent = medals; // Update with the calculated value
            savePlayerLeagueMedals(playerId, parseFloat(medals));
        }
    });


    getRank(totalRating);
});