// barchart.js

class Barchart {
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 800,
      containerHeight: _config.containerHeight || 450,
      margin: _config.margin || { top: 60, right: 40, bottom: 100, left: 80 },
      country: _config.country,
      years: _config.years,
      tooltipPadding: 15,
      animationDuration: 800
    };

    this.data = _data;
    this.initVis();
  }

  initVis() {
    let vis = this;

    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    vis.xScale = d3.scaleBand().range([0, vis.width]).padding(0.3);
    vis.yScale = d3.scaleLinear().range([vis.height, 0]);

    vis.xAxis = d3.axisBottom(vis.xScale).tickSize(0).tickPadding(10);
    vis.yAxis = d3.axisLeft(vis.yScale)
      .tickSize(-vis.width)
      .tickPadding(10)
      .ticks(6)
      .tickFormat(d3.format(","))
      .tickSizeOuter(0);

    d3.select(vis.config.parentElement).selectAll("*").remove();

    vis.svg = d3.select(vis.config.parentElement)
      .attr("width", vis.config.containerWidth)
      .attr("height", vis.config.containerHeight);

    // Add a subtle pattern to the background (optional)
    vis.defs = vis.svg.append("defs");
    
    vis.pattern = vis.defs.append("pattern")
      .attr("id", "grid-pattern")
      .attr("width", 10)
      .attr("height", 10)
      .attr("patternUnits", "userSpaceOnUse")
      .attr("patternTransform", "rotate(45)");
    
    vis.pattern.append("rect")
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", "none");
    
    vis.pattern.append("path")
      .attr("d", "M 0,0 L 0,1 L 10,1")
      .attr("stroke", "rgba(0,0,0,0.03)")
      .attr("stroke-width", 0.5);
    
    vis.svg.append("rect")
      .attr("width", vis.config.containerWidth)
      .attr("height", vis.config.containerHeight)
      .attr("fill", "url(#grid-pattern)")
      .attr("class", "background-pattern");

    vis.chart = vis.svg.append("g")
      .attr("transform", `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Background rectangle for chart area
    vis.chartBackground = vis.chart.append("rect")
      .attr("class", "chart-background")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", vis.width)
      .attr("height", vis.height)
      .attr("fill", "transparent");

    vis.xAxisG = vis.chart.append("g")
      .attr("class", "axis x-axis")
      .attr("transform", `translate(0,${vis.height})`);

    vis.yAxisG = vis.chart.append("g")
      .attr("class", "axis y-axis");

    // Enhanced visuals for axes
    vis.chart.append("line")
      .attr("class", "baseline")
      .attr("x1", 0)
      .attr("x2", vis.width)
      .attr("y1", vis.height)
      .attr("y2", vis.height)
      .attr("stroke", "currentColor")
      .attr("stroke-opacity", 0.2);

    // Title with better positioning
    vis.title = vis.svg.append("text")
      .attr("class", "chart-title")
      .attr("x", vis.config.containerWidth / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle");

    // Subtitle with better positioning
    vis.subtitle = vis.svg.append("text")
      .attr("class", "chart-subtitle")
      .attr("x", vis.config.containerWidth / 2)
      .attr("y", 55)
      .attr("text-anchor", "middle");

    // X-axis label with better styling
    vis.svg.append("text")
      .attr("class", "x-axis-label")
      .attr("x", vis.config.margin.left + vis.width / 2)
      .attr("y", vis.config.margin.top + vis.height + 45)
      .attr("text-anchor", "middle")
      .attr("font-size", "20px")
      .text("Year")
      .attr("fill", "white");

    // Y-axis label with better styling
    vis.chart.append("text")
      .attr("class", "y-axis-label")
      .attr("x", -vis.height / 2)
      .attr("y", -125) // Changed from -55 to -70
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .text("Number of Passengers")
      .attr("fill", "white");

    // Enhanced legend
    vis.legend = vis.svg.append("text")
      .attr("class", "chart-legend")
      .attr("x", vis.config.containerWidth / 2)
      .attr("y", vis.config.containerHeight - 15)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px");

    // Enhanced tooltip with HTML structure
    vis.tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
  }

  updateVis() {
    let vis = this;

    vis.filteredData = vis.data.filter(d => 
      d.Entity === vis.config.country &&
      vis.config.years.includes(d.Year) &&
      !isNaN(d.Passengers)
    );

    if (vis.filteredData.length > 0) {
      vis.xScale.domain(vis.filteredData.map(d => d.Year));
      vis.yScale.domain([0, d3.max(vis.filteredData, d => d.Passengers) * 1.1]);
    } else {
      vis.xScale.domain(vis.config.years);
      vis.yScale.domain([0, 100]);
    }

    vis.title.text(`Air Passengers in ${vis.config.country}`);
    vis.subtitle.text(`${Math.min(...vis.config.years)} - ${Math.max(...vis.config.years)}`);
    vis.legend.text(`Passenger numbers by country and selected year range. Data source: Global Air Transport Data.`);

    vis.renderVis();
  }

  renderVis() {
    let vis = this;

    // Clear previous elements
    vis.chart.selectAll(".bar").remove();
    vis.chart.selectAll(".no-data-text").remove();

    // Show 'No Data' message if needed
    if (vis.filteredData.length === 0) {
      vis.chart.append("text")
        .attr("class", "no-data-text")
        .attr("x", vis.width / 2)
        .attr("y", vis.height / 2)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .text("No Data Available")
        .style("opacity", 0)
        .transition()
        .duration(500)
        .style("opacity", 1);

      vis.xAxisG.call(vis.xAxis);
      vis.yAxisG.call(vis.yAxis);
      return;
    }

    // Create bars with improved animations
    const bars = vis.chart.selectAll(".bar")
      .data(vis.filteredData, d => d.Year);
    
    bars.enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => vis.xScale(d.Year))
      .attr("width", vis.xScale.bandwidth())
      .attr("y", vis.height)
      .attr("height", 0)
      .transition()
      .duration(vis.config.animationDuration)
      .delay((d, i) => i * 50) // Staggered animation
      .ease(d3.easeCubicOut) // Smoother easing
      .attr("y", d => vis.yScale(d.Passengers))
      .attr("height", d => vis.height - vis.yScale(d.Passengers));

    // Add interactivity with enhanced tooltips
    vis.chart.selectAll(".bar")
      .on("mouseover", function(event, d) {
        // Highlight bar
        d3.select(this)
          .transition()
          .duration(200)
          .attr("filter", "brightness(1.1)")
          .attr("transform", "scale(1.02, 1)")
          .attr("transform-origin", `${vis.xScale(d.Year) + vis.xScale.bandwidth()/2}px ${vis.height}px`);

        // Show value label above bar
        vis.chart.append("text")
          .attr("class", "bar-value")
          .attr("x", vis.xScale(d.Year) + vis.xScale.bandwidth()/2)
          .attr("y", vis.yScale(d.Passengers) - 10)
          .attr("text-anchor", "middle")
          .attr("font-size", "12px")
          .text(d3.format(",")(d.Passengers))
          .style("opacity", 0)
          .transition()
          .duration(200)
          .style("opacity", 1);

        // Show tooltip
        vis.tooltip.transition()
          .duration(200)
          .style("opacity", .95);
        
        vis.tooltip.html(`
          <div class="tooltip-title">${d.Year}</div>
          <div>${d.Entity}</div>
          <div class="font-bold">${d3.format(",")(d.Passengers)} passengers</div>
        `)
          .style("left", (event.pageX + vis.config.tooltipPadding) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        // Remove highlight
        d3.select(this)
          .transition()
          .duration(200)
          .attr("filter", null)
          .attr("transform", "scale(1, 1)");

        // Remove value label
        vis.chart.selectAll(".bar-value").remove();

        // Hide tooltip
        vis.tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });

    // Update axes with smooth transitions
    vis.xAxisG.transition()
      .duration(vis.config.animationDuration)
      .call(vis.xAxis);
    
    vis.yAxisG.transition()
      .duration(vis.config.animationDuration)
      .call(vis.yAxis);

    // Enhance axis styling
    vis.xAxisG.selectAll(".tick text")
      .attr("font-size", "12px");

    vis.yAxisG.selectAll(".tick text")
      .attr("font-size", "12px");
    
    // Add a subtle animation to grid lines
    vis.yAxisG.selectAll(".tick line")
      .style("stroke-opacity", 0)
      .transition()
      .duration(vis.config.animationDuration)
      .style("stroke-opacity", 0.2);
  }
}