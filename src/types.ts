// Types for the tourism data
export interface TourismDeparture {
  Entity: string;
  Code: string;
  Year: number;
  'Number of departures (per 1000 people)': number;
}

export interface TourismArrival {
  Entity: string;
  Code: string;
  Year: number;
  'International tourism, number of arrivals': number;
}

export interface RegionalArrival {
  Entity: string;
  Code: string;
  Year: number;
  'International Tourist Arrivals': number;
}

export interface AviationAccident {
  Entity: string;
  Code: string;
  Year: number;
  'Fatal accidents per million commercial flights': number;
}

export interface AviationFatality {
  Entity: string;
  Code: string;
  Year: number;
  'Fatalities per million passengers': number;
}

// Type for the world map feature
export interface GeoFeature {
  type: string;
  id: string;
  properties: {
    name: string;
    code?: string;
  };
  geometry: {
    type: string;
    coordinates: number[][][] | number[][][][] | number[][][][][] | number[][][][][][];
  };
}

// Filter state type
export interface FilterState {
  region: string;
  country: string;
  year: number;
  dataset: 'departures' | 'arrivals' | 'aviationSafety';
}