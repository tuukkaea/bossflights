import { calculateDistance, calculateBearing, getCompassDirection } from './utils.js';

let map;

async function fetchDatabase() {
    try {
        let response = await fetch('database.json');
        if (!response.ok) {
            throw new Error('Network err ' + response.statusText);
        }
        let data = await response.json();
        return data;
    } catch (error) {
        console.error('error:', error);
    }
}


function renderAirportsOnMap(airports) {
    airports.forEach(airport => {
        L.marker([airport.latitude_deg, airport.longitude_deg])
            .addTo(map)
            .bindPopup(`<b>${airport.name}`);
    });
}


function initializeMap() {
    map = L.map('map').setView([20, 0], 2); // center world
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}


function initializeGame() {
    initializeMap();

    fetchDatabase().then(data => {
        console.log('db:', data);
        renderAirportsOnMap(data.airports);
        updatePlayerData(data.players[0], data.airports, data.players_airports); 
    });
}

function updatePlayerData(player, airports, playersAirports){
    const playerName = document.getElementById('player-name');
    playerName.textContent = player.name

    const batteryLevel = document.getElementById('player-battery');
    batteryLevel.textContent = player.battery_level + '%'

    const playerDifficulty = document.getElementById('difficulty');
    playerDifficulty.textContent = player.difficulty_level

    const playerLocation = document.getElementById('current-location');
    const currentAirport = airports.find(airport => airport.id === player.current_location);
 
    playerLocation.textContent = currentAirport.name

    const destinationsVisited = document.getElementById('destinations-visited');
    const visitedCount = playersAirports.filter(pa => pa.player_id === player.id && pa.visited_at !== null).length;
    destinationsVisited.textContent = visitedCount 


    const distanceToBoss = document.getElementById('distance');
    const bossAirportData = playersAirports.find(pa => pa.player_id === player.id && pa.is_boss_airport === true);
    

    if (bossAirportData && currentAirport) {
        const bossAirport = airports.find(a => a.ident === bossAirportData.airport_ident);
        if (bossAirport) {
            const distance = calculateDistance(
                currentAirport.latitude_deg, 
                currentAirport.longitude_deg,
                bossAirport.latitude_deg,
                bossAirport.longitude_deg
            );
            distanceToBoss.textContent = Math.round(distance) + ' km';
            
            const directionElement = document.getElementById('direction');
            const bearing = calculateBearing(
                currentAirport.latitude_deg,
                currentAirport.longitude_deg,
                bossAirport.latitude_deg,
                bossAirport.longitude_deg
            );
            const compassDirection = getCompassDirection(bearing);
            directionElement.textContent = compassDirection;
            
            const compassArrow = document.getElementById('compass-arrow');
            if (compassArrow) {

                const adjustedRotation = bearing - 90;
                compassArrow.style.transform = `rotate(${adjustedRotation}deg)`;
            }
        }
    } 
}

initializeGame();