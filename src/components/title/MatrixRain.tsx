import { useEffect, useRef } from 'react';

const GLYPHS = '01ABCDEF{}[]<>/\\|=+-_'.split('');

export default function MatrixRain() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let w = 0;
        let h = 0;
        let cols = 0;
        let fontSize = 0;
        let drops: number[] = [];
        let speeds: number[] = [];
        let frame = 0;
        let rafId = 0;

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            w = canvas.width = window.innerWidth * dpr;
            h = canvas.height = window.innerHeight * dpr;
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
            fontSize = 18 * dpr;
            cols = Math.ceil(w / (fontSize * 2.2));
            drops = Array.from({ length: cols }, () => (Math.random() * -h) / fontSize);
            speeds = Array.from({ length: cols }, () => 0.1 + Math.random() * 0.18);
        };

        const draw = () => {
            frame += 1;
            ctx.fillStyle = 'rgba(10, 14, 16, 0.18)';
            ctx.fillRect(0, 0, w, h);
            ctx.font = `${fontSize}px "Fira Code", monospace`;
            const colStride = fontSize * 2.2;
            for (let i = 0; i < cols; i += 1) {
                if ((frame + i) % 2 !== 0) continue;
                const ch = GLYPHS[(Math.random() * GLYPHS.length) | 0];
                const x = i * colStride + (i % 2 === 0 ? fontSize * 0.6 : 0);
                const y = drops[i] * fontSize;
                ctx.fillStyle = 'rgba(10, 245, 176, 0.55)';
                ctx.fillText(ch, x, y);
                if (y > h && Math.random() > 0.985) drops[i] = Math.random() * -10;
                drops[i] += speeds[i];
            }
            rafId = requestAnimationFrame(draw);
        };

        resize();
        window.addEventListener('resize', resize);
        rafId = requestAnimationFrame(draw);

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(rafId);
        };
    }, []);

    return <canvas ref={canvasRef} className="title-rain-canvas" aria-hidden />;
}
