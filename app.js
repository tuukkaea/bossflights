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
        updatePlayerData(data.players[0], data.airports, data.players_airports)
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
    const currentAirport = airports.find(airport=>airport.id === player.current_location);
    playerLocation.textContent = currentAirport.name

    const destinationsVisited = document.getElementById('destinations-visited');
    const visitedCount = playersAirports.filter(pa=>pa.player_id === player.id && pa.visited_at !== null).length;
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
        directionElement.textContent = compassDirection
        }

    }
    

}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
}

function calculateBearing(lat1, lon1, lat2, lon2) {
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180);
    const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
              Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon);

    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    bearing = (bearing + 360) % 360; 

    return bearing;
}

function getCompassDirection(bearing) {
    const directions = [
        { name: 'N', min: 0, max: 22.5 },
        { name: 'NE', min: 22.5, max: 67.5 },
        { name: 'E', min: 67.5, max: 112.5 },
        { name: 'SE', min: 112.5, max: 157.5 },
        { name: 'S', min: 157.5, max: 202.5 },
        { name: 'SW', min: 202.5, max: 247.5 },
        { name: 'W', min: 247.5, max: 292.5 },
        { name: 'NW', min: 292.5, max: 337.5 },
        { name: 'N', min: 337.5, max: 360 }
    ];

    for (let dir of directions) {
        if (bearing >= dir.min && bearing < dir.max) {
            return dir.name;
        }
    }
    return 'N';
}

    



initializeGame();
