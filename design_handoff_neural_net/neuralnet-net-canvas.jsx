/* global React */
// Neural net visualization — layered network with traveling synapse pulses.
// When `active` is true: nodes glow, pulses travel along connections, scan sweep.
// When false: dim, no pulses, paused.

const NN_LAYERS = [5, 8, 8, 6, 4]; // input → hidden ×3 → output
const NN_PALETTE = {
  bg:        'rgba(0,0,0,0.55)',
  border:    'rgba(255,255,255,0.06)',
  nodeIdle:  'rgba(255,255,255,0.18)',
  nodeRing:  'rgba(10,245,176,0.5)',
  nodeFill:  '#0af5b0',
  synapse:   'rgba(10,245,176,0.10)',
  synapseHi: 'rgba(10,245,176,0.55)',
  pulse:     '#9ffce0',
  glow:      'rgba(10,245,176,0.85)',
};

function NeuralNetCanvas({ active = true, intensity = 1, cipherName = '' }) {
  const canvasRef = React.useRef(null);
  const stateRef = React.useRef({
    nodes: null,     // [{ x, y, layer, idx, activation, phase }]
    edges: null,     // [{ a, b, w, pulses: [{ t, speed }] }]
    raf: 0,
    sweep: 0,
    last: 0,
  });

  // Build network geometry once
  React.useEffect(() => {
    const nodes = [];
    const edges = [];
    NN_LAYERS.forEach((count, layerIdx) => {
      for (let i = 0; i < count; i++) {
        nodes.push({
          layer: layerIdx,
          idx: i,
          ofTotal: count,
          activation: 0,
          phase: Math.random() * Math.PI * 2,
          jitter: 0.5 + Math.random() * 0.5,
        });
      }
    });
    // Connect every node in layer L to every node in layer L+1
    for (let L = 0; L < NN_LAYERS.length - 1; L++) {
      const a0 = nodes.findIndex((n) => n.layer === L);
      const b0 = nodes.findIndex((n) => n.layer === L + 1);
      const aN = NN_LAYERS[L];
      const bN = NN_LAYERS[L + 1];
      for (let i = 0; i < aN; i++) {
        for (let j = 0; j < bN; j++) {
          edges.push({
            a: a0 + i,
            b: b0 + j,
            w: 0.2 + Math.random() * 0.8, // weight magnitude for visual
            pulses: [],
          });
        }
      }
    }
    stateRef.current.nodes = nodes;
    stateRef.current.edges = edges;
  }, []);

  // DPR-aware sizing
  React.useEffect(() => {
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

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const s = stateRef.current;

    let running = true;
    s.last = performance.now();

    const tick = (now) => {
      if (!running) return;
      const dt = Math.min(50, now - s.last) / 1000;
      s.last = now;

      const W = canvas.width, H = canvas.height;
      const padX = W * 0.08, padY = H * 0.12;
      const innerW = W - padX * 2;
      const innerH = H - padY * 2;

      ctx.clearRect(0, 0, W, H);

      // Soft vignette/grid background
      ctx.fillStyle = 'rgba(10,30,40,0.18)';
      ctx.fillRect(0, 0, W, H);

      // grid
      ctx.strokeStyle = 'rgba(10,245,176,0.04)';
      ctx.lineWidth = 1;
      const gridStep = Math.max(24, W / 40);
      for (let x = 0; x <= W; x += gridStep) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y <= H; y += gridStep) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Compute node positions
      const layerGap = innerW / (NN_LAYERS.length - 1);
      for (const n of s.nodes) {
        const x = padX + n.layer * layerGap;
        const slot = (innerH / (n.ofTotal + 1)) * (n.idx + 1);
        n.x = x;
        n.y = padY + slot;
      }

      // Update activations (a soft propagation wave)
      const tnow = now / 1000;
      for (const n of s.nodes) {
        const wave =
          0.5 +
          0.5 *
            Math.sin(
              tnow * (active ? 1.8 : 0.4) - n.layer * 0.7 + n.phase
            );
        const target = active ? wave * n.jitter : 0.08;
        n.activation += (target - n.activation) * 0.12;
      }

      // Draw edges + pulses
      for (const e of s.edges) {
        const A = s.nodes[e.a], B = s.nodes[e.b];

        // base line
        const baseAlpha = 0.08 + e.w * 0.10;
        ctx.strokeStyle = `rgba(10,245,176,${baseAlpha * (active ? 1 : 0.4)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(B.x, B.y);
        ctx.stroke();

        // spawn pulses (only when active)
        if (active) {
          const spawnRate = 0.18 * e.w * intensity; // pulses per sec
          if (Math.random() < spawnRate * dt) {
            e.pulses.push({ t: 0, speed: 0.7 + Math.random() * 0.9 });
          }
        }

        // advance & draw pulses
        for (let i = e.pulses.length - 1; i >= 0; i--) {
          const p = e.pulses[i];
          p.t += dt * p.speed;
          if (p.t >= 1) { e.pulses.splice(i, 1); continue; }
          const px = A.x + (B.x - A.x) * p.t;
          const py = A.y + (B.y - A.y) * p.t;

          // pulse glow
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

      // Scan sweep (vertical) — only when active
      if (active) {
        s.sweep = (s.sweep + dt * 0.18) % 1;
        const sx = padX + s.sweep * innerW;
        const sweepGrad = ctx.createLinearGradient(sx - 24, 0, sx + 24, 0);
        sweepGrad.addColorStop(0, 'rgba(10,245,176,0)');
        sweepGrad.addColorStop(0.5, 'rgba(10,245,176,0.10)');
        sweepGrad.addColorStop(1, 'rgba(10,245,176,0)');
        ctx.fillStyle = sweepGrad;
        ctx.fillRect(sx - 24, 0, 48, H);
      }

      // Draw nodes
      for (const n of s.nodes) {
        const a = Math.max(0, Math.min(1, n.activation));
        const r = 5 + a * 4;
        // outer glow
        if (active && a > 0.3) {
          const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 4.5);
          g.addColorStop(0, `rgba(10,245,176,${0.45 * a})`);
          g.addColorStop(1, 'rgba(10,245,176,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(n.x, n.y, r * 4.5, 0, Math.PI * 2);
          ctx.fill();
        }
        // ring
        ctx.strokeStyle = `rgba(10,245,176,${0.35 + a * 0.6})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r + 2, 0, Math.PI * 2);
        ctx.stroke();
        // fill
        const mix = a;
        const fillR = Math.round(10 + 240 * (1 - mix));
        const fillG = Math.round(245 - 0 * (1 - mix));
        const fillB = Math.round(176 + 60 * (1 - mix) * 0.0);
        ctx.fillStyle = active
          ? `rgba(${fillR}, ${fillG}, ${fillB}, ${0.6 + a * 0.4})`
          : 'rgba(120,140,135,0.45)';
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Layer captions
      ctx.fillStyle = 'rgba(255,255,255,0.42)';
      ctx.font = `${Math.max(9, W * 0.012)}px "Fira Code", monospace`;
      ctx.textAlign = 'center';
      const labels = ['INPUT', 'H1', 'H2', 'H3', 'OUTPUT'];
      for (let L = 0; L < NN_LAYERS.length; L++) {
        const x = padX + L * layerGap;
        ctx.fillText(labels[L], x, H - 8);
      }

      // Cipher label corner
      if (cipherName) {
        ctx.fillStyle = active ? 'rgba(10,245,176,0.85)' : 'rgba(255,255,255,0.4)';
        ctx.font = `600 ${Math.max(10, W * 0.014)}px "Fira Code", monospace`;
        ctx.textAlign = 'left';
        ctx.fillText(`> training: ${cipherName.toLowerCase()}`, padX, padY * 0.55);
      }

      s.raf = requestAnimationFrame(tick);
    };
    s.raf = requestAnimationFrame(tick);
    return () => { running = false; cancelAnimationFrame(s.raf); };
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

window.NeuralNetCanvas = NeuralNetCanvas;
