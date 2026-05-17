import { useEffect, useRef } from 'react';

interface NeuralNetCanvasProps {
    active?: boolean;
    intensity?: number;
    cipherName?: string | null;
}

const NN_LAYERS = [5, 8, 8, 6, 4];
const LAYER_LABELS = ['INPUT', 'H1', 'H2', 'H3', 'OUTPUT'];

const NN_PALETTE = {
    bg:        'rgba(0,0,0,0.55)',
    border:    'rgba(255,255,255,0.06)',
    pulse:     '#9ffce0',
};

interface Node {
    layer: number;
    idx: number;
    ofTotal: number;
    activation: number;
    phase: number;
    jitter: number;
    x: number;
    y: number;
}

interface Pulse {
    t: number;
    speed: number;
}

interface Edge {
    a: number;
    b: number;
    w: number;
    pulses: Pulse[];
}

interface CanvasState {
    nodes: Node[];
    edges: Edge[];
    raf: number;
    last: number;
}

const SPAWN_BUMP = 0.55;
const ARRIVAL_BUMP = 0.85;
const DECAY_PER_FRAME = 0.88;

export default function NeuralNetCanvas({
    active = true,
    intensity = 1,
    cipherName = '',
}: NeuralNetCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const stateRef = useRef<CanvasState>({
        nodes: [],
        edges: [],
        raf: 0,
        last: 0,
    });

    // Build network geometry once
    useEffect(() => {
        const nodes: Node[] = [];
        NN_LAYERS.forEach((count, layerIdx) => {
            for (let i = 0; i < count; i += 1) {
                nodes.push({
                    layer: layerIdx,
                    idx: i,
                    ofTotal: count,
                    activation: 0,
                    phase: Math.random() * Math.PI * 2,
                    jitter: 0.5 + Math.random() * 0.5,
                    x: 0,
                    y: 0,
                });
            }
        });

        const edges: Edge[] = [];
        for (let L = 0; L < NN_LAYERS.length - 1; L += 1) {
            const a0 = nodes.findIndex((n) => n.layer === L);
            const b0 = nodes.findIndex((n) => n.layer === L + 1);
            const aN = NN_LAYERS[L];
            const bN = NN_LAYERS[L + 1];
            for (let i = 0; i < aN; i += 1) {
                for (let j = 0; j < bN; j += 1) {
                    edges.push({
                        a: a0 + i,
                        b: b0 + j,
                        w: 0.2 + Math.random() * 0.8,
                        pulses: [],
                    });
                }
            }
        }

        stateRef.current.nodes = nodes;
        stateRef.current.edges = edges;
    }, []);

    // DPR-aware sizing
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const sync = () => {
            const dpr = window.devicePixelRatio || 1;
            const cssW = canvas.clientWidth;
            const cssH = canvas.clientHeight;
            if (!cssW || !cssH) return;
            canvas.width = Math.round(cssW * dpr);
            canvas.height = Math.round(cssH * dpr);
        };
        sync();
        const ro = new ResizeObserver(sync);
        ro.observe(canvas);
        return () => ro.disconnect();
    }, []);

    // Render loop — re-runs when props change so the closure picks them up.
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const s = stateRef.current;

        let running = true;
        s.last = performance.now();

        const tick = (now: number) => {
            if (!running) return;
            const dt = Math.min(50, now - s.last) / 1000;
            s.last = now;

            const W = canvas.width;
            const H = canvas.height;
            const padX = W * 0.08;
            const padY = H * 0.12;
            const innerW = W - padX * 2;
            const innerH = H - padY * 2;

            ctx.clearRect(0, 0, W, H);

            // Background fill
            ctx.fillStyle = 'rgba(10,30,40,0.18)';
            ctx.fillRect(0, 0, W, H);

            // Grid
            ctx.strokeStyle = 'rgba(10,245,176,0.04)';
            ctx.lineWidth = 1;
            const gridStep = Math.max(24, W / 40);
            for (let x = 0; x <= W; x += gridStep) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, H);
                ctx.stroke();
            }
            for (let y = 0; y <= H; y += gridStep) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(W, y);
                ctx.stroke();
            }

            // Node positions
            const layerGap = innerW / (NN_LAYERS.length - 1);
            for (const n of s.nodes) {
                n.x = padX + n.layer * layerGap;
                const slot = (innerH / (n.ofTotal + 1)) * (n.idx + 1);
                n.y = padY + slot;
            }

            // Activations decay each frame; pulses spawning/arriving bump them.
            const decay = Math.pow(DECAY_PER_FRAME, Math.min(4, dt * 60));
            for (const n of s.nodes) {
                n.activation *= decay;
                if (n.activation < 0.01) n.activation = 0;
            }

            // Edges + pulses
            for (const e of s.edges) {
                const A = s.nodes[e.a];
                const B = s.nodes[e.b];

                const baseAlpha = 0.08 + e.w * 0.10;
                ctx.strokeStyle = `rgba(10,245,176,${baseAlpha * (active ? 1 : 0.4)})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(A.x, A.y);
                ctx.lineTo(B.x, B.y);
                ctx.stroke();

                if (active) {
                    const spawnRate = 0.18 * e.w * intensity;
                    if (Math.random() < spawnRate * dt) {
                        e.pulses.push({ t: 0, speed: 0.7 + Math.random() * 0.9 });
                        A.activation = Math.min(1, A.activation + SPAWN_BUMP);
                    }
                }

                for (let i = e.pulses.length - 1; i >= 0; i -= 1) {
                    const p = e.pulses[i];
                    p.t += dt * p.speed;
                    if (p.t >= 1) {
                        B.activation = Math.min(1, B.activation + ARRIVAL_BUMP);
                        e.pulses.splice(i, 1);
                        continue;
                    }
                    const px = A.x + (B.x - A.x) * p.t;
                    const py = A.y + (B.y - A.y) * p.t;

                    const r = 3.5;
                    const grad = ctx.createRadialGradient(px, py, 0, px, py, r * 4);
                    grad.addColorStop(0, 'rgba(180,255,228,0.95)');
                    grad.addColorStop(0.4, 'rgba(10,245,176,0.5)');
                    grad.addColorStop(1, 'rgba(10,245,176,0)');
                    ctx.fillStyle = grad;
                    ctx.beginPath();
                    ctx.arc(px, py, r * 4, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.fillStyle = NN_PALETTE.pulse;
                    ctx.beginPath();
                    ctx.arc(px, py, r, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // Nodes
            for (const n of s.nodes) {
                const a = Math.max(0, Math.min(1, n.activation));
                const r = 5 + a * 4;

                if (active && a > 0.3) {
                    const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 4.5);
                    g.addColorStop(0, `rgba(10,245,176,${0.45 * a})`);
                    g.addColorStop(1, 'rgba(10,245,176,0)');
                    ctx.fillStyle = g;
                    ctx.beginPath();
                    ctx.arc(n.x, n.y, r * 4.5, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.strokeStyle = `rgba(10,245,176,${0.35 + a * 0.6})`;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(n.x, n.y, r + 2, 0, Math.PI * 2);
                ctx.stroke();

                const fillR = Math.round(10 + 240 * (1 - a));
                ctx.fillStyle = active
                    ? `rgba(${fillR}, 245, 176, ${0.6 + a * 0.4})`
                    : 'rgba(120,140,135,0.45)';
                ctx.beginPath();
                ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
                ctx.fill();
            }

            // Layer labels
            ctx.fillStyle = 'rgba(255,255,255,0.42)';
            ctx.font = `${Math.max(9, W * 0.012)}px "Fira Code", monospace`;
            ctx.textAlign = 'center';
            for (let L = 0; L < NN_LAYERS.length; L += 1) {
                const x = padX + L * layerGap;
                ctx.fillText(LAYER_LABELS[L], x, H - 8);
            }

            // Cipher caption
            if (cipherName) {
                ctx.fillStyle = active ? 'rgba(10,245,176,0.85)' : 'rgba(255,255,255,0.4)';
                ctx.font = `600 ${Math.max(10, W * 0.014)}px "Fira Code", monospace`;
                ctx.textAlign = 'left';
                ctx.fillText(`> training: ${cipherName.toLowerCase()}`, padX, padY * 0.55);
            }

            s.raf = requestAnimationFrame(tick);
        };

        s.raf = requestAnimationFrame(tick);
        return () => {
            running = false;
            cancelAnimationFrame(s.raf);
        };
    }, [active, intensity, cipherName]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                width: '100%',
                height: 320,
                display: 'block',
                borderRadius: 8,
                background: NN_PALETTE.bg,
                border: `1px solid ${NN_PALETTE.border}`,
                boxShadow: 'inset 0 0 40px rgba(0,0,0,0.7)',
            }}
        />
    );
}
