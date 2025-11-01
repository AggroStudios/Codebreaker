import { onMount, onCleanup, createEffect, createSignal, createMemo } from 'solid-js';
import * as d3 from 'd3';
import { Card, CardContent, CardHeader } from '@suid/material';

interface DataPoint {
    x: number | string | Date;
    y: number;
}

interface LineChartProps {
    data: DataPoint[];
    maxDataPoints?: number;
    width?: number;
    height?: number;
    margin?: { top: number; right: number; bottom: number; left: number };
    xLabel?: string;
    yLabel?: string;
    strokeColor?: string;
    strokeWidth?: number;
}

export default function LineChart(props: LineChartProps) {
    let svgRef: SVGSVGElement | undefined;
    let containerRef: HTMLDivElement | undefined;
    let resizeObserver: ResizeObserver | undefined;
    const [containerWidth, setContainerWidth] = createSignal(800);

    const width = () => props.width || containerWidth();
    const height = () => props.height || 400;
    const margin = () => props.margin || { top: 20, right: 30, bottom: 40, left: 60 };
    const strokeColor = () => props.strokeColor || '#2563eb';
    const strokeWidth = () => props.strokeWidth || 2;

    // Rolling data: keep only the most recent maxDataPoints
    const rollingData = createMemo(() => {
        if (!props.maxDataPoints || props.data.length <= props.maxDataPoints) {
            return props.data;
        }
        // Return the last maxDataPoints items
        return props.data.slice(-props.maxDataPoints);
    });

    const createChart = () => {
        const chartData = rollingData();
        if (!svgRef || !chartData || chartData.length === 0) return;

        // Clear previous content
        d3.select(svgRef).selectAll('*').remove();

        const svg = d3.select(svgRef);
        const w = width();
        const h = height();
        const m = margin();
        const innerWidth = w - m.left - m.right;
        const innerHeight = h - m.top - m.bottom;

        // Set SVG dimensions
        svg.attr('width', w).attr('height', h);

        // Create main group
        const g = svg
            .append('g')
            .attr('transform', `translate(${m.left},${m.top})`);

        // Determine if x values are dates or numbers
        const isDate = chartData.some(d => d.x instanceof Date);
        const isNumeric = typeof chartData[0]?.x === 'number';

        // Set up scales
        let xScale: d3.ScaleTime<number, number> | d3.ScaleLinear<number, number> | d3.ScalePoint<string>;
        
        if (isDate) {
            xScale = d3
                .scaleTime()
                .domain(d3.extent(chartData, d => d.x as Date) as [Date, Date])
                .range([0, innerWidth]);
        } else if (isNumeric) {
            xScale = d3
                .scaleLinear()
                .domain(d3.extent(chartData, d => d.x as number) as [number, number])
                .range([0, innerWidth]);
        } else {
            xScale = d3
                .scalePoint<string>()
                .domain(chartData.map(d => String(d.x)))
                .range([0, innerWidth])
                .padding(0.1);
        }

        const yExtent = d3.extent(chartData, d => d.y) as [number, number];
        const yScale = d3
            .scaleLinear()
            .domain(yExtent)
            .nice()
            .range([innerHeight, 0]);

        // Create line generator
        const line = d3
            .line<DataPoint>()
            .x(d => {
                if (isDate || isNumeric) {
                    return xScale(d.x as number | Date) as number;
                }
                return (xScale as d3.ScalePoint<string>)(String(d.x)) || 0;
            })
            .y(d => yScale(d.y))
            .curve(d3.curveMonotoneX);

        // Add axes
        const xAxis = d3.axisBottom(xScale as d3.AxisScale<d3.AxisDomain>);
        const yAxis = d3.axisLeft(yScale);

        g.append('g')
            .attr('transform', `translate(0,${innerHeight})`)
            .call(xAxis)
            .call(g => g.select('.domain').attr('stroke', '#e5e7eb'))
            .call(g => g.selectAll('.tick line').attr('stroke', '#e5e7eb'))
            .call(g => g.selectAll('.tick text').attr('fill', '#6b7280'));

        g.append('g')
            .call(yAxis)
            .call(g => g.select('.domain').attr('stroke', '#e5e7eb'))
            .call(g => g.selectAll('.tick line').attr('stroke', '#e5e7eb'))
            .call(g => g.selectAll('.tick text').attr('fill', '#6b7280'));

        // Add axis labels
        if (props.xLabel) {
            g.append('text')
                .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + 35})`)
                .style('text-anchor', 'middle')
                .style('fill', '#374151')
                .style('font-size', '12px')
                .text(props.xLabel);
        }

        if (props.yLabel) {
            g.append('text')
                .attr('transform', 'rotate(-90)')
                .attr('y', -m.left + 15)
                .attr('x', -innerHeight / 2)
                .style('text-anchor', 'middle')
                .style('fill', '#374151')
                .style('font-size', '12px')
                .text(props.yLabel);
        }

        // Draw the line
        g.append('path')
            .datum(chartData)
            .attr('fill', 'none')
            .attr('stroke', strokeColor())
            .attr('stroke-width', strokeWidth())
            .attr('d', line);

        // Add data points as circles
        g.selectAll('circle')
            .data(chartData)
            .enter()
            .append('circle')
            .attr('cx', d => {
                if (isDate || isNumeric) {
                    return xScale(d.x as number | Date) as number;
                }
                return (xScale as d3.ScalePoint<string>)(String(d.x)) || 0;
            })
            .attr('cy', d => yScale(d.y))
            .attr('r', 4)
            .attr('fill', strokeColor())
            .attr('stroke', '#fff')
            .attr('stroke-width', 2);
    };

    onMount(() => {
        // Handle responsive resizing by observing the container
        if (containerRef && typeof ResizeObserver !== 'undefined') {
            resizeObserver = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    const width = entry.contentRect.width;
                    if (width > 0) {
                        setContainerWidth(width);
                    }
                }
                createChart();
            });
            resizeObserver.observe(containerRef);
            
            // Set initial width
            if (containerRef) {
                setContainerWidth(containerRef.clientWidth || 800);
            }
        }
    });

    onCleanup(() => {
        if (resizeObserver) {
            resizeObserver.disconnect();
        }
    });

    // Recreate chart when data or props change
    createEffect(() => {
        // Access reactive props to track them
        rollingData(); // Track the computed rolling data
        width();
        containerWidth();
        height();
        margin();
        strokeColor();
        strokeWidth();
        createChart();
    });

    return (
        <Card>
            <CardHeader title="Line Chart" />
            <CardContent ref={containerRef} style="width: 100%;">
                <svg ref={svgRef} style="display: block; width: 100%; height: auto;"></svg>
            </CardContent>
        </Card>
    );
}