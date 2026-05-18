import { useEffect, useMemo, useRef } from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { ShowChartTwoTone } from '@mui/icons-material';

import StationCard, { StationCardAccentType } from '../StationCard';
import { useNetworksStore } from '../../stores/networks';
import { formatGbps } from '../../lib/utils';

interface TrafficSparklineProps {
    inData: number[];
    outData: number[];
    height?: number;
}

function TrafficSparkline({ inData, outData, height = 220 }: TrafficSparklineProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const cssW = canvas.clientWidth;
        if (!cssW) return;
        canvas.width = Math.round(cssW * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const W = cssW;
        const H = height;
        const padL = 52;
        const padR = 16;
        const padT = 14;
        const padB = 28;
        const innerW = W - padL - padR;
        const innerH = H - padT - padB;

        ctx.clearRect(0, 0, W, H);

        const maxV = Math.max(100, ...inData, ...outData);

        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        ctx.font = '11px "Fira Code", monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.42)';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (let i = 0; i <= 4; i += 1) {
            const y = padT + (innerH * i) / 4;
            ctx.beginPath();
            ctx.moveTo(padL, y);
            ctx.lineTo(W - padR, y);
            ctx.stroke();
            const v = Math.round(maxV - (maxV * i) / 4);
            ctx.fillText(`${v} Gbps`, padL - 6, y);
        }

        // Baseline
        ctx.strokeStyle = 'rgba(255,255,255,0.10)';
        ctx.beginPath();
        ctx.moveTo(padL, H - padB);
        ctx.lineTo(W - padR, H - padB);
        ctx.stroke();

        const drawSeries = (series: number[], stroke: string, fillTop: string, fillBottom: string) => {
            if (series.length === 0) return;
            const xStep = innerW / Math.max(1, series.length - 1);
            const pointAt = (idx: number, val: number) => {
                const x = padL + idx * xStep;
                const y = padT + innerH * (1 - val / maxV);
                return { x, y };
            };

            // Fill under curve
            const grad = ctx.createLinearGradient(0, padT, 0, H - padB);
            grad.addColorStop(0, fillTop);
            grad.addColorStop(1, fillBottom);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(padL, H - padB);
            series.forEach((v, i) => {
                const { x, y } = pointAt(i, v);
                if (i === 0) ctx.lineTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.lineTo(padL + innerW, H - padB);
            ctx.closePath();
            ctx.fill();

            // Line with glow
            ctx.strokeStyle = stroke;
            ctx.lineWidth = 2;
            ctx.shadowColor = stroke;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            series.forEach((v, i) => {
                const { x, y } = pointAt(i, v);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.stroke();
            ctx.shadowBlur = 0;

            // End dot
            const last = series[series.length - 1];
            const { x, y } = pointAt(series.length - 1, last);
            ctx.fillStyle = stroke;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(0,0,0,0.85)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        };

        drawSeries(outData, '#26c6da', 'rgba(38,198,218,0.30)', 'rgba(38,198,218,0)');
        drawSeries(inData,  '#0af5b0', 'rgba(10,245,176,0.34)', 'rgba(10,245,176,0)');

        // X-axis label
        ctx.fillStyle = 'rgba(255,255,255,0.42)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText('TIME →', padL + innerW / 2, H - 6);
    }, [inData, outData, height]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                width: '100%',
                height,
                display: 'block',
            }}
        />
    );
}

interface MiniMetricProps {
    label: string;
    value: string;
    color?: 'accent' | 'cyan' | 'neutral';
}

function MiniMetric({ label, value, color = 'neutral' }: MiniMetricProps) {
    const hex = color === 'accent' ? '#0af5b0' : color === 'cyan' ? '#26c6da' : 'rgba(255,255,255,0.92)';
    return (
        <Box
            sx={{
                flex: 1,
                p: '10px 12px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '10px',
            }}
        >
            <Typography
                sx={{
                    fontSize: 9,
                    fontWeight: 600,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.5)',
                    mb: 0.5,
                }}
            >
                {label}
            </Typography>
            <Typography
                sx={{
                    fontFamily: 'Fira Code, monospace',
                    fontSize: 16,
                    fontWeight: 700,
                    color: hex,
                    lineHeight: 1.1,
                }}
            >
                {value}
            </Typography>
        </Box>
    );
}

export default function NetworkTrafficCard() {
    const trafficIn = useNetworksStore((s) => s.trafficIn);
    const trafficOut = useNetworksStore((s) => s.trafficOut);

    const { inNow, outNow, inAvg } = useMemo(() => {
        const last = trafficIn[trafficIn.length - 1] ?? 0;
        const lastOut = trafficOut[trafficOut.length - 1] ?? 0;
        const nonZero = trafficIn.filter((v) => v > 0);
        const avg = nonZero.length === 0 ? 0 : nonZero.reduce((a, b) => a + b, 0) / nonZero.length;
        return { inNow: last, outNow: lastOut, inAvg: avg };
    }, [trafficIn, trafficOut]);

    return (
        <StationCard
            avatar={ShowChartTwoTone}
            accent={StationCardAccentType.ACCENT}
            title="Network Traffic"
            subheader="REAL-TIME · Gbps"
            headerAction={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 14, height: 2, background: '#0af5b0', borderRadius: 1 }} />
                        <Typography
                            sx={{
                                fontFamily: 'Fira Code, monospace',
                                fontSize: 10,
                                color: '#0af5b0',
                                letterSpacing: '0.14em',
                            }}
                        >
                            IN
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 14, height: 2, background: '#26c6da', borderRadius: 1 }} />
                        <Typography
                            sx={{
                                fontFamily: 'Fira Code, monospace',
                                fontSize: 10,
                                color: '#26c6da',
                                letterSpacing: '0.14em',
                            }}
                        >
                            OUT
                        </Typography>
                    </Box>
                    <Chip
                        label="LIVE"
                        size="small"
                        variant="outlined"
                        className="accent"
                        icon={<span className="live-dot" />}
                    />
                </Box>
            }
            content={
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', gap: 1.25 }}>
                        <MiniMetric label="IN" value={formatGbps(Math.round(inNow))} color="accent" />
                        <MiniMetric label="OUT" value={formatGbps(Math.round(outNow))} color="cyan" />
                        <MiniMetric label="AVG IN" value={formatGbps(Math.round(inAvg))} />
                    </Box>
                    <TrafficSparkline inData={trafficIn} outData={trafficOut} />
                </Box>
            }
        />
    );
}
