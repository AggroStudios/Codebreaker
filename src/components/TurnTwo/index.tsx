import { useRef, useEffect, useCallback } from 'react';
import './style.scss';
import { MiniGameProps } from '../../includes/minigame.interfaces';
import { CIPHER_COLS, CIPHER_ROWS, CELL_W, CELL_H } from '../CipherGrid';

const CANVAS_ASPECT = (CIPHER_ROWS * CELL_H) / (CIPHER_COLS * CELL_W);

const PAD          = 8;
const GAP          = 5;
const HEADER_H     = 22;
const REVEAL_MS    = 750;
const CARD_RADIUS  = 4;
const FLIP_MS      = 280;

const BRIGHT: string[] = [
  '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
  '#1abc9c', '#e67e22', '#e91e63', '#00bcd4', '#ff7043',
];
const DIM: string[] = [
  '#3a1212', '#121830', '#12301c', '#302800', '#1e1030',
  '#10282a', '#301c0a', '#2a121e', '#00242e', '#301a12',
];

const SYMBOLS = ['1','2','3','4','5','6','7','8','9','0'];

type GamePhase = 'idle' | 'playing' | 'won' | 'lost';

interface Card {
  pairId:  number;
  faceUp:  boolean;
  matched: boolean;
}

interface CardAnim {
  from:      boolean;
  to:        boolean;
  t:         number;
  clockwise: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function computeGrid(total: number): { cols: number; rows: number } {
  const targetRatio = (CIPHER_COLS * CELL_W) / (CIPHER_ROWS * CELL_H);
  let bestCols = total, bestRows = 1, bestScore = Infinity;
  for (let cols = 1; cols <= total; cols++) {
    const rows = Math.ceil(total / cols);
    const waste = cols * rows - total;
    const score = Math.abs(cols / rows - targetRatio) + waste * 0.5;
    if (score < bestScore) { bestScore = score; bestCols = cols; bestRows = rows; }
  }
  return { cols: bestCols, rows: bestRows };
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y,     x + w, y + r,     r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x,     y + h, x,     y + h - r, r);
  ctx.lineTo(x,     y + r);
  ctx.arcTo(x,     y,     x + r, y,         r);
  ctx.closePath();
}

// Draws a card mid-flip using perspective projection around the Y axis.
// `anim.clockwise = true` → right edge comes toward viewer (CW).
// cosA is used raw (goes negative past 90°) so the corners keep moving in
// one direction instead of reversing — giving a full continuous rotation.
function drawCardPerspective(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, cardW: number, cardH: number,
  card: Card,
  anim: CardAnim,
) {
  const angle = anim.t * Math.PI;
  const cosA  = Math.cos(angle);   // 1 → 0 → -1 (continuous, goes negative)
  const sinA  = Math.sin(angle);   // 0 → 1 → 0  (always ≥ 0)
  const absC  = Math.abs(cosA);

  if (absC * cardW < 0.5) return;

  const showFaceUp = angle < Math.PI / 2 ? anim.from : anim.to;

  const f     = cardW * 3;         // perspective focal length
  const halfW = cardW / 2;
  const halfH = cardH / 2;
  const ctrX  = cx + halfW;
  const ctrY  = cy + halfH;

  // CW: right edge closer (zR < 0), left farther (zL > 0). CCW: reversed.
  const sign = anim.clockwise ? 1 : -1;
  const zL   =  sign * halfW * sinA;
  const zR   = -sign * halfW * sinA;

  const sL = f / (f + zL);
  const sR = f / (f + zR);

  // Use cosA (not absC): corners cross over past 90° and keep moving forward.
  // After the midpoint, xL and xR are both negative so TL/TR swap sides —
  // this is exactly what a real card rotating past edge-on looks like.
  const xL = cosA * halfW * sL;
  const xR = cosA * halfW * sR;

  const tlx = ctrX - xL,  tly = ctrY - halfH * sL;
  const trx = ctrX + xR,  trY = ctrY - halfH * sR;
  const brx = ctrX + xR,  bry = ctrY + halfH * sR;
  const blx = ctrX - xL,  bly = ctrY + halfH * sL;

  const pairIdx = card.pairId % BRIGHT.length;
  const bright  = BRIGHT[pairIdx];
  const dim     = DIM[pairIdx];
  const symbol  = SYMBOLS[pairIdx];

  // ── Background ──────────────────────────────────────────────────────
  ctx.beginPath();
  ctx.moveTo(tlx, tly);
  ctx.lineTo(trx, trY);
  ctx.lineTo(brx, bry);
  ctx.lineTo(blx, bly);
  ctx.closePath();
  ctx.fillStyle = showFaceUp ? dim : '#1a2630';
  ctx.fill();

  // ── Depth shading gradient ──────────────────────────────────────────
  // After the midpoint, TL and TR have swapped screen sides, so compute
  // leftX/rightX from min/max and determine which side is brighter.
  const leftX  = Math.min(tlx, trx);
  const rightX = Math.max(tlx, trx);
  const gradW  = rightX - leftX;
  if (sinA > 0.02 && gradW > 1) {
    const grad = ctx.createLinearGradient(leftX, 0, rightX, 0);
    // sign * cosA > 0 → closer side is on screen-right → dark left, bright right
    const darkOnLeft = sign * cosA > 0;
    const shadow    = (0.45 * sinA).toFixed(3);
    const highlight = (0.18 * sinA).toFixed(3);
    if (darkOnLeft) {
      grad.addColorStop(0, `rgba(0,0,0,${shadow})`);
      grad.addColorStop(1, `rgba(255,255,255,${highlight})`);
    } else {
      grad.addColorStop(0, `rgba(255,255,255,${highlight})`);
      grad.addColorStop(1, `rgba(0,0,0,${shadow})`);
    }
    ctx.beginPath();
    ctx.moveTo(tlx, tly);
    ctx.lineTo(trx, trY);
    ctx.lineTo(brx, bry);
    ctx.lineTo(blx, bly);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
  }

  // ── Border ──────────────────────────────────────────────────────────
  ctx.beginPath();
  ctx.moveTo(tlx, tly);
  ctx.lineTo(trx, trY);
  ctx.lineTo(brx, bry);
  ctx.lineTo(blx, bly);
  ctx.closePath();
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth   = 1;
  ctx.stroke();

  // ── Symbol ──────────────────────────────────────────────────────────
  // Card's 3D center always projects to (ctrX, ctrY). Scale x by absC so
  // the glyph compresses with the rotation without mirroring the character.
  if (absC > 0.08) {
    const fontSize = Math.floor(cardH * 0.44);
    ctx.save();
    ctx.translate(ctrX, ctrY);
    ctx.scale(absC, 1);
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    if (showFaceUp) {
      ctx.fillStyle = bright;
      ctx.font      = `700 ${fontSize}px "Fira Code", monospace`;
      ctx.fillText(symbol, 0, 0);
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.font      = `700 ${fontSize}px Inter, system-ui, sans-serif`;
      ctx.fillText('?', 0, 0);
    }
    ctx.restore();
  }
}

function drawCard(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  card: Card,
) {
  const pairIdx  = card.pairId % BRIGHT.length;
  const bright   = BRIGHT[pairIdx];
  const dim      = DIM[pairIdx];
  const symbol   = SYMBOLS[pairIdx];
  const fontSize = Math.floor(h * 0.44);

  if (!card.faceUp && !card.matched) {
    roundRect(ctx, x, y, w, h, CARD_RADIUS);
    ctx.fillStyle = '#1a2630';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle    = 'rgba(255,255,255,0.18)';
    ctx.font         = `700 ${fontSize}px Inter, system-ui, sans-serif`;
    ctx.fillText('?', x + w / 2, y + h / 2);
  } else {
    roundRect(ctx, x, y, w, h, CARD_RADIUS);
    ctx.fillStyle = dim;
    ctx.fill();

    if (card.matched) {
      ctx.strokeStyle = bright;
      ctx.lineWidth   = 2;
      ctx.shadowColor = bright;
      ctx.shadowBlur  = 10;
      ctx.stroke();
      ctx.shadowBlur  = 0;
    } else {
      ctx.strokeStyle = 'rgba(255,255,255,0.14)';
      ctx.lineWidth   = 1;
      ctx.stroke();
    }

    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle    = bright;
    if (card.matched) { ctx.shadowColor = bright; ctx.shadowBlur = 6; }
    ctx.font = `700 ${fontSize}px "Fira Code", monospace`;
    ctx.fillText(symbol, x + w / 2, y + h / 2);
    ctx.shadowBlur = 0;
  }
}

export const TurnTwo: React.FC<MiniGameProps> = ({
  rounds  = 5,
  chances = 3,
  onWin,
  onLose,
  onProgress,
}) => {
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const phaseRef       = useRef<GamePhase>('idle');
  const cardsRef       = useRef<Card[]>([]);
  const flippedRef     = useRef<number[]>([]);
  const chancesLeftRef = useRef(chances);
  const matchedRef     = useRef(0);
  const lockedRef      = useRef(false);

  const cardAnimsRef      = useRef<Map<number, CardAnim>>(new Map());
  const rafRef            = useRef<number | null>(null);
  const lastTimeRef       = useRef<number | null>(null);
  const animOnCompleteRef = useRef<(() => void) | null>(null);

  const onWinRef      = useRef(onWin);
  const onLoseRef     = useRef(onLose);
  const onProgressRef = useRef(onProgress);
  useEffect(() => { onWinRef.current      = onWin;      }, [onWin]);
  useEffect(() => { onLoseRef.current     = onLose;     }, [onLose]);
  useEffect(() => { onProgressRef.current = onProgress; }, [onProgress]);

  // ── Canvas drawing ──────────────────────────────────────────────────────
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr   = window.devicePixelRatio || 1;
    const w     = canvas.width  / dpr;
    const h     = canvas.height / dpr;
    const phase = phaseRef.current;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#080c0a';
    ctx.fillRect(0, 0, w, h);

    if (phase === 'idle') {
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle    = 'rgba(255,255,255,0.72)';
      ctx.font         = `600 ${Math.floor(h * 0.13)}px Inter, system-ui, sans-serif`;
      ctx.fillText('CLICK TO START', w / 2, h / 2 - h * 0.07);
      ctx.fillStyle = 'rgba(255,255,255,0.32)';
      ctx.font      = `${Math.floor(h * 0.08)}px Inter, system-ui, sans-serif`;
      ctx.fillText(`${rounds} pairs · ${chances} chances`, w / 2, h / 2 + h * 0.08);
      return;
    }

    if (phase === 'won' || phase === 'lost') {
      const accent = phase === 'won' ? '#2ecc71' : '#e74c3c';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle    = accent;
      ctx.shadowColor  = accent;
      ctx.shadowBlur   = 18;
      ctx.font         = `700 ${Math.floor(h * 0.16)}px Inter, system-ui, sans-serif`;
      ctx.fillText(phase === 'won' ? 'WIN!' : 'FAIL', w / 2, h / 2 - h * 0.07);
      ctx.shadowBlur   = 0;
      ctx.fillStyle    = 'rgba(255,255,255,0.32)';
      ctx.font         = `${Math.floor(h * 0.08)}px Inter, system-ui, sans-serif`;
      ctx.fillText('PLAY AGAIN', w / 2, h / 2 + h * 0.1);
      return;
    }

    // ── HUD ────────────────────────────────────────────────────────────
    const headerMidY  = PAD + HEADER_H / 2;
    const dotR        = 5;
    const dotSpacing  = 14;
    const chancesLeft = chancesLeftRef.current;

    for (let i = 0; i < chances; i++) {
      ctx.beginPath();
      ctx.arc(PAD + dotR + i * dotSpacing, headerMidY, dotR, 0, Math.PI * 2);
      if (i < chancesLeft) {
        ctx.fillStyle   = '#0af5b0';
        ctx.shadowColor = '#0af5b0';
        ctx.shadowBlur  = 8;
      } else {
        ctx.fillStyle  = 'rgba(255,255,255,0.1)';
        ctx.shadowBlur = 0;
      }
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    const matched = matchedRef.current;
    ctx.textAlign    = 'right';
    ctx.textBaseline = 'middle';
    ctx.font         = `600 ${Math.floor(HEADER_H * 0.6)}px "Fira Code", monospace`;
    ctx.fillStyle    = matched === rounds ? '#2ecc71' : 'rgba(255,255,255,0.5)';
    ctx.fillText(`${matched}/${rounds}`, w - PAD, headerMidY);

    // ── Cards ──────────────────────────────────────────────────────────
    const cards = cardsRef.current;
    const { cols, rows } = computeGrid(cards.length);
    const gridTop = PAD + HEADER_H + GAP;
    const gridW   = w - PAD * 2;
    const gridH   = h - gridTop - PAD;
    const cardW   = (gridW - GAP * (cols - 1)) / cols;
    const cardH   = (gridH - GAP * (rows - 1)) / rows;

    cards.forEach((card, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const cx  = PAD + col * (cardW + GAP);
      const cy  = gridTop + row * (cardH + GAP);

      const anim = cardAnimsRef.current.get(idx);
      if (anim) {
        drawCardPerspective(ctx, cx, cy, cardW, cardH, card, anim);
      } else {
        drawCard(ctx, cx, cy, cardW, cardH, card);
      }
    });
  }, [rounds, chances]);

  // ── Animation loop ──────────────────────────────────────────────────────
  const animLoop = useCallback((time: number) => {
    const dt    = lastTimeRef.current !== null ? (time - lastTimeRef.current) / FLIP_MS : 0;
    lastTimeRef.current = time;

    const anims = cardAnimsRef.current;
    for (const [idx, anim] of anims) {
      anim.t = Math.min(1, anim.t + dt);
      if (anim.t >= 1) anims.delete(idx);
    }

    drawCanvas();

    if (anims.size > 0) {
      rafRef.current = requestAnimationFrame(animLoop);
    } else {
      rafRef.current      = null;
      lastTimeRef.current = null;
      const cb = animOnCompleteRef.current;
      animOnCompleteRef.current = null;
      cb?.();
    }
  }, [drawCanvas]);

  // ── Start flip animations ───────────────────────────────────────────────
  const startFlips = useCallback((
    indices:   number[],
    from:      boolean,
    to:        boolean,
    clockwise: boolean,
    onComplete?: () => void,
  ) => {
    animOnCompleteRef.current = onComplete ?? null;
    for (const idx of indices) {
      cardAnimsRef.current.set(idx, { from, to, t: 0, clockwise });
    }
    if (rafRef.current === null) {
      lastTimeRef.current = null;
      rafRef.current = requestAnimationFrame(animLoop);
    }
  }, [animLoop]);

  // ── Canvas sizing ───────────────────────────────────────────────────────
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr  = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth;
    if (!cssW) return;
    const cssH = Math.round(cssW * CANVAS_ASPECT);
    canvas.style.height = `${cssH}px`;
    canvas.width        = Math.round(cssW * dpr);
    canvas.height       = Math.round(cssH * dpr);
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);
    drawCanvas();
  }, [drawCanvas]);

  useEffect(() => {
    initCanvas();
    const ro = new ResizeObserver(initCanvas);
    if (canvasRef.current) ro.observe(canvasRef.current);
    return () => ro.disconnect();
  }, [initCanvas]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ── Game logic ──────────────────────────────────────────────────────────
  const startGame = useCallback(() => {
    const pairs: number[] = [];
    for (let i = 0; i < rounds; i++) pairs.push(i, i);
    const cards = shuffle(pairs).map(pairId => ({ pairId, faceUp: true, matched: false }));
    cardsRef.current       = cards;
    phaseRef.current       = 'playing';
    flippedRef.current     = [];
    chancesLeftRef.current = chances;
    matchedRef.current     = 0;
    lockedRef.current      = true;
    drawCanvas();

    setTimeout(() => {
      // Set game state face-down; animation will visually show the fold from face-up
      cardsRef.current = cardsRef.current.map(c => ({ ...c, faceUp: false }));
      const indices = Array.from({ length: cardsRef.current.length }, (_, i) => i);
      startFlips(indices, true, false, false, () => {
        lockedRef.current = false;
      });
    }, 1000);
  }, [rounds, chances, drawCanvas, startFlips]);

  const checkMatch = useCallback(() => {
    const [i1, i2] = flippedRef.current;
    const cards    = cardsRef.current;

    setTimeout(() => {
      if (cards[i1].pairId === cards[i2].pairId) {
        // ── Match ──
        cards[i1] = { ...cards[i1], faceUp: true, matched: true };
        cards[i2] = { ...cards[i2], faceUp: true, matched: true };
        flippedRef.current = [];
        matchedRef.current++;
        lockedRef.current  = false;

        onProgressRef.current(Math.round((matchedRef.current / rounds) * 100));
        drawCanvas();

        if (matchedRef.current === rounds) {
          phaseRef.current = 'won';
          drawCanvas();
          onWinRef.current();
        }
      } else {
        // ── Mismatch — flip cards back with CCW animation ──
        chancesLeftRef.current--;
        cards[i1] = { ...cards[i1], faceUp: false };
        cards[i2] = { ...cards[i2], faceUp: false };
        flippedRef.current = [];

        startFlips([i1, i2], true, false, false, () => {
          if (chancesLeftRef.current <= 0) {
            phaseRef.current = 'lost';
            drawCanvas();
            onLoseRef.current();
          } else {
            lockedRef.current = false;
          }
        });
      }
    }, REVEAL_MS);
  }, [rounds, drawCanvas, startFlips]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const phase = phaseRef.current;

    if (phase === 'idle' || phase === 'won' || phase === 'lost') {
      startGame();
      return;
    }

    if (phase !== 'playing' || lockedRef.current) return;

    const rect   = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const cards = cardsRef.current;
    const { cols, rows } = computeGrid(cards.length);
    const gridTop = PAD + HEADER_H + GAP;
    const gridW   = rect.width  - PAD * 2;
    const gridH   = rect.height - gridTop - PAD;
    const cardW   = (gridW - GAP * (cols - 1)) / cols;
    const cardH   = (gridH - GAP * (rows - 1)) / rows;

    let clickedIdx = -1;
    for (let i = 0; i < cards.length; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x   = PAD + col * (cardW + GAP);
      const y   = gridTop + row * (cardH + GAP);
      if (clickX >= x && clickX < x + cardW && clickY >= y && clickY < y + cardH) {
        clickedIdx = i;
        break;
      }
    }

    if (clickedIdx === -1) return;

    const card = cards[clickedIdx];
    if (card.faceUp || card.matched) return;
    if (flippedRef.current.includes(clickedIdx)) return;

    // Update game state immediately; animation shows the visual transition
    cards[clickedIdx] = { ...card, faceUp: true };
    flippedRef.current = [...flippedRef.current, clickedIdx];

    startFlips([clickedIdx], false, true, true);

    if (flippedRef.current.length === 2) {
      lockedRef.current = true;
      checkMatch();
    }
  }, [startGame, checkMatch, startFlips]);

  return (
    <div className="turntwo-game">
      <canvas
        ref={canvasRef}
        className="turntwo-game__canvas"
        onClick={handleClick}
      />
    </div>
  );
};

export default TurnTwo;
