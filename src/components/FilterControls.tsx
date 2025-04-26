import React from 'react';
import { getUniqueCountries } from '../utils/dataUtils';
import { REGIONS, YEAR_RANGES } from '../constants';
import { FilterState } from '../types';

interface FilterControlsProps {
  filter: FilterState;
  onFilterChange: (newFilter: Partial<FilterState>) => void;
  data: {
    departures: any[];
    arrivals: any[];
  };
}

const FilterControls: React.FC<FilterControlsProps> = ({ filter, onFilterChange, data }) => {
  const currentData = filter.dataset === 'departures' ? data.departures : data.arrivals;
  const countries = getUniqueCountries(currentData);
  const yearRange = filter.dataset === 'departures' ? YEAR_RANGES.departures : YEAR_RANGES.arrivals;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label htmlFor="dataset" className="block text-sm font-medium text-gray-700 mb-1">
            Dataset
          </label>
          <select
            id="dataset"
            value={filter.dataset}
            onChange={(e) => onFilterChange({ dataset: e.target.value as FilterState['dataset'] })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="arrivals">Tourism Arrivals</option>
            <option value="departures">Tourism Departures</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
            Region
          </label>
          <select
            id="region"
            value={filter.region}
            onChange={(e) => onFilterChange({ region: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {REGIONS.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          <select
            id="country"
            value={filter.country}
            onChange={(e) => onFilterChange({ country: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">World</option>
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
            Year: {filter.year}
          </label>
          <input
            id="year"
            type="range"
            min={yearRange.min}
            max={yearRange.max}
            value={filter.year}
            onChange={(e) => onFilterChange({ year: parseInt(e.target.value) })}
            className="w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        
        <div className="flex items-end">
          <button
            onClick={() => onFilterChange({
              region: 'All',
              country: '',
              year: 2015,
              dataset: 'arrivals'
            })}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md text-sm transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;