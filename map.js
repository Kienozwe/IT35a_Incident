// SECTION
function showSection(id) {
  // Hide
  document.querySelectorAll(".section").forEach(sec => {
    sec.classList.remove("active");
  });

  // Show
  document.getElementById(id).classList.add("active");
  
  // Initialize report map
  if (id === 'submit' && !reportMap) {
    setTimeout(() => {
      reportMap = new IncidentMap('mapContainer').init();
    }, 100);
  }
  // Initialize report view map 
  if (id === 'reports' && !reportViewMap) {
    setTimeout(() => {
      reportViewMap = new IncidentMap('mapViewContainer').init();
      displayReportsOnMap();
    }, 100);
  }
}

// MAP INIT
// Center (Manolo lat, long)
const CENTER = [8.36972, 124.86444];

// Initialize main Leaflet map
const map = L.map("map", {
  center: CENTER,
  zoom: 18,
  minZoom: 16,
  maxZoom: 30,
});
// OpenStreetMap tile layer
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Get user loc
function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        // Check if supported
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
        }
        // Get curent position
        navigator.geolocation.getCurrentPosition(
            position => {
                const coords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                resolve(coords);
            },
            error => reject(error)
        );
    });
}

async function getLocationName(lat, lng) {
    try {
        // Fetch address from geocoding API
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        const data = await response.json();
        // Return location name
        return data.address?.road || data.address?.neighbourhood || data.address?.town || data.address?.city || 'Unknown Location';
    } catch (error) {
        console.error('Geocoding error:', error);
        return 'Location Selected';
    }
}

// Handling "Use Current Location" button 
document.getElementById('getCurrentLocation').addEventListener('click', async function(e) {
    e.preventDefault();
    
    try {
        // Get user current position
        const coords = await getCurrentLocation();
        
        // Store lat, long in hidden
        document.getElementById('latitude').value = coords.lat;
        document.getElementById('longitude').value = coords.lng;
        
        // Convert coordinates to name and display
        const locationName = await getLocationName(coords.lat, coords.lng);
        document.getElementById('locationText').textContent = locationName;
        
    } catch (error) {
        alert('Error getting location: ' + error.message);
        console.error('Geolocation error:', error);
    }
});

// Store reference to submit form map 
let submitMap;
// Store reference to location marker on submit map
let submitMapMarker;

// Initialize interactive map for location selection sa form
function initializeSubmitMap() {
  // Prevent multi initialization
  if (submitMap) return;
  
  // Create map centered at default location
  submitMap = L.map('submitMap').setView(CENTER, 18);
  
  // Add tile layer
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(submitMap);
  
  // Add click event listener for loc. selection
  submitMap.on('click', async function(e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;
    
    // Remove previous marker 
    if (submitMapMarker) {
      submitMapMarker.remove();
    }
    
    // Place new marker at clicked loc
    submitMapMarker = L.marker([lat, lng]).addTo(submitMap);
    
    // Store coordinates in hidden
    document.getElementById('latitude').value = lat;
    document.getElementById('longitude').value = lng;
    
    // Get and display location name
    const locationName = await getLocationName(lat, lng);
    document.getElementById('locationText').textContent = locationName;
  });
}

// Handle nav between sections
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Remove active state from nav links
    document.querySelectorAll('.nav-link').forEach(l => {
      l.classList.remove('active');
    });
    // Add active state to clicked link
    link.classList.add('active');
    
    // Map navigation hash to section ID
    const hash = link.getAttribute('href').substring(1);
    const sectionMap = {
      'home': 'mapSection',
      'reports': 'reportsSection',
      'submit': 'submitSection'
    };
    
    const sectionId = sectionMap[hash];
    if (sectionId) {
      // Show target section
      showSection(sectionId);
      
      // Initialize submit map when submit section is activated
      if (sectionId === 'submitSection') {
        setTimeout(() => initializeSubmitMap(), 100);
      }
    }
  });
});

// Handle form submission(Temporary rani)
document.getElementById('submitForm').addEventListener('submit', function(e) {
  e.preventDefault();
  alert('Report Submitted');
  
  // Balik dyns home section 
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.remove('active');
  });
  document.querySelector('a[href="#home"]').classList.add('active');
  showSection('mapSection');
});

