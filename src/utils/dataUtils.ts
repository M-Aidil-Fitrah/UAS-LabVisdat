import { TourismDeparture, TourismArrival, AviationAccident, AviationFatality, RegionalArrival } from '../types';

/**
 * Parse CSV string data into an array of objects
 */
export function parseCSV<T>(csv: string): T[] {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return headers.reduce((obj, header, i) => {
      // Convert numeric values to numbers
      const value = values[i];
      obj[header] = !isNaN(Number(value)) ? Number(value) : value;
      return obj;
    }, {} as any);
  });
}

/**
 * Get top N countries by value for a specific year
 */
export function getTopCountriesByYear<T extends TourismDeparture | TourismArrival>(
  data: T[],
  year: number,
  valueKey: keyof T,
  n: number = 10
): T[] {
  const yearData = data.filter(d => d.Year === year && d.Entity !== 'World');
  
  // Sort by value in descending order
  const sorted = [...yearData].sort((a, b) => {
    const valueA = a[valueKey] as number;
    const valueB = b[valueKey] as number;
    return valueB - valueA;
  });
  
  return sorted.slice(0, n);
}

/**
 * Filter data by region
 */
export function filterByRegion<T extends TourismDeparture | TourismArrival | RegionalArrival>(
  data: T[],
  region: string
): T[] {
  if (region === 'All') return data;
  return data.filter(d => d.Entity === region);
}

/**
 * Get data for a specific country over all years
 */
export function getCountryTimeSeries<T extends TourismDeparture | TourismArrival>(
  data: T[],
  country: string
): T[] {
  return data.filter(d => d.Entity === country).sort((a, b) => a.Year - b.Year);
}

/**
 * Calculate the percent change between two years for a specific country
 */
export function calculatePercentChange<T extends TourismDeparture | TourismArrival>(
  data: T[],
  country: string,
  startYear: number,
  endYear: number,
  valueKey: keyof T
): number {
  const startData = data.find(d => d.Entity === country && d.Year === startYear);
  const endData = data.find(d => d.Entity === country && d.Year === endYear);
  
  if (!startData || !endData) return 0;
  
  const startValue = startData[valueKey] as number;
  const endValue = endData[valueKey] as number;
  
  if (startValue === 0) return 0;
  return ((endValue - startValue) / startValue) * 100;
}

/**
 * Get unique countries from data
 */
export function getUniqueCountries<T extends { Entity: string }>(data: T[]): string[] {
  const countries = new Set<string>();
  data.forEach(d => {
    if (d.Entity !== 'World' && !d.Entity.includes('&')) {
      countries.add(d.Entity);
    }
  });
  return Array.from(countries).sort();
}

/**
 * Format large numbers for display
 */
export function formatNumber(num: number): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toFixed(1);
}