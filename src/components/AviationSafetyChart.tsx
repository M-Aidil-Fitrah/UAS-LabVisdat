import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { COLORS, CHART_DIMENSIONS } from '../constants';

interface AviationSafetyChartProps {
  data: any[];
  metric: string;
}

const AviationSafetyChart: React.FC<AviationSafetyChartProps> = ({ data, metric }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!data.length) return;
    
    // Filter data for the world
    const worldData = data
      .filter(d => d.Entity === 'World')
      .sort((a, b) => a.Year - b.Year);
    
    if (worldData.length === 0) return;
    
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
      .domain([d3.min(worldData, d => d.Year) || 1970, d3.max(worldData, d => d.Year) || 2020])
      .range([marginLeft, width - marginRight]);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(worldData, d => d[metric]) || 0])
      .nice()
      .range([height - marginBottom, marginTop]);
    
    // Create line generator
    const line = d3.line<any>()
      .x(d => xScale(d.Year))
      .y(d => yScale(d[metric]))
      .curve(d3.curveMonotoneX);
    
    // Create area generator for the area below the line
    const area = d3.area<any>()
      .x(d => xScale(d.Year))
      .y0(height - marginBottom)
      .y1(d => yScale(d[metric]))
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
      .call(d3.axisLeft(yScale).ticks(5))
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
    
    // Add area
    svg.append('path')
      .datum(worldData)
      .attr('fill', COLORS.primary)
      .attr('fill-opacity', 0.2)
      .attr('d', area)
      .attr('opacity', 0)
      .transition()
      .duration(1000)
      .attr('opacity', 1);
    
    // Add line
    svg.append('path')
      .datum(worldData)
      .attr('fill', 'none')
      .attr('stroke', COLORS.primary)
      .attr('stroke-width', 2)
      .attr('d', line)
      .attr('opacity', 0)
      .transition()
      .duration(1000)
      .attr('opacity', 1);
    
    // Add dots for each data point
    svg.selectAll('.dot')
      .data(worldData)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.Year))
      .attr('cy', d => yScale(d[metric]))
      .attr('r', 3)
      .attr('fill', COLORS.primary)
      .attr('opacity', 0)
      .transition()
      .duration(1000)
      .attr('opacity', 1);
    
    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', marginTop / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', COLORS.gray[800])
      .text(metric);
    
    // Add x-axis label
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', COLORS.gray[700])
      .text('Year');
    
    // Add tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background-color', 'white')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('opacity', 0);
    
    // Add hover interactions
    svg.selectAll('.hover-area')
      .data(worldData)
      .enter()
      .append('rect')
      .attr('class', 'hover-area')
      .attr('x', d => xScale(d.Year) - 5)
      .attr('y', marginTop)
      .attr('width', 10)
      .attr('height', height - marginTop - marginBottom)
      .attr('fill', 'transparent')
      .on('mouseover', (event, d) => {
        tooltip.transition()
          .duration(200)
          .style('opacity', 0.9);
        
        tooltip.html(`
          <strong>${d.Year}</strong><br/>
          ${metric}: ${d[metric].toFixed(2)}
        `)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 28}px`);
        
        svg.selectAll('.dot')
          .filter(dot => dot.Year === d.Year)
          .attr('r', 5)
          .attr('fill', COLORS.accent);
      })
      .on('mouseout', () => {
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
        
        svg.selectAll('.dot')
          .attr('r', 3)
          .attr('fill', COLORS.primary);
      });
    
    // Add annotation for significant improvement
    const midPoint = worldData.find(d => d.Year === 1995);
    const endPoint = worldData.find(d => d.Year === 2020);
    
    if (midPoint && endPoint) {
      const improvementPercentage = ((midPoint[metric] - endPoint[metric]) / midPoint[metric] * 100).toFixed(0);
      
      svg.append('text')
        .attr('x', width - marginRight - 100)
        .attr('y', marginTop + 30)
        .attr('text-anchor', 'start')
        .attr('font-size', '12px')
        .attr('fill', COLORS.success)
        .text(`${improvementPercentage}% improvement`)
        .attr('opacity', 0)
        .transition()
        .delay(1000)
        .duration(500)
        .attr('opacity', 1);
    }
    
    return () => {
      tooltip.remove();
    };
  }, [data, metric]);

  return (
    <div className="w-full overflow-x-auto">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default AviationSafetyChart;