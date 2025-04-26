import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { COLORS, CHART_DIMENSIONS } from '../constants';
import { formatNumber } from '../utils/dataUtils';

interface RegionalTrendsProps {
  data: any[];
}

const RegionalTrends: React.FC<RegionalTrendsProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [regions] = useState(['Africa', 'Americas', 'Asia & Pacific', 'Europe', 'Middle East']);
  
  useEffect(() => {
    if (!data.length) return;
    
    // Clear previous chart
    if (svgRef.current) {
      d3.select(svgRef.current).selectAll('*').remove();
    }
    
    // Get container dimensions
    const container = d3.select(svgRef.current).node() as HTMLElement;
    const width = container.getBoundingClientRect().width;
    const height = CHART_DIMENSIONS.height;
    
    // Define margins
    const { marginTop, marginRight, marginBottom, marginLeft } = CHART_DIMENSIONS;
    
    // Set up the SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);
    
    // Filter data for each region
    const regionsData = regions.map(region => {
      const regionData = data
        .filter(d => d.Entity === region)
        .sort((a, b) => a.Year - b.Year);
      
      return {
        region,
        values: regionData
      };
    });
    
    // Create scales
    const xScale = d3.scaleLinear()
      .domain([1950, 2018])
      .range([marginLeft, width - marginRight]);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d['International Tourist Arrivals']) || 0])
      .nice()
      .range([height - marginBottom, marginTop]);
    
    // Create line generator
    const line = d3.line<any>()
      .x(d => xScale(d.Year))
      .y(d => yScale(d['International Tourist Arrivals']))
      .curve(d3.curveMonotoneX);
    
    // Add x-axis
    svg.append('g')
      .attr('transform', `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(xScale).ticks(10).tickFormat(d3.format('d')))
      .call(g => g.select('.domain').attr('stroke', COLORS.gray[400]))
      .call(g => g.selectAll('.tick line').attr('stroke', COLORS.gray[300]))
      .call(g => g.selectAll('.tick text').attr('fill', COLORS.gray[700]));
    
    // Add y-axis
    svg.append('g')
      .attr('transform', `translate(${marginLeft},0)`)
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => formatNumber(d as number)))
      .call(g => g.select('.domain').attr('stroke', COLORS.gray[400]))
      .call(g => g.selectAll('.tick line').attr('stroke', COLORS.gray[300]))
      .call(g => g.selectAll('.tick text').attr('fill', COLORS.gray[700]));
    
    // Add grid lines
    svg.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height - marginBottom})`)
      .call(
        d3.axisBottom(xScale)
          .ticks(10)
          .tickSize(-(height - marginTop - marginBottom))
          .tickFormat(() => '')
      )
      .call(g => g.selectAll('.tick line').attr('stroke', COLORS.gray[200]))
      .call(g => g.select('.domain').remove());
    
    // Create color scale for regions
    const colorScale = d3.scaleOrdinal<string>()
      .domain(regions)
      .range([COLORS.primary, COLORS.secondary, COLORS.accent, COLORS.success, COLORS.warning]);
    
    // Add the line paths
    regionsData.forEach(regionData => {
      svg.append('path')
        .datum(regionData.values)
        .attr('fill', 'none')
        .attr('stroke', colorScale(regionData.region))
        .attr('stroke-width', 2)
        .attr('d', line)
        .attr('opacity', 0)
        .transition()
        .duration(1000)
        .attr('opacity', 0.8);
    });
    
    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', marginTop / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', COLORS.gray[800])
      .text('Regional Tourism Trends (1950-2018)');
    
    // Add x-axis label
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', COLORS.gray[700])
      .text('Year');
    
    // Add y-axis label
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(height / 2))
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', COLORS.gray[700])
      .text('Tourist Arrivals');
    
    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - 150}, ${marginTop + 20})`);
    
    regions.forEach((region, i) => {
      const legendRow = legend.append('g')
        .attr('transform', `translate(0, ${i * 20})`);
      
      legendRow.append('rect')
        .attr('width', 10)
        .attr('height', 10)
        .attr('fill', colorScale(region));
      
      legendRow.append('text')
        .attr('x', 15)
        .attr('y', 9)
        .attr('font-size', '10px')
        .attr('fill', COLORS.gray[800])
        .text(region);
    });
    
  }, [data, regions]);

  return (
    <div className="w-full overflow-x-auto">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default RegionalTrends;