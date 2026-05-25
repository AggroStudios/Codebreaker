import { useRef, useEffect, useCallback } from 'react';
import './style.scss';
import { MiniGameProps } from '../../includes/minigame.interfaces';
import { CIPHER_COLS, CIPHER_ROWS, CELL_W, CELL_H } from '../CipherGrid';

const CANVAS_ASPECT = (CIPHER_ROWS * CELL_H) / (CIPHER_COLS * CELL_W);

const COLORS = [
    '#e74c3c', // red
    '#3498db', // blue
    '#2ecc71', // green
    '#f39c12', // orange
    '#9b59b6', // purple
    '#1abc9c', // teal
];

const PAD = 8;
const ROW_GAP = 4;
const PALETTE_H_MIN = 44;
const PALETTE_H_RATIO = 0.18;

type GamePhase = 'idle' | 'playing' | 'won' | 'lost';

type PegStatus = 'correct' | 'misplaced' | 'absent';

interface Feedback {
    black: number;
    white: number;
    /** Per-slot status indexed the same as the guess — used so feedback dots
     *  render aligned with the guess column they describe. */
    slots: PegStatus[];
}

interface BoardLayout {
    paletteH: number;
    boardTop: number;
    boardH: number;
    rowH: number;
    submitW: number;
    slotsW: number;
    slotW: number;
    pegR: number;
    rowYAt: (i: number) => number;
}

function computeLayout(w: number, h: number, chances: number, rounds: number): BoardLayout {
    const paletteH = Math.max(PALETTE_H_MIN, Math.min(60, h * PALETTE_H_RATIO));
    const boardTop = PAD;
    const boardH = h - paletteH - PAD * 2;
    const rowH = (boardH - ROW_GAP * (chances - 1)) / chances;
    const submitW = Math.min(64, w * 0.18);
    const slotsW = w - PAD * 2 - submitW - ROW_GAP;
    const slotW = slotsW / rounds;
    const pegR = Math.min(slotW, rowH) * 0.4;
    const rowYAt = (i: number) => boardTop + i * (rowH + ROW_GAP) + rowH / 2;
    return { paletteH, boardTop, boardH, rowH, submitW, slotsW, slotW, pegR, rowYAt };
}

function computeFeedback(guess: number[], code: number[]): Feedback {
    const g = [...guess];
    const c = [...code];
    const slots: PegStatus[] = new Array(guess.length).fill('absent');
    let black = 0;
    let white = 0;
    for (let i = 0; i < g.length; i++) {
        if (g[i] === c[i]) {
            slots[i] = 'correct';
            black++;
            g[i] = -1;
            c[i] = -2;
        }
    }
    for (let i = 0; i < g.length; i++) {
        if (g[i] < 0) continue;
        const idx = c.indexOf(g[i]);
        if (idx >= 0) {
            slots[i] = 'misplaced';
            white++;
            c[idx] = -2;
        }
    }
    return { black, white, slots };
}

export const MasterMind: React.FC<MiniGameProps> = ({
    rounds = 4,
    chances = 8,
    onWin,
    onLose,
    onProgress,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const phaseRef = useRef<GamePhase>('idle');
    const codeRef = useRef<number[]>([]);
    const guessesRef = useRef<number[][]>([]);
    const feedbackRef = useRef<Feedback[]>([]);
    const currentGuessRef = useRef<number[]>([]);
    const selectedColorRef = useRef<number>(0);

    const onWinRef = useRef(onWin);
    const onLoseRef = useRef(onLose);
    const onProgressRef = useRef(onProgress);
    useEffect(() => { onWinRef.current = onWin; }, [onWin]);
    useEffect(() => { onLoseRef.current = onLose; }, [onLose]);
    useEffect(() => { onProgressRef.current = onProgress; }, [onProgress]);

    useEffect(() => {
        codeRef.current = Array.from({ length: rounds }, () =>
            Math.floor(Math.random() * COLORS.length),
        );
        currentGuessRef.current = new Array(rounds).fill(-1);
        guessesRef.current = [];
        feedbackRef.current = [];
        phaseRef.current = 'idle';
        selectedColorRef.current = 0;
    }, [rounds]);

    const drawCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const w = canvas.width / dpr;
        const h = canvas.height / dpr;

        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#080c0a';
        ctx.fillRect(0, 0, w, h);

        if (phaseRef.current === 'idle') {
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            ctx.fillStyle = '#0af5b0';
            ctx.shadowColor = '#0af5b0';
            ctx.shadowBlur = 14;
            ctx.font = `700 ${Math.floor(h * 0.13)}px Inter, system-ui, sans-serif`;
            ctx.fillText('MASTERMIND', w / 2, h * 0.14);
            ctx.shadowBlur = 0;

            ctx.fillStyle = 'rgba(255,255,255,0.55)';
            ctx.font = `${Math.floor(h * 0.055)}px "Fira Code", monospace`;
            ctx.fillText(
                `Crack the ${rounds}-color code · ${chances} attempts`,
                w / 2,
                h * 0.26,
            );

            const legendStartY = h * 0.42;
            const legendLineH = h * 0.11;
            const legendDotR = Math.max(4, h * 0.028);
            const legendDotX = w * 0.20;
            const legendTextX = legendDotX + legendDotR * 2.8;

            const legend: {
                fill: string;
                glow: string | null;
                stroke: string | null;
                label: string;
            }[] = [
                {
                    fill: '#0af5b0',
                    glow: '#0af5b0',
                    stroke: null,
                    label: 'correct color in the correct position',
                },
                {
                    fill: '#f39c12',
                    glow: '#f39c12',
                    stroke: null,
                    label: 'correct color, wrong position',
                },
                {
                    fill: 'rgba(255,255,255,0.06)',
                    glow: null,
                    stroke: 'rgba(255,255,255,0.25)',
                    label: 'color is not in the code',
                },
            ];

            ctx.textAlign = 'left';
            ctx.font = `${Math.floor(h * 0.055)}px Inter, system-ui, sans-serif`;
            legend.forEach((row, i) => {
                const cy = legendStartY + i * legendLineH;
                ctx.beginPath();
                ctx.arc(legendDotX, cy, legendDotR, 0, Math.PI * 2);
                ctx.fillStyle = row.fill;
                if (row.glow) {
                    ctx.shadowColor = row.glow;
                    ctx.shadowBlur = 8;
                }
                ctx.fill();
                ctx.shadowBlur = 0;
                if (row.stroke) {
                    ctx.strokeStyle = row.stroke;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
                ctx.fillStyle = 'rgba(255,255,255,0.85)';
                ctx.fillText(row.label, legendTextX, cy);
            });

            ctx.textAlign = 'center';
            ctx.fillStyle = '#0af5b0';
            ctx.shadowColor = '#0af5b0';
            ctx.shadowBlur = 10;
            ctx.font = `700 ${Math.floor(h * 0.075)}px Inter, system-ui, sans-serif`;
            ctx.fillText('CLICK TO START', w / 2, h * 0.88);
            ctx.shadowBlur = 0;

            return;
        }

        const L = computeLayout(w, h, chances, rounds);
        const currentRowIdx = guessesRef.current.length;
        const rowComplete =
            phaseRef.current === 'playing' &&
            currentRowIdx < chances &&
            currentGuessRef.current.every((c) => c >= 0);

        // Rows
        for (let row = 0; row < chances; row++) {
            const y = L.rowYAt(row);
            const isPlayed = row < currentRowIdx;
            const isCurrent = row === currentRowIdx && phaseRef.current === 'playing';

            // Slots
            for (let col = 0; col < rounds; col++) {
                const x = PAD + col * L.slotW + L.slotW / 2;
                const colorIdx = isPlayed
                    ? guessesRef.current[row][col]
                    : isCurrent
                        ? currentGuessRef.current[col]
                        : -1;

                ctx.beginPath();
                ctx.arc(x, y, L.pegR, 0, Math.PI * 2);
                if (colorIdx >= 0) {
                    ctx.fillStyle = COLORS[colorIdx];
                    ctx.shadowColor = COLORS[colorIdx];
                    ctx.shadowBlur = isCurrent ? 6 : 0;
                } else {
                    ctx.fillStyle = 'rgba(255,255,255,0.04)';
                    ctx.shadowBlur = 0;
                }
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.strokeStyle = isCurrent
                    ? 'rgba(10,245,176,0.6)'
                    : 'rgba(255,255,255,0.10)';
                ctx.lineWidth = isCurrent ? 1.5 : 1;
                ctx.stroke();
            }

            // Right column: feedback for played rows, submit button for current row
            const rightX = PAD + L.slotsW + ROW_GAP;
            if (isPlayed) {
                const fb = feedbackRef.current[row];
                const slotSpacing = (L.submitW - 4) / rounds;
                const fbR = Math.max(3, Math.min(slotSpacing * 0.42, L.rowH * 0.32));
                const startX = rightX + (L.submitW - slotSpacing * rounds) / 2 + slotSpacing / 2;

                // Dot at column i reflects the status of guess column i, so
                // the player can see which specific peg is correct / misplaced
                // / absent.
                for (let i = 0; i < rounds; i++) {
                    const px = startX + i * slotSpacing;
                    let fill: string;
                    let glow: string | null = null;
                    let stroke: string | null = null;

                    switch (fb.slots[i]) {
                        case 'correct':
                            fill = '#0af5b0';
                            glow = '#0af5b0';
                            break;
                        case 'misplaced':
                            fill = '#f39c12';
                            glow = '#f39c12';
                            break;
                        default:
                            fill = 'rgba(255,255,255,0.06)';
                            stroke = 'rgba(255,255,255,0.18)';
                    }

                    ctx.beginPath();
                    ctx.arc(px, y, fbR, 0, Math.PI * 2);
                    ctx.fillStyle = fill;
                    if (glow) {
                        ctx.shadowColor = glow;
                        ctx.shadowBlur = 8;
                    }
                    ctx.fill();
                    ctx.shadowBlur = 0;
                    if (stroke) {
                        ctx.strokeStyle = stroke;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            } else if (isCurrent) {
                const btnH = L.rowH * 0.78;
                const btnW = L.submitW - 6;
                const btnX = rightX + 3;
                const btnY = y - btnH / 2;
                const enabled = rowComplete;
                const fill = enabled ? 'rgba(10,245,176,0.18)' : 'rgba(255,255,255,0.04)';
                const stroke = enabled ? '#0af5b0' : 'rgba(255,255,255,0.10)';
                ctx.beginPath();
                if (typeof ctx.roundRect === 'function') {
                    ctx.roundRect(btnX, btnY, btnW, btnH, 4);
                } else {
                    ctx.rect(btnX, btnY, btnW, btnH);
                }
                ctx.fillStyle = fill;
                ctx.fill();
                ctx.strokeStyle = stroke;
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.fillStyle = enabled ? '#0af5b0' : 'rgba(255,255,255,0.30)';
                ctx.font = `700 ${Math.floor(btnH * 0.42)}px "Fira Code", monospace`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.shadowColor = enabled ? '#0af5b0' : 'transparent';
                ctx.shadowBlur = enabled ? 6 : 0;
                ctx.fillText('OK', btnX + btnW / 2, btnY + btnH / 2);
                ctx.shadowBlur = 0;
            }
        }

        // Palette
        const paletteY = h - L.paletteH / 2 - PAD / 2;
        const colorR = Math.min(L.paletteH * 0.36, w / (COLORS.length * 2.6));
        const colorSpacing = w / (COLORS.length + 1);
        for (let i = 0; i < COLORS.length; i++) {
            const cx = colorSpacing * (i + 1);
            ctx.beginPath();
            ctx.arc(cx, paletteY, colorR, 0, Math.PI * 2);
            ctx.fillStyle = COLORS[i];
            ctx.shadowColor = COLORS[i];
            ctx.shadowBlur = selectedColorRef.current === i ? 10 : 3;
            ctx.fill();
            ctx.shadowBlur = 0;
            if (selectedColorRef.current === i) {
                ctx.beginPath();
                ctx.arc(cx, paletteY, colorR + 3.5, 0, Math.PI * 2);
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }
        }

        // End-state overlay
        if (phaseRef.current === 'won' || phaseRef.current === 'lost') {
            ctx.fillStyle = 'rgba(0,0,0,0.72)';
            ctx.fillRect(0, 0, w, h);
            const accent = phaseRef.current === 'won' ? '#2ecc71' : '#e74c3c';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = accent;
            ctx.shadowColor = accent;
            ctx.shadowBlur = 18;
            ctx.font = `700 ${Math.floor(h * 0.16)}px Inter, system-ui, sans-serif`;
            ctx.fillText(phaseRef.current === 'won' ? 'WIN!' : 'FAIL', w / 2, h / 2 - h * 0.07);
            ctx.shadowBlur = 0;

            ctx.fillStyle = 'rgba(255,255,255,0.55)';
            ctx.font = `${Math.floor(h * 0.06)}px Inter, system-ui, sans-serif`;
            ctx.fillText('CODE', w / 2, h / 2 + h * 0.04);

            const codeR = Math.min(h * 0.04, w / (rounds * 3));
            const codeSpacing = codeR * 2.6;
            const codeStart = w / 2 - (codeSpacing * (rounds - 1)) / 2;
            const codeY = h / 2 + h * 0.13;
            for (let i = 0; i < rounds; i++) {
                ctx.beginPath();
                ctx.arc(codeStart + i * codeSpacing, codeY, codeR, 0, Math.PI * 2);
                ctx.fillStyle = COLORS[codeRef.current[i]];
                ctx.shadowColor = COLORS[codeRef.current[i]];
                ctx.shadowBlur = 6;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }
    }, [rounds, chances]);

    const initCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dpr = window.devicePixelRatio || 1;
        const cssW = canvas.clientWidth;
        if (!cssW) return;
        const cssH = Math.round(cssW * CANVAS_ASPECT);
        canvas.style.height = `${cssH}px`;
        canvas.width = Math.round(cssW * dpr);
        canvas.height = Math.round(cssH * dpr);
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

    const submitGuess = useCallback(() => {
        if (phaseRef.current !== 'playing') return;
        const guess = currentGuessRef.current;
        if (guess.some((c) => c < 0)) return;

        const fb = computeFeedback(guess, codeRef.current);
        guessesRef.current.push([...guess]);
        feedbackRef.current.push(fb);
        currentGuessRef.current = new Array(rounds).fill(-1);

        const used = guessesRef.current.length;
        onProgressRef.current?.(Math.round((used / chances) * 100));

        if (fb.black === rounds) {
            phaseRef.current = 'won';
            drawCanvas();
            onWinRef.current();
        } else if (used >= chances) {
            phaseRef.current = 'lost';
            drawCanvas();
            onLoseRef.current();
        } else {
            drawCanvas();
        }
    }, [rounds, chances, drawCanvas]);

    const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (phaseRef.current === 'idle') {
            phaseRef.current = 'playing';
            drawCanvas();
            return;
        }
        if (phaseRef.current !== 'playing') return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const w = rect.width;
        const h = rect.height;

        const L = computeLayout(w, h, chances, rounds);

        // Palette
        if (y >= h - L.paletteH - PAD / 2) {
            const colorR = Math.min(L.paletteH * 0.36, w / (COLORS.length * 2.6));
            const paletteY = h - L.paletteH / 2 - PAD / 2;
            const colorSpacing = w / (COLORS.length + 1);
            for (let i = 0; i < COLORS.length; i++) {
                const cx = colorSpacing * (i + 1);
                const dx = x - cx;
                const dy = y - paletteY;
                if (dx * dx + dy * dy <= (colorR + 6) * (colorR + 6)) {
                    selectedColorRef.current = i;
                    drawCanvas();
                    return;
                }
            }
            return;
        }

        const currentRowIdx = guessesRef.current.length;
        if (currentRowIdx >= chances) return;

        const rowY = L.rowYAt(currentRowIdx);
        if (Math.abs(y - rowY) > L.rowH / 2) return;

        // Submit button
        const submitX = PAD + L.slotsW + ROW_GAP;
        if (x >= submitX && x <= submitX + L.submitW) {
            if (currentGuessRef.current.every((c) => c >= 0)) submitGuess();
            return;
        }

        // Slot
        if (x >= PAD && x < PAD + L.slotsW) {
            const col = Math.floor((x - PAD) / L.slotW);
            if (col < 0 || col >= rounds) return;
            const current = currentGuessRef.current[col];
            currentGuessRef.current[col] =
                current === selectedColorRef.current ? -1 : selectedColorRef.current;
            drawCanvas();
        }
    }, [rounds, chances, drawCanvas, submitGuess]);

    return (
        <div className="mastermind-game">
            <canvas
                ref={canvasRef}
                className="mastermind-game__canvas"
                onClick={handleClick}
            />
        </div>
    );
};

export default MasterMind;
