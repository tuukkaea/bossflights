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
        updatePlayerData(data.players[0])
    });
}

function updatePlayerData(player){
    const playerName = document.getElementById('player-name');
    playerName.textContent = player.name
    const batteryLevel = document.getElementById('player-battery');
    batteryLevel.textContent = player.battery_level + '%'
    const playerDifficulty = document.getElementById('difficulty');
    playerDifficulty.textContent = player.difficulty_level
}


    



initializeGame();
