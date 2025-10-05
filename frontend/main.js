// AirGuard - Main JavaScript File
// Handles all interactive functionality, animations, and data visualization

// Global variables
let particleSystem;
let currentLocation = { lat: 40.7128, lng: -74.0060 }; // Default to NYC
let airQualityData = {};
let dataRefreshInterval;

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeParticleBackground();
    initializeScrollAnimations();
    initializeTextAnimations();
    initializeAirQualityMap();
    initializeRealTimeUpdates();
    initializeInteractiveElements();
    startAutoRefresh();
});

// Particle background system using p5.js
function initializeParticleBackground() {
    new p5(function(p) {
        let particles = [];
        let numParticles = 50;
        
        p.setup = function() {
            let canvas = p.createCanvas(p.windowWidth, p.windowHeight);
            canvas.parent('particle-bg');
            
            // Create particles
            for (let i = 0; i < numParticles; i++) {
                particles.push({
                    x: p.random(p.width),
                    y: p.random(p.height),
                    vx: p.random(-0.5, 0.5),
                    vy: p.random(-0.5, 0.5),
                    size: p.random(2, 6),
                    opacity: p.random(0.1, 0.3),
                    color: p.random(['#87CEEB', '#98D8C8', '#F5F5DC'])
                });
            }
        };
        
        p.draw = function() {
            p.clear();
            
            // Update and draw particles
            particles.forEach(particle => {
                // Update position
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                // Wrap around edges
                if (particle.x < 0) particle.x = p.width;
                if (particle.x > p.width) particle.x = 0;
                if (particle.y < 0) particle.y = p.height;
                if (particle.y > p.height) particle.y = 0;
                
                // Draw particle
                p.fill(particle.color + Math.floor(particle.opacity * 255).toString(16));
                p.noStroke();
                p.ellipse(particle.x, particle.y, particle.size);
            });
        };
        
        p.windowResized = function() {
            p.resizeCanvas(p.windowWidth, p.windowHeight);
        };
    });
}

// Scroll-triggered animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, observerOptions);
    
    // Observe all scroll-reveal elements
    document.querySelectorAll('.scroll-reveal').forEach(el => {
        observer.observe(el);
    });
}

// Text animation initialization
function initializeTextAnimations() {
    // Initialize Splitting.js for text animations
    Splitting();
    
    // Animate hero title
    const heroTitle = document.querySelector('[data-splitting]');
    if (heroTitle) {
        anime({
            targets: heroTitle.querySelectorAll('.char'),
            translateY: [100, 0],
            opacity: [0, 1],
            easing: 'easeOutExpo',
            duration: 1200,
            delay: anime.stagger(50)
        });
    }
    
    // Initialize Typed.js for dynamic text
    const typedElement = document.getElementById('typed-text');
    if (typedElement) {
        new Typed('#typed-text', {
            strings: ['Real-time monitoring', 'Health protection', 'Data-driven insights'],
            typeSpeed: 50,
            backSpeed: 30,
            loop: true
        });
    }
}

// Air quality map initialization
function initializeAirQualityMap() {
    // Initialize the Leaflet map
    setTimeout(() => {
        const mapLoading = document.getElementById('map-loading');
        if (mapLoading) {
            mapLoading.style.display = 'none';
        }
        
        // Create interactive map visualization
        createAirQualityVisualization();
    }, 2000);
}

// Create air quality visualization with Leaflet map
let airQualityMap;
let cityMarkers = [];

function createAirQualityVisualization() {
    const mapElement = document.getElementById('air-quality-map');
    if (!mapElement) return;
    
    // Initialize Leaflet map centered on North America
    airQualityMap = L.map('air-quality-map').setView([40, -100], 4); // Center on North America with zoom level 4
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(airQualityMap);
    
    // Define North American cities with geographic coordinates and air quality data
    const cities = [
        { name: 'Vancouver', lat: 49.2827, lng: -123.1207, aqi: 35, pm25: 6.2, no2: 8.4, o3: 22.1 },
        { name: 'Seattle', lat: 47.6062, lng: -122.3321, aqi: 42, pm25: 7.8, no2: 11.2, o3: 25.6 },
        { name: 'San Francisco', lat: 37.7749, lng: -122.4194, aqi: 58, pm25: 12.4, no2: 15.7, o3: 31.2 },
        { name: 'Los Angeles', lat: 34.0522, lng: -118.2437, aqi: 85, pm25: 18.9, no2: 22.3, o3: 45.8 },
        { name: 'Denver', lat: 39.7392, lng: -104.9903, aqi: 48, pm25: 9.1, no2: 13.5, o3: 28.9 },
        { name: 'Chicago', lat: 41.8781, lng: -87.6298, aqi: 52, pm25: 10.7, no2: 16.8, o3: 26.4 },
        { name: 'New York', lat: 40.7128, lng: -74.0060, aqi: 68, pm25: 13.2, no2: 19.4, o3: 32.7 },
        { name: 'Atlanta', lat: 33.7490, lng: -84.3880, aqi: 62, pm25: 11.8, no2: 17.9, o3: 35.2 },
        { name: 'Houston', lat: 29.7604, lng: -95.3698, aqi: 78, pm25: 15.6, no2: 21.7, o3: 41.3 },
        { name: 'Phoenix', lat: 33.4484, lng: -112.0740, aqi: 72, pm25: 14.3, no2: 18.9, o3: 38.6 },
        { name: 'Toronto', lat: 43.6532, lng: -79.3832, aqi: 45, pm25: 8.9, no2: 14.2, o3: 24.8 },
        { name: 'Mexico City', lat: 19.4326, lng: -99.1332, aqi: 95, pm25: 21.4, no2: 28.7, o3: 52.1 },
        { name: 'Miami', lat: 25.7617, lng: -80.1918, aqi: 55, pm25: 10.2, no2: 14.8, o3: 29.7 },
        { name: 'Boston', lat: 42.3601, lng: -71.0589, aqi: 48, pm25: 8.7, no2: 12.4, o3: 27.3 },
        { name: 'Las Vegas', lat: 36.1699, lng: -115.1398, aqi: 76, pm25: 16.4, no2: 19.3, o3: 42.1 },
        { name: 'Montreal', lat: 45.5017, lng: -73.5673, aqi: 39, pm25: 7.5, no2: 10.8, o3: 23.9 }
    ];
    
    // Create markers for each city
    cities.forEach(city => {
        // Determine color based on AQI
        let color;
        if (city.aqi <= 50) color = '#87CEEB'; // Good - Blue
        else if (city.aqi <= 100) color = '#FFD700'; // Moderate - Yellow
        else color = '#FF6B6B'; // Unhealthy - Red
        
        // Create a custom SVG icon for the marker
        const svgIcon = L.divIcon({
            html: `
                <div class="relative">
                    <svg width="30" height="30" viewBox="0 0 30 30">
                        <circle cx="15" cy="15" r="12" fill="${color}" opacity="0.85" stroke="#ffffff" stroke-width="2" class="region-circle" data-city="${city.name}"/>
                        <text x="15" y="19" text-anchor="middle" fill="#ffffff" font-size="10" font-weight="bold">${city.aqi}</text>
                    </svg>
                    <div class="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700 whitespace-nowrap" style="font-size: 9px;">
                        ${city.name}
                    </div>
                </div>
            `,
            className: '',
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -15]
        });
        
        // Create marker with custom icon
        const marker = L.marker([city.lat, city.lng], { icon: svgIcon }).addTo(airQualityMap);
        
        // Store city data in marker for access during click
        marker.cityData = city;
        
        // Add click event to marker
        marker.on('click', function(e) {
            showCityPopup(this.cityData, e);
        });
        
        // Store marker for later updates
        cityMarkers.push({
            marker: marker,
            city: city
        });
    });
}

// Show city popup with detailed information
function showCityPopup(city, event) {
    const popup = document.getElementById('popup-card');
    
    // Position the popup in a visible area of the map
    // Get the map element and position the popup in the top-left area of the map container
    const mapRect = document.getElementById('air-quality-map').getBoundingClientRect();
    
    // Position popup in the top-left area of the map, with some margin
    popup.style.left = '20px';
    popup.style.top = '20px';
    
    // Update popup content
    document.getElementById('popup-title').textContent = city.name;
    document.getElementById('popup-aqi').textContent = city.aqi;
    document.getElementById('popup-pm25').textContent = city.pm25 + ' μg/m³';
    document.getElementById('popup-no2').textContent = city.no2 + ' ppb';
    document.getElementById('popup-o3').textContent = city.o3 + ' ppb';
    document.getElementById('popup-time').textContent = new Date().toLocaleTimeString();
    
    // Show popup
    popup.classList.add('active');
    
    // Close popup when clicking outside
    setTimeout(() => {
        document.addEventListener('click', closePopupOnClickOutside);
    }, 100);
}

// Close popup when clicking outside
function closePopupOnClickOutside(event) {
    const popup = document.getElementById('popup-card');
    if (!popup.contains(event.target) && !event.target.classList.contains('region-circle')) {
        popup.classList.remove('active');
        document.removeEventListener('click', closePopupOnClickOutside);
    }
}

// Close popup
function closePopup() {
    const popup = document.getElementById('popup-card');
    popup.classList.remove('active');
    document.removeEventListener('click', closePopupOnClickOutside);
}

// Real-time data updates
function initializeRealTimeUpdates() {
    // Initial data load
    updateAirQualityData();
}

// Start auto-refresh every 30 seconds
function startAutoRefresh() {
    dataRefreshInterval = setInterval(() => {
        updateAirQualityData();
        updateMapData();
    }, 30000);
}

// Update air quality data
function updateAirQualityData() {
    // Simulate data from different sources
    const mockData = {
        aqi: Math.floor(Math.random() * 150) + 20,
        pm25: (Math.random() * 35 + 5).toFixed(1),
        no2: (Math.random() * 40 + 10).toFixed(1),
        o3: (Math.random() * 60 + 20).toFixed(1)
    };
    
    // Update values with smooth animations
    animateValue('aqi-value', parseInt(document.getElementById('aqi-value').textContent), mockData.aqi, 1000);
    animateValue('pm25-value', parseFloat(document.getElementById('pm25-value').textContent), parseFloat(mockData.pm25), 1000);
    animateValue('no2-value', parseFloat(document.getElementById('no2-value').textContent), parseFloat(mockData.no2), 1000);
    animateValue('o3-value', parseFloat(document.getElementById('o3-value').textContent), parseFloat(mockData.o3), 1000);
    
    // Update AQI color based on value
    updateAQIColor(mockData.aqi);
    
    airQualityData = mockData;
}

// Update map data
function updateMapData() {
    if (!cityMarkers || cityMarkers.length === 0) return;
    
    // Update each city marker with new random data
    cityMarkers.forEach(item => {
        const newAqi = Math.floor(Math.random() * 120) + 20;
        
        // Update city data
        item.city.aqi = newAqi;
        item.city.pm25 = (Math.random() * 30 + 5).toFixed(1);
        item.city.no2 = (Math.random() * 30 + 5).toFixed(1);
        item.city.o3 = (Math.random() * 50 + 15).toFixed(1);
        
        // Determine new color based on updated AQI
        let color;
        if (newAqi <= 50) color = '#87CEEB'; // Good - Blue
        else if (newAqi <= 100) color = '#FFD700'; // Moderate - Yellow
        else color = '#FF6B6B'; // Unhealthy - Red
        
        // Update the marker icon with new color and AQI value
        const svgIcon = L.divIcon({
            html: `
                <div class="relative">
                    <svg width="30" height="30" viewBox="0 0 30 30">
                        <circle cx="15" cy="15" r="12" fill="${color}" opacity="0.85" stroke="#ffffff" stroke-width="2" class="region-circle" data-city="${item.city.name}"/>
                        <text x="15" y="19" text-anchor="middle" fill="#ffffff" font-size="10" font-weight="bold">${newAqi}</text>
                    </svg>
                    <div class="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700 whitespace-nowrap" style="font-size: 9px;">
                        ${item.city.name}
                    </div>
                </div>
            `,
            className: '',
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -15]
        });
        
        // Update the marker with the new icon
        item.marker.setIcon(svgIcon);
    });
}

// Animate value changes
function animateValue(elementId, start, end, duration) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const startTime = performance.now();
    
    function updateValue(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = start + (end - start) * easeOutQuart;
        
        element.textContent = elementId === 'aqi-value' ? Math.floor(current) : current.toFixed(1);
        
        if (progress < 1) {
            requestAnimationFrame(updateValue);
        }
    }
    
    requestAnimationFrame(updateValue);
}

// Update AQI color based on value
function updateAQIColor(aqi) {
    const aqiElement = document.getElementById('aqi-value');
    const aqiCard = aqiElement.closest('.metric-card');
    
    let color, status;
    
    if (aqi <= 50) {
        color = '#10B981'; // Green
        status = 'Good';
    } else if (aqi <= 100) {
        color = '#F59E0B'; // Yellow
        status = 'Moderate';
    } else {
        color = '#EF4444'; // Red
        status = 'Unhealthy';
    }
    
    aqiElement.style.color = color;
    aqiCard.querySelector('.text-sm').textContent = status;
    
    // Update progress bar
    const progressBar = aqiCard.querySelector('.bg-green-400');
    if (progressBar) {
        progressBar.style.width = `${Math.min(aqi / 2, 100)}%`;
        progressBar.style.backgroundColor = color;
    }
}

// Interactive elements initialization
function initializeInteractiveElements() {
    // Pollutant selector - instant update
    const pollutantSelect = document.getElementById('pollutant-select');
    if (pollutantSelect) {
        pollutantSelect.addEventListener('change', function() {
            updateMapVisualization(this.value);
            updateCurrentValues(this.value);
        });
    }
    
    // Location button
    const locateBtn = document.getElementById('locate-btn');
    if (locateBtn) {
        locateBtn.addEventListener('click', function() {
            getCurrentLocation();
        });
    }
    
    // Close popup functionality
    const closePopupBtn = document.getElementById('close-popup');
    if (closePopupBtn) {
        closePopupBtn.addEventListener('click', closePopup);
    }
    
    // Navigation smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Update map visualization based on pollutant selection
function updateMapVisualization(pollutant) {
    showNotification(`Switched to ${pollutant.toUpperCase()} visualization`, 'success');
    
    if (!cityMarkers || cityMarkers.length === 0) return;
    
    // Update each city marker based on the selected pollutant
    cityMarkers.forEach(item => {
        let newValue;
        
        // Generate a value based on the selected pollutant
        if (pollutant === 'aqi') {
            newValue = Math.floor(Math.random() * 120) + 20;
        } else if (pollutant === 'pm25') {
            newValue = Math.floor(Math.random() * 40) + 5; // PM2.5 range
        } else if (pollutant === 'no2') {
            newValue = Math.floor(Math.random() * 50) + 5; // NO2 range
        } else if (pollutant === 'o3') {
            newValue = Math.floor(Math.random() * 60) + 10; // O3 range
        }
        
        // Update the city data with the new value for the selected pollutant
        if (pollutant === 'aqi') {
            item.city.aqi = newValue;
        } else if (pollutant === 'pm25') {
            item.city.pm25 = newValue.toFixed(1);
        } else if (pollutant === 'no2') {
            item.city.no2 = newValue.toFixed(1);
        } else if (pollutant === 'o3') {
            item.city.o3 = newValue.toFixed(1);
        }
        
        // Update color based on the pollutant value
        let color;
        if (newValue <= 50) color = '#87CEEB'; // Good - Blue
        else if (newValue <= 100) color = '#FFD700'; // Moderate - Yellow
        else color = '#FF6B6B'; // Unhealthy - Red
        
        // Update the marker icon with new color and value
        const svgIcon = L.divIcon({
            html: `
                <div class="relative">
                    <svg width="30" height="30" viewBox="0 0 30 30">
                        <circle cx="15" cy="15" r="12" fill="${color}" opacity="0.85" stroke="#ffffff" stroke-width="2" class="region-circle" data-city="${item.city.name}"/>
                        <text x="15" y="19" text-anchor="middle" fill="#ffffff" font-size="10" font-weight="bold">${Math.min(newValue, 999)}</text>
                    </svg>
                    <div class="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700 whitespace-nowrap" style="font-size: 9px;">
                        ${item.city.name}
                    </div>
                </div>
            `,
            className: '',
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -15]
        });
        
        // Update the marker with the new icon
        item.marker.setIcon(svgIcon);
    });
}

// Update current values based on pollutant selection
function updateCurrentValues(pollutant) {
    const pollutantData = {
        aqi: Math.floor(Math.random() * 150) + 20,
        pm25: (Math.random() * 35 + 5).toFixed(1),
        no2: (Math.random() * 40 + 10).toFixed(1),
        o3: (Math.random() * 60 + 20).toFixed(1)
    };
    
    if (pollutant === 'pm25') {
        animateValue('pm25-value', parseFloat(document.getElementById('pm25-value').textContent), parseFloat(pollutantData.pm25), 1000);
    } else if (pollutant === 'no2') {
        animateValue('no2-value', parseFloat(document.getElementById('no2-value').textContent), parseFloat(pollutantData.no2), 1000);
    } else if (pollutant === 'o3') {
        animateValue('o3-value', parseFloat(document.getElementById('o3-value').textContent), parseFloat(pollutantData.o3), 1000);
    }
}

// Get current location
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                currentLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                showNotification('Location updated successfully!', 'success');
            },
            function(error) {
                showNotification('Unable to get location. Using default location.', 'warning');
            }
        );
    } else {
        showNotification('Geolocation not supported. Using default location.', 'warning');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white transform translate-x-full transition-transform duration-300`;
    
    // Set color based on type
    switch (type) {
        case 'success':
            notification.classList.add('bg-green-500');
            break;
        case 'warning':
            notification.classList.add('bg-yellow-500');
            break;
        case 'error':
            notification.classList.add('bg-red-500');
            break;
        default:
            notification.classList.add('bg-blue-500');
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Smooth scroll to section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Utility function for health recommendations
function getHealthRecommendation(aqi) {
    if (aqi <= 50) {
        return {
            level: 'Good',
            color: 'text-green-600',
            activities: 'All outdoor activities are safe',
            sensitive: 'No restrictions for sensitive groups'
        };
    } else if (aqi <= 100) {
        return {
            level: 'Moderate',
            color: 'text-yellow-600',
            activities: 'Most activities are safe',
            sensitive: 'Sensitive individuals should limit prolonged outdoor exertion'
        };
    } else {
        return {
            level: 'Unhealthy',
            color: 'text-red-600',
            activities: 'Limit outdoor activities',
            sensitive: 'Sensitive groups should avoid outdoor activities'
        };
    }
}

// Export functions for use in other pages
window.AirGuard = {
    showNotification,
    animateValue,
    getHealthRecommendation,
    scrollToSection,
    updateAQIColor
};