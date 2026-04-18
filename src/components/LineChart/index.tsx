import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Avatar, Card, CardContent, CardHeader } from '@mui/material';
import { SsidChartOutlined } from '@mui/icons-material';

interface DataPoint {
    x: number | string | Date;
    y: number;
}

interface LineSeries {
    id?: string;
    label?: string;
    data: DataPoint[];
    strokeColor?: string;
    strokeWidth?: number;
}

type LineChartData = DataPoint[] | LineSeries[];

interface LineChartProps {
    title?: string;
    data: LineChartData;
    maxDataPoints?: number;
    minValue?: number;
    maxValue?: number;
    width?: number;
    height?: number;
    margin?: { top: number; right: number; bottom: number; left: number };
    xLabel?: string;
    yLabel?: string;
    strokeColor?: string;
    strokeWidth?: number;
}

const isLineSeriesArray = (data: LineChartData): data is LineSeries[] => {
    return (
        Array.isArray(data) &&
        data.length > 0 &&
        (data as LineSeries[]).every((series) => Array.isArray(series.data))
    );
};

export default function LineChart(props: LineChartProps) {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [containerWidth, setContainerWidth] = useState(800);

    const title = props.title || 'Line Chart';
    const width = props.width || containerWidth;
    const height = props.height || 400;
    const margin = props.margin || {
        top: 20,
        right: 30,
        bottom: 40,
        left: 60,
    };
    const strokeColor = props.strokeColor || '#2563eb';
    const strokeWidth = props.strokeWidth || 2;

    const rollingData = useMemo<LineChartData>(() => {
        const source = props.data;
        const maxPoints = props.maxDataPoints;

        if (!maxPoints) {
            return source;
        }

        if (isLineSeriesArray(source)) {
            return source.map((series) => {
                if (series.data.length <= maxPoints) {
                    return series;
                }
                return {
                    ...series,
                    data: series.data.slice(-maxPoints),
                };
            });
        }

        if (source.length <= maxPoints) {
            return source;
        }

        return source.slice(-maxPoints);
    }, [props.data, props.maxDataPoints]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || typeof ResizeObserver === 'undefined') return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const entryWidth = entry.contentRect.width;
                if (entryWidth > 0) {
                    setContainerWidth(entryWidth);
                }
            }
        });

        resizeObserver.observe(container);
        setContainerWidth(container.clientWidth || 800);

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    useEffect(() => {
        const svg = svgRef.current;
        if (!svg) return;

        let seriesList: LineSeries[];
        if (isLineSeriesArray(rollingData)) {
            seriesList = rollingData;
        } else {
            seriesList = [
                {
                    id: 'series-0',
                    data: rollingData,
                    strokeColor: props.strokeColor,
                    strokeWidth: props.strokeWidth,
                },
            ];
        }

        if (seriesList.length === 0) return;

        const allPoints = seriesList.flatMap((series) => series.data);
        if (allPoints.length === 0) return;

        d3.select(svg).selectAll('*').remove();

        const d3svg = d3.select(svg);
        const w = width;
        const h = height;
        const m = margin;
        const innerWidth = w - m.left - m.right;
        const innerHeight = h - m.top - m.bottom;

        d3svg.attr('width', w).attr('height', h);

        const g = d3svg
            .append('g')
            .attr('transform', `translate(${m.left},${m.top})`);

        const xValuesAreDates = allPoints.every((d) => d.x instanceof Date);
        const xValuesAreNumeric = allPoints.every(
            (d) => typeof d.x === 'number',
        );

        let xScale:
            | d3.ScaleTime<number, number>
            | d3.ScaleLinear<number, number>
            | d3.ScalePoint<string>;

        if (xValuesAreDates) {
            xScale = d3
                .scaleTime()
                .domain(
                    d3.extent(allPoints, (d) => d.x as Date) as [Date, Date],
                )
                .range([0, innerWidth]);
        } else if (xValuesAreNumeric) {
            xScale = d3
                .scaleLinear()
                .domain(
                    d3.extent(allPoints, (d) => d.x as number) as [
                        number,
                        number,
                    ],
                )
                .range([0, innerWidth]);
        } else {
            xScale = d3
                .scalePoint<string>()
                .domain(Array.from(new Set(allPoints.map((d) => String(d.x)))))
                .range([0, innerWidth])
                .padding(0.1);
        }

        if (props.minValue === undefined || props.maxValue === undefined) {
            return;
        }

        const yScale = d3
            .scaleLinear()
            .domain([props.minValue, props.maxValue])
            .nice()
            .range([innerHeight, 0]);

        const line = d3
            .line<DataPoint>()
            .x((d) => {
                if (xValuesAreDates) {
                    return (xScale as d3.ScaleTime<number, number>)(
                        d.x as Date,
                    );
                } else if (xValuesAreNumeric) {
                    return (xScale as d3.ScaleLinear<number, number>)(
                        d.x as number,
                    );
                } else {
                    return (
                        (xScale as d3.ScalePoint<string>)(String(d.x)) || 0
                    );
                }
            })
            .y((d) => yScale(d.y))
            .curve(d3.curveMonotoneX);

        const xAxis = d3.axisBottom(xScale as d3.AxisScale<d3.AxisDomain>);
        const yAxis = d3.axisLeft(yScale);

        g.append('g')
            .attr('transform', `translate(0,${innerHeight})`)
            .call(xAxis)
            .call((g) => g.select('.domain').attr('stroke', '#e5e7eb'))
            .call((g) => g.selectAll('.tick line').attr('stroke', '#e5e7eb'))
            .call((g) => g.selectAll('.tick text').attr('fill', '#6b7280'));

        g.append('g')
            .call(yAxis)
            .call((g) => g.select('.domain').attr('stroke', '#e5e7eb'))
            .call((g) => g.selectAll('.tick line').attr('stroke', '#e5e7eb'))
            .call((g) => g.selectAll('.tick text').attr('fill', '#6b7280'));

        if (props.xLabel) {
            g.append('text')
                .attr(
                    'transform',
                    `translate(${innerWidth / 2}, ${innerHeight + 35})`,
                )
                .style('text-anchor', 'middle')
                .style('fill', '#d0d0d0')
                .style('font-size', '12px')
                .text(props.xLabel);
        }

        if (props.yLabel) {
            g.append('text')
                .attr('transform', 'rotate(-90)')
                .attr('y', -m.left + 15)
                .attr('x', -innerHeight / 2)
                .style('text-anchor', 'middle')
                .style('fill', '#d0d0d0')
                .style('font-size', '12px')
                .text(props.yLabel);
        }

        const seriesKeys = seriesList.map(
            (series, index) =>
                series.id || series.label || `series-${index}`,
        );
        const palette =
            (d3.schemeTableau10 as readonly string[] | undefined) ??
            (d3.schemeCategory10 as readonly string[] | undefined);
        const colorScale = palette
            ? d3
                  .scaleOrdinal<string, string>()
                  .domain(seriesKeys)
                  .range(Array.from(palette))
            : undefined;

        seriesList.forEach((series, index) => {
            const seriesKey = seriesKeys[index];
            const color =
                series.strokeColor ??
                (colorScale ? colorScale(seriesKey) : strokeColor);
            const seriesStrokeWidth = series.strokeWidth ?? strokeWidth;

            g.append('path')
                .datum(series.data)
                .attr('fill', 'none')
                .attr('stroke', color)
                .attr('stroke-width', seriesStrokeWidth)
                .attr('d', line);

            g.append('g')
                .selectAll('circle')
                .data(series.data)
                .enter()
                .append('circle')
                .attr('cx', (d: DataPoint) => {
                    if (xValuesAreDates) {
                        return (xScale as d3.ScaleTime<number, number>)(
                            d.x as Date,
                        );
                    } else if (xValuesAreNumeric) {
                        return (xScale as d3.ScaleLinear<number, number>)(
                            d.x as number,
                        );
                    } else {
                        return (
                            (xScale as d3.ScalePoint<string>)(String(d.x)) ||
                            0
                        );
                    }
                })
                .attr('cy', (d: DataPoint) => yScale(d.y))
                .attr('r', 2)
                .attr('fill', color)
                .attr('stroke', '#fff')
                .attr('stroke-width', 1);
        });
    }, [
        rollingData,
        width,
        height,
        margin,
        strokeColor,
        strokeWidth,
        props.minValue,
        props.maxValue,
        props.xLabel,
        props.yLabel,
        props.strokeColor,
        props.strokeWidth,
    ]);

    return (
        <Card className="background">
            <CardHeader
                title={title}
                slotProps={{ title: { variant: 'h5', noWrap: true } }}
                avatar={
                    <Avatar>
                        <SsidChartOutlined />
                    </Avatar>
                }
            />
            <CardContent ref={containerRef} style={{ width: '100%' }}>
                <svg
                    ref={svgRef}
                    style={{
                        display: 'block',
                        width: '100%',
                        height: 'auto',
                    }}
                />
            </CardContent>
        </Card>
    );
}
