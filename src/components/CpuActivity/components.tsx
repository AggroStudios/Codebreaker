import React from 'react';

export function CpuSparkline({ cpuActivity, height = 220 }: { cpuActivity: { x: number; y: number }[], height?: number }) {
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