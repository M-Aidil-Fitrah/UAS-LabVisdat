// charts.js for Tour Vista
// This script creates visualizations using the loaded CSV data

// We'll use D3.js for creating our charts
// Assuming D3.js is included in the HTML file

/**
 * Creates a chart for international tourist arrivals
 * @param {string} containerId - ID of the container element
 * @param {Array} data - The loaded tourist arrivals data
 */
export function createTouristArrivalsChart(containerId, data) {
    if (!data || data.length === 0) {
        console.error('No data available for tourist arrivals chart');
        document.getElementById(containerId).innerHTML = '<p class="error-message">No data available</p>';
        return;
    }

    // Clear the container
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    // Process data - format as needed for the chart
    const chartData = data.map(d => ({
        year: +d.Year || +d.year,
        arrivals: +d.Arrivals || +d.arrivals || +d.Value || +d.value
    })).sort((a, b) => a.year - b.year);

    // Set up SVG dimensions
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    // Create SVG element
    const svg = d3.select(`#${containerId}`)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const x = d3.scaleLinear()
        .domain(d3.extent(chartData, d => d.year))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(chartData, d => d.arrivals) * 1.1])
        .range([height, 0]);

    // Create line generator
    const line = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.arrivals));

    // Add x-axis
    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format('d')).ticks(Math.min(chartData.length, 10)));

    // Add y-axis
    svg.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(y).tickFormat(d => formatNumber(d)));

    // Add y-axis label
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 15)
        .attr('x', -height / 2)
        .attr('text-anchor', 'middle')
        .text('Number of Arrivals');

    // Add line path
    svg.append('path')
        .datum(chartData)
        .attr('fill', 'none')
        .attr('stroke', '#4682b4')
        .attr('stroke-width', 2)
        .attr('d', line);

    // Add circles for data points
    svg.selectAll('.dot')
        .data(chartData)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('cx', d => x(d.year))
        .attr('cy', d => y(d.arrivals))
        .attr('r', 4)
        .attr('fill', '#4682b4')
        .on('mouseover', function(event, d) {
            showTooltip(this, `Year: ${d.year}<br>Arrivals: ${formatNumber(d.arrivals)}`);
        })
        .on('mouseout', hideTooltip);
}

/**
 * Creates a chart for tourist arrivals by world region
 * @param {string} containerId - ID of the container element
 * @param {Array} data - The loaded tourist arrivals by region data
 */
export function createTouristArrivalsByRegionChart(containerId, data) {
    if (!data || data.length === 0) {
        console.error('No data available for tourist arrivals by region chart');
        document.getElementById(containerId).innerHTML = '<p class="error-message">No data available</p>';
        return;
    }

    // Clear the container
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    // Process data - identify regions and years
    const years = [...new Set(data.map(d => +d.Year || +d.year))].sort();
    const regions = [...new Set(data.map(d => d.Region || d.region || d.Entity || d.entity))];
    
    // Only use the most recent year with complete data
    const mostRecentYear = years[years.length - 1];
    
    // Filter data for the most recent year
    const yearData = data.filter(d => (+d.Year || +d.year) === mostRecentYear && regions.includes(d.Region || d.region || d.Entity || d.entity));
    
    // Format data for the chart
    const chartData = yearData.map(d => ({
        region: d.Region || d.region || d.Entity || d.entity,
        arrivals: +d.Arrivals || +d.arrivals || +d.Value || +d.value
    })).sort((a, b) => b.arrivals - a.arrivals);

    // Set up SVG dimensions
    const margin = { top: 20, right: 30, bottom: 60, left: 60 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    // Create SVG element
    const svg = d3.select(`#${containerId}`)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Set up scales
    const x = d3.scaleBand()
        .domain(chartData.map(d => d.region))
        .range([0, width])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(chartData, d => d.arrivals) * 1.1])
        .range([height, 0]);

    // Create color scale
    const color = d3.scaleOrdinal()
        .domain(regions)
        .range(d3.schemeCategory10);

    // Add x-axis
    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-45)');

    // Add y-axis
    svg.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(y).tickFormat(d => formatNumber(d)));

    // Add y-axis label
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 15)
        .attr('x', -height / 2)
        .attr('text-anchor', 'middle')
        .text('Number of Arrivals');

    // Add title with year
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', -margin.top / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .text(`Data for Year: ${mostRecentYear}`);

    // Add bars
    svg.selectAll('.bar')
        .data(chartData)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.region))
        .attr('y', d => y(d.arrivals))
        .attr('width', x.bandwidth())
        .attr('height', d => height - y(d.arrivals))
        .attr('fill', d => color(d.region))
        .on('mouseover', function(event, d) {
            showTooltip(this, `Region: ${d.region}<br>Arrivals: ${formatNumber(d.arrivals)}`);
        })
        .on('mouseout', hideTooltip);
}

/**
 * Creates a chart for international tourist departures per 1000 residents
 * @param {string} containerId - ID of the container element
 * @param {Array} data - The loaded tourist departures data
 */
export function createTouristDeparturesChart(containerId, data) {
    if (!data || data.length === 0) {
        console.error('No data available for tourist departures chart');
        document.getElementById(containerId).innerHTML = '<p class="error-message">No data available</p>';
        return;
    }

    // Clear the container
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    // Process data - get the most recent year with complete data
    const years = [...new Set(data.map(d => +d.Year || +d.year))].sort();
    const mostRecentYear = years[years.length - 1];
    
    // Filter data for the most recent year
    const yearData = data.filter(d => (+d.Year || +d.year) === mostRecentYear);
    
    // Format data for the chart
    const chartData = yearData.map(d => ({
        country: d.Country || d.country || d.Entity || d.entity,
        departures: +d.Departures || +d['Departures per 1000'] || +d.Value || +d.value
    })).sort((a, b) => b.departures - a.departures);

    // Take top 15 countries for readability
    const topCountries = chartData.slice(0, 15);

    // Set up SVG dimensions
    const margin = { top: 20, right: 30, bottom: 120, left: 60 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create SVG element
    const svg = d3.select(`#${containerId}`)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const x = d3.scaleBand()
        .domain(topCountries.map(d => d.country))
        .range([0, width])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(topCountries, d => d.departures) * 1.1])
        .range([height, 0]);

    // Add x-axis
    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-45)');

    // Add y-axis
    svg.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(y));

    // Add y-axis label
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 15)
        .attr('x', -height / 2)
        .attr('text-anchor', 'middle')
        .text('Departures per 1000 Residents');

    // Add title with year
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', -margin.top / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .text(`Data for Year: ${mostRecentYear}`);

    // Add bars
    svg.selectAll('.bar')
        .data(topCountries)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.country))
        .attr('y', d => y(d.departures))
        .attr('width', x.bandwidth())
        .attr('height', d => height - y(d.departures))
        .attr('fill', '#82c0cc')
        .on('mouseover', function(event, d) {
            showTooltip(this, `Country: ${d.country}<br>Departures per 1000: ${d.departures.toFixed(2)}`);
        })
        .on('mouseout', hideTooltip);
}

/**
 * Creates a chart for air passengers carried
 * @param {string} containerId - ID of the container element
 * @param {Array} data - The loaded air passengers data
 */
export function createAirPassengersChart(containerId, data) {
    if (!data || data.length === 0) {
        console.error('No data available for air passengers chart');
        document.getElementById(containerId).innerHTML = '<p class="error-message">No data available</p>';
        return;
    }

    // Clear the container
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    // Process data - format as needed for the chart
    const chartData = data.map(d => ({
        year: +d.Year || +d.year,
        passengers: +d.Passengers || +d['Air passengers carried'] || +d.Value || +d.value
    })).sort((a, b) => a.year - b.year);

    // Set up SVG dimensions
    const margin = { top: 20, right: 30, bottom: 40, left: 70 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    // Create SVG element
    const svg = d3.select(`#${containerId}`)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const x = d3.scaleLinear()
        .domain(d3.extent(chartData, d => d.year))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(chartData, d => d.passengers) * 1.1])
        .range([height, 0]);

    // Create line generator
    const line = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.passengers));

    // Add x-axis
    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format('d')).ticks(Math.min(chartData.length, 10)));

    // Add y-axis
    svg.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(y).tickFormat(d => formatNumber(d)));

    // Add y-axis label
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 15)
        .attr('x', -height / 2)
        .attr('text-anchor', 'middle')
        .text('Number of Passengers');

    // Add area under the line
    svg.append('path')
        .datum(chartData)
        .attr('fill', 'rgba(70, 130, 180, 0.2)')
        .attr('stroke', 'none')
        .attr('d', d3.area()
            .x(d => x(d.year))
            .y0(height)
            .y1(d => y(d.passengers))
        );

    // Add line path
    svg.append('path')
        .datum(chartData)
        .attr('fill', 'none')
        .attr('stroke', '#4682b4')
        .attr('stroke-width', 2)
        .attr('d', line);

    // Add circles for data points
    svg.selectAll('.dot')
        .data(chartData)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('cx', d => x(d.year))
        .attr('cy', d => y(d.passengers))
        .attr('r', 4)
        .attr('fill', '#4682b4')
        .on('mouseover', function(event, d) {
            showTooltip(this, `Year: ${d.year}<br>Passengers: ${formatNumber(d.passengers)}`);
        })
        .on('mouseout', hideTooltip);
}

/**
 * Creates a chart for aviation safety metrics
 * @param {string} containerId - ID of the container element
 * @param {Array} datasets - Array of loaded safety data
 */
export function createAviationSafetyChart(containerId, datasets) {
    if (!datasets || datasets.length === 0 || !datasets[0] || !datasets[1]) {
        console.error('Insufficient data available for aviation safety chart');
        document.getElementById(containerId).innerHTML = '<p class="error-message">No data available</p>';
        return;
    }

    // Clear the container
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    // Process data - format as needed for the chart
    const passengersPerFatalityData = datasets[0].map(d => ({
        year: +d.Year || +d.year,
        value: +d.Value || +d.value || +d['Passengers per fatality']
    })).sort((a, b) => a.year - b.year);

    const fatalitiesPerMillionData = datasets[1].map(d => ({
        year: +d.Year || +d.year,
        value: +d.Value || +d.value || +d['Fatalities per million']
    })).sort((a, b) => a.year - b.year);

    // Find common years between datasets
    const years1 = new Set(passengersPerFatalityData.map(d => d.year));
    const years2 = new Set(fatalitiesPerMillionData.map(d => d.year));
    const commonYears = [...years1].filter(year => years2.has(year));

    // Filter data to common years
    const filteredData1 = passengersPerFatalityData.filter(d => commonYears.includes(d.year));
    const filteredData2 = fatalitiesPerMillionData.filter(d => commonYears.includes(d.year));

    // Set up SVG dimensions
    const margin = { top: 20, right: 80, bottom: 40, left: 60 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    // Create SVG element
    const svg = d3.select(`#${containerId}`)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const x = d3.scaleLinear()
        .domain([d3.min(commonYears), d3.max(commonYears)])
        .range([0, width]);

    const y1 = d3.scaleLinear()
        .domain([0, d3.max(filteredData1, d => d.value) * 1.1])
        .range([height, 0]);

    const y2 = d3.scaleLinear()
        .domain([0, d3.max(filteredData2, d => d.value) * 1.1])
        .range([height, 0]);

    // Create line generators
    const line1 = d3.line()
        .x(d => x(d.year))
        .y(d => y1(d.value));

    const line2 = d3.line()
        .x(d => x(d.year))
        .y(d => y2(d.value));

    // Add x-axis
    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format('d')).ticks(Math.min(commonYears.length, 10)));

    // Add y-axis for passengers per fatality
    svg.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(y1).tickFormat(d => formatNumber(d)));

    // Add y-axis label for passengers per fatality
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 15)
        .attr('x', -height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#4682b4')
        .text('Passengers per Fatality');

    // Add y-axis for fatalities per million
    svg.append('g')
        .attr('class', 'y-axis-right')
        .attr('transform', `translate(${width},0)`)
        .call(d3.axisRight(y2));

    // Add y-axis label for fatalities per million
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', width + margin.right - 15)
        .attr('x', -height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#e63946')
        .text('Fatalities per Million');

    // Add line for passengers per fatality
    svg.append('path')
        .datum(filteredData1)
        .attr('fill', 'none')
        .attr('stroke', '#4682b4')
        .attr('stroke-width', 2)
        .attr('d', line1);

    // Add line for fatalities per million
    svg.append('path')
        .datum(filteredData2)
        .attr('fill', 'none')
        .attr('stroke', '#e63946')
        .attr('stroke-width', 2)
        .attr('d', line2);

    // Add legend
    const legend = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${width - 220},10)`);

    // Legend for first dataset
    legend.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 20)
        .attr('y2', 0)
        .attr('stroke', '#4682b4')
        .attr('stroke-width', 2);

    legend.append('text')
        .attr('x', 25)
        .attr('y', 5)
        .text('Passengers per Fatality')
        .style('font-size', '10px')
        .attr('fill', '#4682b4');

    // Legend for second dataset
    legend.append('line')
        .attr('x1', 0)
        .attr('y1', 20)
        .attr('x2', 20)
        .attr('y2', 20)
        .attr('stroke', '#e63946')
        .attr('stroke-width', 2);

    legend.append('text')
        .attr('x', 25)
        .attr('y', 25)
        .text('Fatalities per Million Passengers')
        .style('font-size', '10px')
        .attr('fill', '#e63946');
}

/**
 * Creates a chart for fatal airliner accidents
 * @param {string} containerId - ID of the container element
 * @param {Array} data - The loaded accidents data
 */
export function createAccidentsChart(containerId, data) {
    if (!data || data.length === 0) {
        console.error('No data available for accidents chart');
        document.getElementById(containerId).innerHTML = '<p class="error-message">No data available</p>';
        return;
    }

    // Clear the container
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    // Process data - format as needed for the chart
    const chartData = data.map(d => ({
        year: +d.Year || +d.year,
        accidents: +d.Accidents || +d['Fatal accidents'] || +d.Value || +d.value
    })).sort((a, b) => a.year - b.year);

    // Set up SVG dimensions
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    // Create SVG element
    const svg = d3.select(`#${containerId}`)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const x = d3.scaleLinear()
        .domain(d3.extent(chartData, d => d.year))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(chartData, d => d.accidents) * 1.1])
        .range([height, 0]);

    // Create bar width
    const barWidth = width / chartData.length * 0.8;

    // Add x-axis
    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format('d')).ticks(Math.min(chartData.length, 10)));

    // Add y-axis
    svg.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(y));

    // Add y-axis label
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 15)
        .attr('x', -height / 2)
        .attr('text-anchor', 'middle')
        .text('Accidents per Million Flights');

    // Add bars
    svg.selectAll('.bar')
        .data(chartData)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.year) - barWidth / 2)
        .attr('y', d => y(d.accidents))
        .attr('width', barWidth)
        .attr('height', d => height - y(d.accidents))
        .attr('fill', '#e63946')
        .on('mouseover', function(event, d) {
            showTooltip(this, `Year: ${d.year}<br>Accidents per Million Flights: ${d.accidents.toFixed(3)}`);
        })
        .on('mouseout', hideTooltip);

    // Add trend line
    const trendData = calculateTrendLine(chartData.map(d => [d.year, d.accidents]));
    
    const trendLine = d3.line()
        .x(d => x(d[0]))
        .y(d => y(d[1]));

    svg.append('path')
        .datum(trendData)
        .attr('fill', 'none')
        .attr('stroke', '#333')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4,4')
        .attr('d', trendLine);
}

// Helper Functions

/**
 * Shows a tooltip with the given content
 * @param {Element} element - The element to attach the tooltip to
 * @param {string} content - HTML content for the tooltip
 */
function showTooltip(element, content) {
    // Check if tooltip already exists
    let tooltip = document.getElementById('chart-tooltip');
    
    // Create tooltip if it doesn't exist
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'chart-tooltip';
        tooltip.className = 'tooltip';
        document.body.appendChild(tooltip);
        
        // Add styles if not already in CSS
        const style = document.createElement('style');
        style.textContent = `
            .tooltip {
                position: absolute;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                border-radius: 4px;
                padding: 8px;
                font-size: 12px;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.3s;
                z-index: 1000;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Update tooltip content and position
    tooltip.innerHTML = content;
    tooltip.style.opacity = '1';
    
    // Get element position
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    // Position tooltip above the element
    tooltip.style.top = (rect.top + scrollTop - tooltip.offsetHeight - 10) + 'px';
    tooltip.style.left = (rect.left + scrollLeft + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
}

/**
 * Hides the tooltip
 */
function hideTooltip() {
    const tooltip = document.getElementById('chart-tooltip');
    if (tooltip) {
        tooltip.style.opacity = '0';
    }
}

/**
 * Format numbers with commas for thousands
 * @param {number} num - The number to format
 * @returns {string} Formatted number
 */
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    } else {
        return num.toString();
    }
}

/**
 * Calculate a simple linear trend line for a dataset
 * @param {Array} data - Array of [x,y] points
 * @returns {Array} Array of [x,y] points for the trend line
 */
function calculateTrendLine(data) {
    const n = data.length;
    
    // Calculate means
    let sumX = 0, sumY = 0;
    for (let i = 0; i < n; i++) {
        sumX += data[i][0];
        sumY += data[i][1];
    }
    const meanX = sumX / n;
    const meanY = sumY / n;
    
    // Calculate slope and y-intercept
    let numerator = 0, denominator = 0;
    for (let i = 0; i < n; i++) {
        numerator += (data[i][0] - meanX) * (data[i][1] - meanY);
        denominator += Math.pow(data[i][0] - meanX, 2);
    }
    
    const slope = denominator !== 0 ? numerator / denominator : 0;
    const intercept = meanY - slope * meanX;
    
    // Create trend line points
    const minX = d3.min(data, d => d[0]);
    const maxX = d3.max(data, d => d[0]);
    
    return [
        [minX, slope * minX + intercept],
        [maxX, slope * maxX + intercept]
    ];
}

/**
 * Creates an interactive world map showing tourism data
 * Can be added as another visualization option
 * @param {string} containerId - ID of the container element
 * @param {Array} data - The tourist data 
 */
export function createWorldMapChart(containerId, data) {
    if (!data || data.length === 0) {
        console.error('No data available for world map chart');
        document.getElementById(containerId).innerHTML = '<p class="error-message">No data available</p>';
        return;
    }

    // Note: Implementation would require additional GeoJSON data
    // and map projection logic with D3.js
    
    // For a placeholder, add a message
    const container = document.getElementById(containerId);
    container.innerHTML = '<div class="map-placeholder">Interactive world map visualization will be added in future updates</div>';
    
    // Add styles for placeholder
    const style = document.createElement('style');
    style.textContent = `
        .map-placeholder {
            border: 1px dashed #ccc;
            border-radius: 4px;
            padding: 40px;
            text-align: center;
            background-color: #f9f9f9;
            color: #666;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Creates a combined chart comparing tourism and aviation trends
 * @param {string} containerId - ID of the container element
 * @param {Object} combinedData - Object containing different datasets
 */
export function createCombinedTrendsChart(containerId, combinedData) {
    if (!combinedData || !combinedData.touristArrivals || !combinedData.airPassengers) {
        console.error('Insufficient data available for combined trends chart');
        document.getElementById(containerId).innerHTML = '<p class="error-message">No data available</p>';
        return;
    }

    // Clear the container
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    // Process tourist arrivals data
    const arrivalsData = combinedData.touristArrivals.map(d => ({
        year: +d.Year || +d.year,
        value: +d.Arrivals || +d.arrivals || +d.Value || +d.value
    })).sort((a, b) => a.year - b.year);

    // Process air passengers data
    const passengersData = combinedData.airPassengers.map(d => ({
        year: +d.Year || +d.year,
        value: +d.Passengers || +d['Air passengers carried'] || +d.Value || +d.value
    })).sort((a, b) => a.year - b.year);

    // Find common years between datasets
    const years1 = new Set(arrivalsData.map(d => d.year));
    const years2 = new Set(passengersData.map(d => d.year));
    const commonYears = [...years1].filter(year => years2.has(year));

    // Filter data to common years
    const filteredArrivals = arrivalsData.filter(d => commonYears.includes(d.year));
    const filteredPassengers = passengersData.filter(d => commonYears.includes(d.year));

    // Set up SVG dimensions
    const margin = { top: 20, right: 80, bottom: 40, left: 60 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    // Create SVG element
    const svg = d3.select(`#${containerId}`)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const x = d3.scaleLinear()
        .domain([d3.min(commonYears), d3.max(commonYears)])
        .range([0, width]);

    // Create normalized scales to show trends on the same scale
    const normalizeData = (data) => {
        const firstValue = data[0].value;
        return data.map(d => ({
            year: d.year,
            value: (d.value / firstValue * 100) // Indexed to first year = 100
        }));
    };

    const normalizedArrivals = normalizeData(filteredArrivals);
    const normalizedPassengers = normalizeData(filteredPassengers);

    const y = d3.scaleLinear()
        .domain([0, d3.max([...normalizedArrivals, ...normalizedPassengers], d => d.value) * 1.1])
        .range([height, 0]);

    // Create line generators
    const line1 = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.value));

    const line2 = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.value));

    // Add x-axis
    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format('d')).ticks(Math.min(commonYears.length, 10)));

    // Add y-axis
    svg.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(y).tickFormat(d => `${d}%`));

    // Add y-axis label
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 15)
        .attr('x', -height / 2)
        .attr('text-anchor', 'middle')
        .text('Growth Index (First Year = 100%)');

    // Add line for tourist arrivals
    svg.append('path')
        .datum(normalizedArrivals)
        .attr('fill', 'none')
        .attr('stroke', '#4682b4')
        .attr('stroke-width', 2)
        .attr('d', line1);

    // Add line for air passengers
    svg.append('path')
        .datum(normalizedPassengers)
        .attr('fill', 'none')
        .attr('stroke', '#e63946')
        .attr('stroke-width', 2)
        .attr('d', line2);

    // Add title
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', -margin.top / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .text('Growth Comparison: Tourism vs. Air Travel');

    // Add legend
    const legend = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${width - 180},10)`);

    // Legend for tourist arrivals
    legend.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 20)
        .attr('y2', 0)
        .attr('stroke', '#4682b4')
        .attr('stroke-width', 2);

    legend.append('text')
        .attr('x', 25)
        .attr('y', 5)
        .text('International Tourist Arrivals')
        .style('font-size', '10px')
        .attr('fill', '#4682b4');

    // Legend for air passengers
    legend.append('line')
        .attr('x1', 0)
        .attr('y1', 20)
        .attr('x2', 20)
        .attr('y2', 20)
        .attr('stroke', '#e63946')
        .attr('stroke-width', 2);

    legend.append('text')
        .attr('x', 25)
        .attr('y', 25)
        .text('Air Passengers Carried')
        .style('font-size', '10px')
        .attr('fill', '#e63946');
}

/**
 * Creates a comparison chart of safety metrics across different years or periods
 * @param {string} containerId - ID of the container element
 * @param {Array} data - The safety data to visualize
 */
export function createSafetyComparisonChart(containerId, data) {
    if (!data || data.length === 0) {
        console.error('No data available for safety comparison chart');
        document.getElementById(containerId).innerHTML = '<p class="error-message">No data available</p>';
        return;
    }

    // Clear the container
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    // Process data - group by decades for comparison
    const groupedData = [];
    const decades = [];
    
    // Identify all decades in the data
    data.forEach(d => {
        const year = +d.Year || +d.year;
        const decade = Math.floor(year / 10) * 10;
        if (!decades.includes(decade)) {
            decades.push(decade);
        }
    });
    
    decades.sort();
    
    // Calculate average for each decade
    decades.forEach(decade => {
        const decadeData = data.filter(d => {
            const year = +d.Year || +d.year;
            return year >= decade && year < decade + 10;
        });
        
        if (decadeData.length > 0) {
            const sum = decadeData.reduce((acc, curr) => {
                return acc + (+curr.Value || +curr.value || +curr.Accidents || +curr['Fatal accidents'] || 0);
            }, 0);
            
            groupedData.push({
                decade: `${decade}s`,
                value: sum / decadeData.length
            });
        }
    });

    // Set up SVG dimensions
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    // Create SVG element
    const svg = d3.select(`#${containerId}`)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const x = d3.scaleBand()
        .domain(groupedData.map(d => d.decade))
        .range([0, width])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(groupedData, d => d.value) * 1.1])
        .range([height, 0]);

    // Add x-axis
    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x));

    // Add y-axis
    svg.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(y));

    // Add y-axis label
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 15)
        .attr('x', -height / 2)
        .attr('text-anchor', 'middle')
        .text('Average Accidents per Million Flights');

    // Add bars
    svg.selectAll('.bar')
        .data(groupedData)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.decade))
        .attr('y', d => y(d.value))
        .attr('width', x.bandwidth())
        .attr('height', d => height - y(d.value))
        .attr('fill', (d, i) => d3.schemeCategory10[i % 10])
        .on('mouseover', function(event, d) {
            showTooltip(this, `Decade: ${d.decade}<br>Average: ${d.value.toFixed(3)}`);
        })
        .on('mouseout', hideTooltip);

    // Add value labels on top of bars
    svg.selectAll('.label')
        .data(groupedData)
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', d => x(d.decade) + x.bandwidth() / 2)
        .attr('y', d => y(d.value) - 5)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .text(d => d.value.toFixed(2));
}

/**
 * Utility function to update all charts when data changes
 * @param {Object} chartsConfig - Configuration with chart IDs and data
 */
export function updateAllCharts(chartsConfig) {
    if (!chartsConfig) return;
    
    // Update tourist arrivals chart
    if (chartsConfig.touristArrivalsChart && chartsConfig.touristArrivalsData) {
        createTouristArrivalsChart(chartsConfig.touristArrivalsChart, chartsConfig.touristArrivalsData);
    }
    
    // Update tourist arrivals by region chart
    if (chartsConfig.touristArrivalsByRegionChart && chartsConfig.touristArrivalsByRegionData) {
        createTouristArrivalsByRegionChart(chartsConfig.touristArrivalsByRegionChart, chartsConfig.touristArrivalsByRegionData);
    }
    
    // Update tourist departures chart
    if (chartsConfig.touristDeparturesChart && chartsConfig.touristDeparturesData) {
        createTouristDeparturesChart(chartsConfig.touristDeparturesChart, chartsConfig.touristDeparturesData);
    }
    
    // Update air passengers chart
    if (chartsConfig.airPassengersChart && chartsConfig.airPassengersData) {
        createAirPassengersChart(chartsConfig.airPassengersChart, chartsConfig.airPassengersData);
    }
    
    // Update aviation safety chart
    if (chartsConfig.aviationSafetyChart && chartsConfig.aviationSafetyData) {
        createAviationSafetyChart(chartsConfig.aviationSafetyChart, chartsConfig.aviationSafetyData);
    }
    
    // Update accidents chart
    if (chartsConfig.accidentsChart && chartsConfig.accidentsData) {
        createAccidentsChart(chartsConfig.accidentsChart, chartsConfig.accidentsData);
    }
}

// Export additional utility functions if needed
export {
    formatNumber,
    showTooltip,
    hideTooltip,
    calculateTrendLine
};