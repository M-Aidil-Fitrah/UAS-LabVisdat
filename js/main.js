let allData = [];
let currentChart;
let availableYears = [];
let selectedCountry;
let chartType = 'bar'; // Default chart type

// Initialize theme as dark mode
const initializeTheme = () => {
  document.documentElement.classList.add('dark');
  localStorage.setItem('theme', 'dark');
};

// Initialize theme on page load
initializeTheme();

// Show splash screen on page load
document.addEventListener('DOMContentLoaded', function() {
  const splashScreen = document.getElementById('splash-screen');
  
  // Hide splash screen after animation
  setTimeout(() => {
    splashScreen.style.opacity = "0";
    setTimeout(() => {
      splashScreen.style.display = "none";
    }, 500);
  }, 2500);
  
  // Show loading spinner
  document.getElementById('loading-spinner').classList.remove('hidden');
  
  // Load data after splash animation
  setTimeout(loadData, 2000);
});

// Load and process data
function loadData() {
  d3.csv("js/air-passengers-carried-rounded.csv").then((data) => {
    data.forEach(d => {
      d.Year = +d.Year;
      d.Passengers = +d["Air transport, passengers carried"];
    });

    allData = data;

    const countries = [...new Set(data.map(d => d.Entity))].sort();
    populateCountryDropdown(countries);

    availableYears = [...new Set(data.map(d => d.Year))].sort((a, b) => a - b);
    populateYearDropdowns(availableYears);

    // Set defaults smartly - try to find a country with good data
    const popularCountries = ['United States', 'United Kingdom', 'China', 'India', 'Japan', 'Germany', 'France'];
    
    // Find first popular country that exists in data
    selectedCountry = popularCountries.find(c => countries.includes(c)) || countries[0];
    
    document.getElementById('country-select').value = selectedCountry;
    
    // Choose a sensible year range (last 5-10 years of data if available)
    const endYearIndex = availableYears.length - 1;
    const startYearIndex = Math.max(0, endYearIndex - 9); // Last 10 years or all if less
    
    document.getElementById('year-start').value = availableYears[startYearIndex];
    document.getElementById('year-end').value = availableYears[endYearIndex];

    initializeChart();
    setupEventListeners();

    document.getElementById('loading-spinner').classList.add('hidden');
  }).catch(error => {
    console.error("Error loading data:", error);
    document.getElementById('loading-spinner').classList.add('hidden');
    
    // Show error message
    const container = document.querySelector('.container');
    const errorMsg = document.createElement('div');
    errorMsg.className = 'bg-red-100 dark:bg-red-900 p-4 rounded-lg text-center my-4';
    errorMsg.innerHTML = `
      <p class="text-red-700 dark:text-red-300">Error loading data. Please try refreshing the page.</p>
    `;
    container.appendChild(errorMsg);
  });
}

function populateCountryDropdown(countries) {
  const select = document.getElementById('country-select');
  select.innerHTML = '';
  countries.forEach(country => {
    const option = document.createElement('option');
    option.value = country;
    option.textContent = country;
    select.appendChild(option);
  });
  
  // Initialize TomSelect with enhanced styling
  if (window.TomSelect) {
    const tomSelect = new TomSelect("#country-select", {
      create: false,
      sortField: { field: "text", direction: "asc" },
      controlInput: '<input type="text" autocomplete="off" class="ts-input-search" placeholder="Search country...">',
      render: {
        option: function(data, escape) {
          return `<div class="py-2 px-3 flex items-center">
                    <span>${escape(data.text)}</span>
                  </div>`;
        },
        item: function(data, escape) {
          return `<div class="item">${escape(data.text)}</div>`;
        }
      }
    });
  }
}

function populateYearDropdowns(years) {
  const startSelect = document.getElementById('year-start');
  const endSelect = document.getElementById('year-end');
  startSelect.innerHTML = '';
  endSelect.innerHTML = '';
  
  years.forEach(year => {
    const startOption = document.createElement('option');
    startOption.value = year;
    startOption.textContent = year;
    startSelect.appendChild(startOption);

    const endOption = document.createElement('option');
    endOption.value = year;
    endOption.textContent = year;
    endSelect.appendChild(endOption);
  });
}

function initializeChart() {
  const startYear = +document.getElementById('year-start').value;
  const endYear = +document.getElementById('year-end').value;
  const selectedYears = availableYears.filter(year => year >= startYear && year <= endYear);

  // Clean up previous chart if it exists
  if (currentChart) {
    d3.select('#chart-container').selectAll("*").remove();
  }

  const config = {
    parentElement: '#chart-container',
    containerWidth: document.getElementById('chart-container').parentElement.clientWidth,
    containerHeight: 450,
    margin: { top: 60, right: 40, bottom: 100, left: 160 },
    country: selectedCountry,
    years: selectedYears
  };

  // Create the appropriate chart based on current selection
  if (chartType === 'bar') {
    currentChart = new Barchart(config, allData);
    // Update chart toggle button to show current state
    document.getElementById('toggle-chart-type').querySelector('.chart-type-label').textContent = 'Switch to Line Chart';
    document.getElementById('toggle-chart-type').querySelector('.chart-icon-bar').classList.remove('hidden');
    document.getElementById('toggle-chart-type').querySelector('.chart-icon-line').classList.add('hidden');
  } else {
    currentChart = new Linechart(config, allData);
    // Update chart toggle button to show current state
    document.getElementById('toggle-chart-type').querySelector('.chart-type-label').textContent = 'Switch to Bar Chart';
    document.getElementById('toggle-chart-type').querySelector('.chart-icon-bar').classList.add('hidden');
    document.getElementById('toggle-chart-type').querySelector('.chart-icon-line').classList.remove('hidden');
  }

  updateChartInfo();
  currentChart.updateVis();
}

function updateChartInfo() {
  const chartInfo = document.getElementById('chart-info');
  const chartTitle = document.getElementById('chart-title');
  const chartDescription = document.getElementById('chart-description');

  // Show chart info with animation
  if (chartInfo.classList.contains('hidden')) {
    chartInfo.classList.remove('hidden');
    chartInfo.style.opacity = 0;
    setTimeout(() => {
      chartInfo.style.transition = 'opacity 0.5s ease';
      chartInfo.style.opacity = 1;
    }, 10);
  }
  
  const startYear = document.getElementById('year-start').value;
  const endYear = document.getElementById('year-end').value;

  // Get country data stats for description
  const countryData = allData.filter(d => 
    d.Entity === selectedCountry && 
    d.Year >= +startYear && 
    d.Year <= +endYear
  );
  
  let descriptionText = `Showing data from ${startYear} to ${endYear}.`;
  
  if (countryData.length > 0) {
    const maxYear = d3.max(countryData, d => d.Year);
    const minYear = d3.min(countryData, d => d.Year);
    const maxPassengers = d3.max(countryData, d => d.Passengers);
    const maxPassengerYear = countryData.find(d => d.Passengers === maxPassengers)?.Year;
    
    descriptionText = `Showing data from ${startYear} to ${endYear}. The peak year was ${maxPassengerYear} with ${d3.format(",")(maxPassengers)} passengers.`;
  }

  chartTitle.textContent = `Air Passengers in ${selectedCountry}`;
  chartDescription.textContent = descriptionText;
}

function setupEventListeners() {
  // Country selection change
  document.getElementById('country-select').addEventListener('change', (e) => {
    selectedCountry = e.target.value;
    
    // Add subtle animation when changing country
    const chartContainer = document.querySelector('.chart-container');
    chartContainer.style.opacity = 0.5;
    setTimeout(() => {
      initializeChart();
      chartContainer.style.opacity = 1;
    }, 300);
  });

  // Year range changes
  document.getElementById('year-start').addEventListener('change', () => {
    adjustYearRange();
    initializeChart();
  });

  document.getElementById('year-end').addEventListener('change', () => {
    adjustYearRange();
    initializeChart();
  });

  // Toggle chart type (bar/line)
  document.getElementById('toggle-chart-type').addEventListener('click', () => {
    // Toggle chart type
    chartType = chartType === 'bar' ? 'line' : 'bar';
    
    // Add transition effect
    const chartContainer = document.querySelector('.chart-container');
    chartContainer.style.opacity = 0.5;
    setTimeout(() => {
      initializeChart();
      chartContainer.style.opacity = 1;
    }, 300);
  });

  // Export to PNG with improved feedback
  document.getElementById('export-png').addEventListener('click', () => {
    const exportButton = document.getElementById('export-png');
    const originalText = exportButton.innerHTML;
    
    exportButton.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Exporting...
    `;
    
    // Add a delay for better UX
    setTimeout(() => {
      const svg = document.getElementById("chart-container");
      const chartTypeStr = chartType === 'bar' ? 'bar_chart' : 'line_chart';
      saveSvgAsPng(svg, `air_passengers_${selectedCountry}_${document.getElementById('year-start').value}-${document.getElementById('year-end').value}_${chartTypeStr}.png`, {
        scale: 2,
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--background')
      }).then(() => {
        // Show success feedback
        exportButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 6L9 17l-5-5"></path>
          </svg>
          Downloaded!
        `;
        
        // Restore original text after feedback
        setTimeout(() => {
          exportButton.innerHTML = originalText;
        }, 2000);
      });
    }, 500);
  });

  // Responsive handling
  window.addEventListener('resize', () => {
    if (currentChart) {
      currentChart.config.containerWidth = document.getElementById('chart-container').parentElement.clientWidth;
      currentChart.updateVis();
    }
  });
  
  // Add keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Toggle chart type with Alt+C
    if (e.altKey && e.key === 'c') {
      document.getElementById('toggle-chart-type').click();
    }
    
    // Export with Alt+E
    if (e.altKey && e.key === 'e') {
      document.getElementById('export-png').click();
    }
  });
}

function adjustYearRange() {
  const start = +document.getElementById('year-start').value;
  const end = +document.getElementById('year-end').value;
  
  if (start > end) {
    document.getElementById('year-end').value = start;
  }
}