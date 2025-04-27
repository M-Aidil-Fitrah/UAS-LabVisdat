/**
 * Data Service for loading and processing tourism data
 */
class TourismDataService {
    constructor() {
        this.datasets = {
            arrivals: null,
            departures: null,
            airPassengers: null,
            airSafety: null,
            fatalAccidents: null,
            aviationFatalities: null,
            regionalArrivals: null
        };
        this.countries = [];
        this.regions = [];
        this.isLoading = true;
    }

    /**
     * Load all datasets
     * @returns {Promise} Promise that resolves when all data is loaded
     */
    async loadAllData() {
        try {
            const [
                arrivals,
                departures,
                airPassengers,
                regionalArrivals,
                fatalAccidents,
                aviationFatalities
            ] = await Promise.all([
                d3.csv('data/international-tourist-arrivals.csv'),
                d3.csv('data/international-tourist-departures-per-1000.csv'),
                d3.csv('data/air-passengers-carried.csv'),
                d3.csv('data/international-tourist-arrivals-by-world-region.csv'),
                d3.csv('data/fatal-airliner-accidents-per-million-flights.csv'),
                d3.csv('data/aviation-fatalities-per-million-passengers.csv')
            ]);

            // Process data
            this.datasets.arrivals = this.processArrivalsData(arrivals);
            this.datasets.departures = this.processDeparturesData(departures);
            this.datasets.airPassengers = this.processAirPassengersData(airPassengers);
            this.datasets.regionalArrivals = this.processRegionalArrivalsData(regionalArrivals);
            this.datasets.fatalAccidents = this.processFatalAccidentsData(fatalAccidents);
            this.datasets.aviationFatalities = this.processAviationFatalitiesData(aviationFatalities);

            // Extract unique countries and regions
            this.extractCountriesAndRegions();

            // Set loading to false when done
            this.isLoading = false;
            return true;
        } catch (error) {
            console.error('Error loading data:', error);
            this.isLoading = false;
            return false;
        }
    }

    /**
     * Process international tourist arrivals data
     */
    processArrivalsData(data) {
        return data.map(d => ({
            entity: d.Entity,
            code: d.Code,
            year: +d.Year,
            arrivals: +d['International tourism, number of arrivals'] || 0
        })).filter(d => !isNaN(d.arrivals) && d.arrivals > 0);
    }

    /**
     * Process tourist departures per 1000 people data
     */
    processDeparturesData(data) {
        return data.map(d => ({
            entity: d.Entity,
            code: d.Code,
            year: +d.Year,
            departuresPerThousand: +d['Number of departures (per 1000 people)'] || 0
        })).filter(d => !isNaN(d.departuresPerThousand) && d.departuresPerThousand > 0);
    }

    /**
     * Process air passengers carried data
     */
    processAirPassengersData(data) {
        return data.map(d => ({
            entity: d.Entity,
            code: d.Code,
            year: +d.Year,
            passengers: +d['Air transport, passengers carried'] || 0
        })).filter(d => !isNaN(d.passengers) && d.passengers > 0);
    }

    /**
     * Process regional tourist arrivals data
     */
    processRegionalArrivalsData(data) {
        return data.map(d => ({
            region: d.Entity,
            year: +d.Year,
            arrivals: +d['International Tourist Arrivals'] || 0
        })).filter(d => !isNaN(d.arrivals) && d.arrivals > 0);
    }

    /**
     * Process fatal aviation accidents data
     */
    processFatalAccidentsData(data) {
        return data.map(d => ({
            entity: d.Entity,
            code: d.Code,
            year: +d.Year,
            accidentsPerMillion: +d['Fatal accidents per million commercial flights'] || 0
        })).filter(d => !isNaN(d.accidentsPerMillion));
    }

    /**
     * Process aviation fatalities data
     */
    processAviationFatalitiesData(data) {
        return data.map(d => ({
            entity: d.Entity,
            code: d.Code,
            year: +d.Year,
            fatalitiesPerMillion: +d['Fatalities per million passengers'] || 0
        })).filter(d => !isNaN(d.fatalitiesPerMillion));
    }

    /**
     * Extract unique countries and regions from the data
     */
    extractCountriesAndRegions() {
        // Extract countries from arrivals dataset
        this.countries = [...new Set(this.datasets.arrivals.map(d => d.entity))].sort();
        
        // Extract regions from regional arrivals dataset
        this.regions = [...new Set(this.datasets.regionalArrivals.map(d => d.region))].sort();
    }

    /**
     * Filter data based on selected filters
     */
    filterData(dataset, options = {}) {
        const { 
            yearStart = 1950, 
            yearEnd = 2020, 
            country = 'all', 
            region = 'all' 
        } = options;
        
        let filteredData = dataset;
        
        // Filter by year range
        filteredData = filteredData.filter(d => d.year >= yearStart && d.year <= yearEnd);
        
        // Filter by country if applicable and if the dataset has an entity field
        if (country !== 'all' && filteredData[0]?.entity) {
            filteredData = filteredData.filter(d => d.entity === country);
        }
        
        // Filter by region if applicable and if the dataset has a region field
        if (region !== 'all') {
            // Handle direct region filter for regional data
            if (filteredData[0]?.region) {
                filteredData = filteredData.filter(d => d.region === region);
            }
            // For future: If we had a mapping of countries to regions, we could filter country data by region
        }
        
        return filteredData;
    }

    /**
     * Get top countries by arrivals for a specific year
     */
    getTopCountriesByArrivals(year = 2019, limit = 10) {
        const yearData = this.datasets.arrivals.filter(d => d.year === year);
        return yearData
            .sort((a, b) => b.arrivals - a.arrivals)
            .slice(0, limit);
    }

    /**
     * Get tourism data aggregated by year for a specific country
     */
    getCountryTrendData(country) {
        const arrivals = this.datasets.arrivals.filter(d => d.entity === country);
        const departures = this.datasets.departures.filter(d => d.entity === country);
        
        // Combine data where both metrics exist
        const years = [...new Set([...arrivals.map(d => d.year), ...departures.map(d => d.year)])].sort();
        
        return years.map(year => {
            const arrivalData = arrivals.find(d => d.year === year);
            const departureData = departures.find(d => d.year === year);
            
            return {
                year,
                entity: country,
                arrivals: arrivalData ? arrivalData.arrivals : null,
                departuresPerThousand: departureData ? departureData.departuresPerThousand : null
            };
        });
    }

    /**
     * Get global safety trends over time
     */
    getGlobalSafetyTrends() {
        // Combine fatal accidents and fatalities per passenger data
        const years = [...new Set([
            ...this.datasets.fatalAccidents.map(d => d.year),
            ...this.datasets.aviationFatalities.map(d => d.year)
        ])].sort();
        
        return years.map(year => {
            const accidentData = this.datasets.fatalAccidents.find(d => d.year === year && d.entity === 'World');
            const fatalityData = this.datasets.aviationFatalities.find(d => d.year === year && d.entity === 'World');
            
            return {
                year,
                accidentsPerMillion: accidentData ? accidentData.accidentsPerMillion : null,
                fatalitiesPerMillion: fatalityData ? fatalityData.fatalitiesPerMillion : null
            };
        }).filter(d => d.accidentsPerMillion !== null || d.fatalitiesPerMillion !== null);
    }
}

// Create and export a single instance of the data service
const dataService = new TourismDataService();