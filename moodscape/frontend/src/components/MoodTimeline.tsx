import { FC, useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface MoodData {
  date: string;
  score: number;
  emotion: string;
}

interface MoodTimelineProps {
  moodData: MoodData[];
}

const MoodTimeline: FC<MoodTimelineProps> = ({ moodData }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !moodData.length) return;

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Parse dates and create scales
    const parseDate = d3.timeParse('%Y-%m-%d');
    const dates = moodData.map(d => parseDate(d.date) as Date);

    const x = d3
      .scaleTime()
      .domain(d3.extent(dates) as [Date, Date])
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([0, 10])
      .range([height, 0]);

    // Create line generator
    const line = d3
      .line<MoodData>()
      .x(d => x(parseDate(d.date) as Date))
      .y(d => y(d.score))
      .curve(d3.curveMonotoneX);

    // Add axes
    svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x));

    svg.append('g').call(d3.axisLeft(y));

    // Add line path
    svg
      .append('path')
      .datum(moodData)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add data points with color based on emotion
    svg
      .selectAll('.dot')
      .data(moodData)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => x(parseDate(d.date) as Date))
      .attr('cy', d => y(d.score))
      .attr('r', 6)
      .attr('fill', d => {
        switch (d.emotion) {
          case 'angry': return '#e25858';
          case 'sad': return '#7b69b8';
          case 'neutral': return '#a0aec0';
          case 'calm': return '#4f8fba';
          case 'happy': return '#e2c458';
          case 'excited': return '#e27e58';
          default: return '#a0aec0';
        }
      });

    // Add tooltips with dates and scores
    svg
      .selectAll('.dot-label')
      .data(moodData)
      .enter()
      .append('text')
      .attr('class', 'dot-label')
      .attr('x', d => x(parseDate(d.date) as Date) + 8)
      .attr('y', d => y(d.score) - 8)
      .text(d => d.score.toString())
      .attr('font-size', '0.7rem')
      .attr('fill', 'white');

  }, [moodData]);

  return (
    <div className="bg-gray-800 p-5 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Mood Timeline</h2>
      <svg ref={svgRef} width="100%" height="300" />
    </div>
  );
};

export default MoodTimeline; 