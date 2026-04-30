import React from 'react';
import { Card, CardHeader, CardContent } from '@mui/material';
import { useStationState } from '../../stores/stationContext';
import { Avatar } from '@mui/material';
import { Chip } from '@mui/material';
import { SsidChartOutlined } from '@mui/icons-material';

import './style.scss';

function Stat({ label, value, accent }) {
  return (
    <div style={{
      padding: '10px 12px',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 8,
    }}>
      <div style={{
        fontSize: 10, fontWeight: 600, letterSpacing: '0.16em',
        textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)',
      }}>{label}</div>
      <div style={{
        fontSize: 22, fontWeight: 700, lineHeight: 1.1, marginTop: 4,
        fontFamily: "'Fira Code', monospace",
        color: accent ? '#0af5b0' : 'rgba(255,255,255,0.92)',
        textShadow: accent ? '0 0 12px rgba(10,245,176,0.4)' : 'none',
      }}>{value}</div>
    </div>
  );
}

function CpuSparkline({ cpuActivity, height = 220 }) {
  const ref = React.useRef<HTMLCanvasElement | null>(null);
  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth;
    canvas.width = cssW * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.scale(dpr, dpr);
    const W = cssW, H = height;

    ctx.clearRect(0, 0, W, H);

    const padL = 44, padR = 44, padT = 14, padB = 28;
    const innerW = W - padL - padR;
    const innerH = H - padT - padB;

    // grid
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padT + (innerH * i) / 4;
      ctx.beginPath();
      ctx.moveTo(padL, y); ctx.lineTo(W - padR, y);
      ctx.stroke();
    }
    // y labels
    ctx.fillStyle = 'rgba(255,255,255,0.42)';
    ctx.font = '11px "Fira Code", monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = 0; i <= 4; i++) {
      const v = 100 - i * 25;
      const y = padT + (innerH * i) / 4;
      ctx.fillText(v + '%', padL - 8, y);
    }

    // x axis baseline
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.beginPath();
    ctx.moveTo(padL, padT + innerH);
    ctx.lineTo(W - padR, padT + innerH);
    ctx.stroke();

    if (cpuActivity.length < 2) return;

    const pts = cpuActivity.map(({ y }, i: number) => ({
      x: padL + (innerW * i) / (cpuActivity.length - 1),
      y: padT + innerH * (1 - y / 100),
    }));

    // area fill
    const grad = ctx.createLinearGradient(0, padT, 0, padT + innerH);
    grad.addColorStop(0, 'rgba(10,245,176,0.34)');
    grad.addColorStop(1, 'rgba(10,245,176,0.0)');
    ctx.beginPath();
    ctx.moveTo(pts[0].x, padT + innerH);
    pts.forEach((p: { x: number; y: number }) => ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[pts.length - 1].x, padT + innerH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // line
    ctx.strokeStyle = '#0af5b0';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(10,245,176,0.6)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    pts.forEach((p: { x: number; y: number }, i: number) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
    ctx.stroke();
    ctx.shadowBlur = 0;

    // marker dot at last point
    const last = pts[pts.length - 1];
    ctx.fillStyle = '#0af5b0';
    ctx.beginPath();
    ctx.arc(last.x, last.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.85)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // current value floating
    ctx.fillStyle = 'rgba(10,245,176,0.95)';
    ctx.font = '600 12px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(cpuActivity[cpuActivity.length - 1].y.toFixed(0) + '%', last.x + 8, last.y - 4);

    // x label
    ctx.fillStyle = 'rgba(255,255,255,0.42)';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TIME →', W / 2, H - 8);
  }, [cpuActivity, height]);

  return <canvas ref={ref} style={{ width: '100%', height, display: 'block' }} />;
}

export default function SparkLineWidget() {
  const cpuActivity = useStationState((s) => s.cpuActivity);

  const current = cpuActivity[cpuActivity.length - 1].y || 0;
  const peak = Math.max(...cpuActivity.map(({ y }) => y), 0);
  const avg = cpuActivity.length ? cpuActivity.reduce((a, { y }) => a + y, 0) / cpuActivity.length : 0;

  return (
    <Card className="background" id="cpuActivity">
      <CardHeader
        avatar={<Avatar sx={{ color: '#0af5b0', bgcolor: 'rgba(10,245,176,0.15)' }}><SsidChartOutlined /></Avatar>}
        title="CPU Activity"
        subheader="REAL-TIME % USAGE"
        action={<>
          <Chip label="LIVE" size="small" icon={<span className="live-dot" />} />
        </>}
      />
      <CardContent>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12, marginBottom: 14,
        }}>
          <Stat label="CURRENT" value={current.toFixed(0) + '%'} accent />
          <Stat label="PEAK"    value={peak.toFixed(0) + '%'} accent={false} />
          <Stat label="AVG"     value={avg.toFixed(0) + '%'} accent={false} />
        </div>
        <CpuSparkline cpuActivity={cpuActivity} height={220} />
      </CardContent>
    </Card>
  );
}