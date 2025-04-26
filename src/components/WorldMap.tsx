import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import { GeoFeature } from '../types';
import { COLORS } from '../constants';
import { formatNumber } from '../utils/dataUtils';

interface WorldMapProps {
  data: any[];
  year: number;
  metric: string;
}

const WorldMap: React.FC<WorldMapProps> = ({ data, year, metric }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!data.length) return;
    
    const drawMap = async () => {
      // Clear previous map
      if (svgRef.current) {
        d3.select(svgRef.current).selectAll('*').remove();
      }
      
      // Load world topology
      const worldData = await fetch('/data/world-topo.json').then(res => res.json());
      const countries = feature(worldData, worldData.objects.countries) as { type: string; features: GeoFeature[] };
      
      // Filter data for the selected year
      const yearData = data.filter(d => d.Year === year);
      
      // Calculate bounds based on available width
      const container = d3.select(svgRef.current).node() as HTMLElement;
      const width = container.getBoundingClientRect().width;
      const height = Math.min(500, width * 0.6);
      
      // Set up the projection
      const projection = geoNaturalEarth1()
        .fitSize([width, height], countries);
      
      const path = geoPath().projection(projection);
      
      // Set up the SVG
      const svg = d3.select(svgRef.current)
        .attr('width', width)
        .attr('height', height);
      
      // Create color scale
      const metricValues = yearData.map(d => d[metric]);
      const maxValue = d3.max(metricValues) || 0;
      
      const colorScale = d3.scaleSequential()
        .domain([0, maxValue])
        .interpolator(d3.interpolate(COLORS.gray[100], COLORS.primary));
      
      // Draw countries
      svg.selectAll('path')
        .data(countries.features)
        .enter()
        .append('path')
        .attr('d', path as any)
        .attr('fill', d => {
          const countryData = yearData.find(item => item.Code === d.properties.code);
          return countryData ? colorScale(countryData[metric]) : COLORS.gray[200];
        })
        .attr('stroke', COLORS.gray[300])
        .attr('stroke-width', 0.5)
        .on('mouseover', (event, d) => {
          const countryData = yearData.find(item => item.Code === d.properties.code);
          
          if (countryData) {
            d3.select(event.currentTarget)
              .attr('stroke', COLORS.accent)
              .attr('stroke-width', 1.5);
            
            const tooltip = d3.select(tooltipRef.current);
            tooltip.style('display', 'block')
              .style('left', `${event.pageX + 10}px`)
              .style('top', `${event.pageY + 10}px`);
            
            tooltip.html(`
              <strong>${d.properties.name}</strong><br/>
              ${metric}: ${formatNumber(countryData[metric])}
            `);
          }
        })
        .on('mouseout', (event) => {
          d3.select(event.currentTarget)
            .attr('stroke', COLORS.gray[300])
            .attr('stroke-width', 0.5);
          
          d3.select(tooltipRef.current).style('display', 'none');
        });
      
      // Add a legend
      const legendWidth = 200;
      const legendHeight = 15;
      const legend = svg.append('g')
        .attr('transform', `translate(${width - legendWidth - 20}, ${height - 40})`);
      
      // Create gradient for legend
      const defs = svg.append('defs');
      const linearGradient = defs.append('linearGradient')
        .attr('id', 'legend-gradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%');
      
      linearGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', COLORS.gray[100]);
      
      linearGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', COLORS.primary);
      
      // Add legend rectangle
      legend.append('rect')
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .style('fill', 'url(#legend-gradient)');
      
      // Add legend labels
      legend.append('text')
        .attr('x', 0)
        .attr('y', legendHeight + 15)
        .text('0')
        .attr('font-size', '10px')
        .attr('text-anchor', 'start');
      
      legend.append('text')
        .attr('x', legendWidth)
        .attr('y', legendHeight + 15)
        .text(formatNumber(maxValue))
        .attr('font-size', '10px')
        .attr('text-anchor', 'end');
    };
    
    drawMap();
    
    // Redraw map on window resize
    const handleResize = () => {
      drawMap();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [data, year, metric]);

  return (
    <div className="relative">
      <svg ref={svgRef}></svg>
      <div 
        ref={tooltipRef} 
        className="absolute hidden bg-white p-2 rounded shadow-md border border-gray-200 z-10 text-sm"
        style={{ pointerEvents: 'none' }}
      ></div>
    </div>
  );
};

export default WorldMap;