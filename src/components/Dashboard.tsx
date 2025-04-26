import React, { useState, useEffect } from 'react';
import WorldMap from './WorldMap';
import TimeSeriesChart from './TimeSeriesChart';
import BarChart from './BarChart';
import FilterControls from './FilterControls';
import RegionalTrends from './RegionalTrends';
import AviationSafetyChart from './AviationSafetyChart';
import { FilterState } from '../types';
import { YEAR_RANGES } from '../constants';
import { parseCSV } from '../utils/dataUtils';
import DashboardCard from './DashboardCard';

const Dashboard: React.FC = () => {
  const [departuresData, setDeparturesData] = useState([]);
  const [arrivalsData, setArrivalsData] = useState([]);
  const [regionalData, setRegionalData] = useState([]);
  const [aviationAccidentData, setAviationAccidentData] = useState([]);
  const [aviationFatalityData, setAviationFatalityData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter state
  const [filter, setFilter] = useState<FilterState>({
    region: 'All',
    country: '',
    year: 2015,
    dataset: 'arrivals'
  });

  // Fetch all datasets
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Load tourism departures data
        const departuresResponse = await fetch('/data/departures.csv');
        const departuresCSV = await departuresResponse.text();
        setDeparturesData(parseCSV(departuresCSV));
        
        // Load tourism arrivals data
        const arrivalsResponse = await fetch('/data/arrivals.csv');
        const arrivalsCSV = await arrivalsResponse.text();
        setArrivalsData(parseCSV(arrivalsCSV));
        
        // Load regional trends data
        const regionalResponse = await fetch('/data/regional_arrivals.csv');
        const regionalCSV = await regionalResponse.text();
        setRegionalData(parseCSV(regionalCSV));
        
        // Load aviation safety data
        const accidentsResponse = await fetch('/data/aviation_accidents.csv');
        const accidentsCSV = await accidentsResponse.text();
        setAviationAccidentData(parseCSV(accidentsCSV));
        
        const fatalitiesResponse = await fetch('/data/aviation_fatalities.csv');
        const fatalitiesCSV = await fatalitiesResponse.text();
        setAviationFatalityData(parseCSV(fatalitiesCSV));
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleFilterChange = (newFilter: Partial<FilterState>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <FilterControls 
        filter={filter} 
        onFilterChange={handleFilterChange} 
        data={{ departures: departuresData, arrivals: arrivalsData }}
      />
      
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DashboardCard title="Global Tourism Map" className="lg:col-span-2">
          <WorldMap 
            data={filter.dataset === 'departures' ? departuresData : arrivalsData}
            year={filter.year}
            metric={filter.dataset === 'departures' ? 'Number of departures (per 1000 people)' : 'International tourism, number of arrivals'}
          />
        </DashboardCard>
        
        <DashboardCard title={`Top 10 Countries (${filter.year})`}>
          <BarChart 
            data={filter.dataset === 'departures' ? departuresData : arrivalsData}
            year={filter.year}
            metric={filter.dataset === 'departures' ? 'Number of departures (per 1000 people)' : 'International tourism, number of arrivals'}
          />
        </DashboardCard>
      </div>
      
      <div id="tourism-trends" className="mt-8">
        <DashboardCard title="Tourism Trends Over Time">
          <TimeSeriesChart 
            data={filter.dataset === 'departures' ? departuresData : arrivalsData}
            selectedCountry={filter.country || 'World'}
            metric={filter.dataset === 'departures' ? 'Number of departures (per 1000 people)' : 'International tourism, number of arrivals'}
            yearRange={filter.dataset === 'departures' ? YEAR_RANGES.departures : YEAR_RANGES.arrivals}
          />
        </DashboardCard>
      </div>
      
      <div id="regional-analysis" className="mt-8">
        <DashboardCard title="Regional Tourism Analysis">
          <RegionalTrends data={regionalData} />
        </DashboardCard>
      </div>
      
      <div id="aviation-safety" className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard title="Aviation Accidents Per Million Flights">
          <AviationSafetyChart 
            data={aviationAccidentData}
            metric="Fatal accidents per million commercial flights"
          />
        </DashboardCard>
        
        <DashboardCard title="Aviation Fatalities Per Million Passengers">
          <AviationSafetyChart 
            data={aviationFatalityData}
            metric="Fatalities per million passengers"
          />
        </DashboardCard>
      </div>
    </div>
  );
};

export default Dashboard;