// Color palette for the app
export const COLORS = {
  primary: '#3A86FF',
  secondary: '#2EC4B6',
  accent: '#FF9F1C',
  warning: '#F4A261',
  error: '#E76F51',
  success: '#2A9D8F',
  light: '#F8F9FA',
  dark: '#212529',
  gray: {
    100: '#F8F9FA',
    200: '#E9ECEF',
    300: '#DEE2E6',
    400: '#CED4DA',
    500: '#ADB5BD',
    600: '#6C757D',
    700: '#495057',
    800: '#343A40',
    900: '#212529'
  }
};

// Regions for filtering
export const REGIONS = [
  'All',
  'Africa',
  'Americas',
  'Asia & Pacific',
  'Europe',
  'Middle East'
];

// Year ranges for the datasets
export const YEAR_RANGES = {
  departures: { min: 1995, max: 2017 },
  arrivals: { min: 1995, max: 2020 },
  regionalArrivals: { min: 1950, max: 2018 },
  aviation: { min: 1970, max: 2020 }
};

// Chart dimensions
export const CHART_DIMENSIONS = {
  marginTop: 40,
  marginRight: 30,
  marginBottom: 60,
  marginLeft: 60,
  height: 400
};