// main.js for Tour Vista
// This script loads data from CSV files and initializes visualizations

// Import the data service module to handle CSV loading
import * as DataService from './dataservice.js';
import * as Charts from './charts.js';

// DOM elements
let loadingIndicator;
let errorContainer;
let dashboardContainer;

// Data objects to store loaded CSV data
let dataStore = {
    airPassengersCarried: null,
    airPassengersPerFatality: null,
    aviationFatalitiesPerMillionPassengers: null,
    fatalAirlinerAccidentsPerMillionFlights: null,
    internationalTouristArrivalsByWorldRegion: null,
    internationalTouristArrivals: null,
    internationalTouristDeparturesPer1000: null
};

// Initialize the application
document.addEventListener('DOMContentLoaded', initialize);

function initialize() {
    console.log('Tour Vista application initializing...');
    
    // Set up DOM references
    setupDOMReferences();
    
    // Show loading indicator
    showLoading(true);
    
    // Load all CSV data
    loadAllData()
        .then(() => {
            // Hide loading indicator when data is loaded
            showLoading(false);
            
            // Initialize visualizations
            initializeVisualizations();
        })
        .catch(error => {
            // Handle errors
            showLoading(false);
            showError(`Failed to load data: ${error.message}`);
            console.error('Error loading data:', error);
        });
        
    // Set up event listeners
    setupEventListeners();
}

function setupDOMReferences() {
    loadingIndicator = document.getElementById('loading-indicator');
    errorContainer = document.getElementById('error-container');
    dashboardContainer = document.getElementById('dashboard-container');
    
    // Create elements if they don't exist
    if (!loadingIndicator) {
        loadingIndicator = document.createElement('div');
        loadingIndicator.id = 'loading-indicator';
        loadingIndicator.innerHTML = '<span>Loading data...</span>';
        document.body.appendChild(loadingIndicator);
    }
    
    if (!errorContainer) {
        errorContainer = document.createElement('div');
        errorContainer.id = 'error-container';
        errorContainer.classList.add('hidden');
        document.body.appendChild(errorContainer);
    }
    
    if (!dashboardContainer) {
        dashboardContainer = document.createElement('div');
        dashboardContainer.id = 'dashboard-container';
        document.body.appendChild(dashboardContainer);
    }
}

async function loadAllData() {
    try {
        // Load all CSV files in parallel
        const [
            airPassengersCarried,
            airPassengersPerFatality,
            aviationFatalitiesPerMillionPassengers,
            fatalAirlinerAccidentsPerMillionFlights,
            internationalTouristArrivalsByWorldRegion,
            internationalTouristArrivals,
            internationalTouristDeparturesPer1000
        ] = await Promise.all([
            DataService.loadCSV('./data/air-passengers-carried.csv'),
            DataService.loadCSV('./data/air-passengers-per-fatality.csv'),
            DataService.loadCSV('./data/aviation-fatalities-per-million-passengers.csv'),
            DataService.loadCSV('./data/fatal-airliner-accidents-per-million-flights.csv'),
            DataService.loadCSV('./data/international-tourist-arrivals-by-world-region.csv'),
            DataService.loadCSV('./data/international-tourist-arrivals.csv'),
            DataService.loadCSV('./data/international-tourist-departures-per-1000.csv')
        ]);
        
        // Store the loaded data
        dataStore.airPassengersCarried = airPassengersCarried;
        dataStore.airPassengersPerFatality = airPassengersPerFatality;
        dataStore.aviationFatalitiesPerMillionPassengers = aviationFatalitiesPerMillionPassengers;
        dataStore.fatalAirlinerAccidentsPerMillionFlights = fatalAirlinerAccidentsPerMillionFlights;
        dataStore.internationalTouristArrivalsByWorldRegion = internationalTouristArrivalsByWorldRegion;
        dataStore.internationalTouristArrivals = internationalTouristArrivals;
        dataStore.internationalTouristDeparturesPer1000 = internationalTouristDeparturesPer1000;
        
        console.log('All data loaded successfully:', dataStore);
        
    } catch (error) {
        console.error('Error loading CSV data:', error);
        throw error;
    }
}

function initializeVisualizations() {
    console.log('Initializing visualizations...');
    
    // Clear the dashboard container
    dashboardContainer.innerHTML = '';
    
    // Create sections for different visualization categories
    const tourismSection = createSection('tourism-section', 'Tourism Statistics');
    const aviationSection = createSection('aviation-section', 'Aviation Safety & Statistics');
    
    // Add sections to the dashboard
    dashboardContainer.appendChild(tourismSection);
    dashboardContainer.appendChild(aviationSection);
    
    // Tourism visualizations
    createTourismVisualizations(tourismSection);
    
    // Aviation visualizations
    createAviationVisualizations(aviationSection);
}

function createSection(id, title) {
    const section = document.createElement('section');
    section.id = id;
    section.classList.add('dashboard-section');
    
    const heading = document.createElement('h2');
    heading.textContent = title;
    section.appendChild(heading);
    
    const chartsContainer = document.createElement('div');
    chartsContainer.classList.add('charts-container');
    section.appendChild(chartsContainer);
    
    return section;
}

function createTourismVisualizations(section) {
    const chartsContainer = section.querySelector('.charts-container');
    
    // Create chart containers
    const touristArrivalsChart = createChartContainer('tourist-arrivals-chart', 'International Tourist Arrivals');
    const touristArrivalsByRegionChart = createChartContainer('tourist-arrivals-by-region-chart', 'Tourist Arrivals by Region');
    const touristDeparturesChart = createChartContainer('tourist-departures-chart', 'International Tourist Departures per 1000 Residents');
    
    // Add chart containers to the section
    chartsContainer.appendChild(touristArrivalsChart);
    chartsContainer.appendChild(touristArrivalsByRegionChart);
    chartsContainer.appendChild(touristDeparturesChart);
    
    // Initialize the charts
    Charts.createTouristArrivalsChart('tourist-arrivals-chart', dataStore.internationalTouristArrivals);
    Charts.createTouristArrivalsByRegionChart('tourist-arrivals-by-region-chart', dataStore.internationalTouristArrivalsByWorldRegion);
    Charts.createTouristDeparturesChart('tourist-departures-chart', dataStore.internationalTouristDeparturesPer1000);
}

function createAviationVisualizations(section) {
    const chartsContainer = section.querySelector('.charts-container');
    
    // Create chart containers
    const airPassengersChart = createChartContainer('air-passengers-chart', 'Air Passengers Carried');
    const aviationSafetyChart = createChartContainer('aviation-safety-chart', 'Aviation Safety Metrics');
    const accidentsChart = createChartContainer('accidents-chart', 'Fatal Airliner Accidents');
    
    // Add chart containers to the section
    chartsContainer.appendChild(airPassengersChart);
    chartsContainer.appendChild(aviationSafetyChart);
    chartsContainer.appendChild(accidentsChart);
    
    // Initialize the charts
    Charts.createAirPassengersChart('air-passengers-chart', dataStore.airPassengersCarried);
    Charts.createAviationSafetyChart('aviation-safety-chart', [
        dataStore.airPassengersPerFatality,
        dataStore.aviationFatalitiesPerMillionPassengers
    ]);
    Charts.createAccidentsChart('accidents-chart', dataStore.fatalAirlinerAccidentsPerMillionFlights);
}

function createChartContainer(id, title) {
    const container = document.createElement('div');
    container.classList.add('chart-container');
    
    const chartTitle = document.createElement('h3');
    chartTitle.textContent = title;
    
    const chartDiv = document.createElement('div');
    chartDiv.id = id;
    chartDiv.classList.add('chart');
    
    container.appendChild(chartTitle);
    container.appendChild(chartDiv);
    
    return container;
}

function setupEventListeners() {
    // Add responsive design handling
    window.addEventListener('resize', debounce(function() {
        // Reinitialize charts on window resize
        initializeVisualizations();
    }, 250));
    
    // Add filters or other interactive elements if needed
    const filterContainer = document.createElement('div');
    filterContainer.id = 'filters-container';
    filterContainer.classList.add('filters-container');
    
    // Insert filters container before dashboard
    document.body.insertBefore(filterContainer, dashboardContainer);
    
    // Add year range selector, region filters, etc.
    setupFilters(filterContainer);
}

function setupFilters(container) {
    // This could be expanded based on your needs
    const yearRangeFilter = document.createElement('div');
    yearRangeFilter.classList.add('filter');
    yearRangeFilter.innerHTML = `
        <label for="year-range">Year Range:</label>
        <select id="year-range">
            <option value="all">All Years</option>
            <option value="recent">Last 10 Years</option>
            <option value="custom">Custom Range</option>
        </select>
    `;
    
    const regionFilter = document.createElement('div');
    regionFilter.classList.add('filter');
    regionFilter.innerHTML = `
        <label for="region-filter">Region:</label>
        <select id="region-filter">
            <option value="all">All Regions</option>
            <option value="europe">Europe</option>
            <option value="asia">Asia</option>
            <option value="americas">Americas</option>
            <option value="africa">Africa</option>
            <option value="oceania">Oceania</option>
        </select>
    `;
    
    container.appendChild(yearRangeFilter);
    container.appendChild(regionFilter);
    
    // Add event listeners for the filters
    document.getElementById('year-range').addEventListener('change', filterData);
    document.getElementById('region-filter').addEventListener('change', filterData);
}

function filterData() {
    // Get filter values
    const yearRange = document.getElementById('year-range').value;
    const region = document.getElementById('region-filter').value;
    
    console.log('Filtering data by:', { yearRange, region });
    
    // This would typically filter the data and redraw charts
    // For now, just re-initialize visualizations
    initializeVisualizations();
}

function showLoading(isLoading) {
    if (isLoading) {
        loadingIndicator.classList.remove('hidden');
    } else {
        loadingIndicator.classList.add('hidden');
    }
}

function showError(message) {
    errorContainer.textContent = message;
    errorContainer.classList.remove('hidden');
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// Export any functions or variables that need to be accessible from other modules
export {
    dataStore,
    initialize,
    filterData
};
