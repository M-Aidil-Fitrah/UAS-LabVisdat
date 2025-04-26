import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { COLORS, CHART_DIMENSIONS } from '../constants';
import { getTopCountriesByYear, formatNumber } from '../utils/dataUtils';

interface BarChartProps {
  data: any[];
  year: number;
  metric: string;
}

const BarChart: React.FC<BarChartProps> = ({ data, year, metric }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!data.length) return;
    
    // Get top 10 countries for the selected year
    const topCountries = getTopCountriesByYear(data, year, metric, 10);
    
    if (topCountries.length === 0) return;
    
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
    
    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(topCountries, d => d[metric]) || 0])
      .nice()
      .range([marginLeft, width - marginRight]);
    
    const yScale = d3.scaleBand()
      .domain(topCountries.map(d => d.Entity))
      .range([marginTop, height - marginBottom])
      .padding(0.2);
    
    // Add x-axis
    svg.append('g')
      .attr('transform', `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => formatNumber(d as number)))
      .call(g => g.select('.domain').attr('stroke', COLORS.gray[400]))
      .call(g => g.selectAll('.tick line').attr('stroke', COLORS.gray[300]))
      .call(g => g.selectAll('.tick text').attr('fill', COLORS.gray[700]));
    
    // Add y-axis
    svg.append('g')
      .attr('transform', `translate(${marginLeft},0)`)
      .call(d3.axisLeft(yScale))
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line').remove())
      .call(g => g.selectAll('.tick text')
        .attr('fill', COLORS.gray[700])
        .attr('font-size', '10px')
        .each(function(this: any) {
          const text = d3.select(this);
          const words = text.text().split(/\s+/);
          const y = text.attr('y');
          const dy = parseFloat(text.attr('dy'));
          const lineHeight = 1.1; // ems
          
          text.text(null);
          
          words.forEach((word, i) => {
            text.append('tspan')
              .attr('x', -5)
              .attr('y', y)
              .attr('dy', `${i * lineHeight + dy}em`)
              .text(word);
          });
        }));
    
    // Add grid lines
    svg.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height - marginBottom})`)
      .call(
        d3.axisBottom(xScale)
          .ticks(5)
          .tickSize(-(height - marginTop - marginBottom))
          .tickFormat(() => '')
      )
      .call(g => g.selectAll('.tick line').attr('stroke', COLORS.gray[200]))
      .call(g => g.select('.domain').remove());
    
    // Add bars
    svg.selectAll('.bar')
      .data(topCountries)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', marginLeft)
      .attr('y', d => yScale(d.Entity) || 0)
      .attr('height', yScale.bandwidth())
      .attr('width', 0)
      .attr('fill', COLORS.secondary)
      .transition()
      .duration(1000)
      .attr('width', d => xScale(d[metric]) - marginLeft);
    
    // Add value labels
    svg.selectAll('.value-label')
      .data(topCountries)
      .enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('x', d => xScale(d[metric]) + 5)
      .attr('y', d => (yScale(d.Entity) || 0) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('font-size', '10px')
      .attr('fill', COLORS.gray[700])
      .text(d => formatNumber(d[metric]))
      .attr('opacity', 0)
      .transition()
      .delay(1000)
      .duration(500)
      .attr('opacity', 1);
    
    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', marginTop / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', COLORS.gray[800])
      .text(`Top Countries in ${year}`);
    
  }, [data, year, metric]);

  return (
    <div className="w-full overflow-x-auto">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default BarChart;