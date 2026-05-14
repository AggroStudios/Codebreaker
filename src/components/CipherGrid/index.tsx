import { useEffect, useRef } from 'react';
import { cipherGridRenderers, downloadTickHandlers, useCipherBreakStore } from '../../stores/cipher';

// Must match the CHAR_SET order used in Cipher.tsx (_chars indices)
const CHAR_SET =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()/\\-=+,.<>;:01';
// #666 #888 #aaa #ccc #37ff37  — one row per color, [r, g, b] normalised 0-1
const CELL_COLORS_RGB: [number, number, number][] = [
    [0x66 / 255, 0x66 / 255, 0x66 / 255],
    [0x88 / 255, 0x88 / 255, 0x88 / 255],
    [0xaa / 255, 0xaa / 255, 0xaa / 255],
    [0xcc / 255, 0xcc / 255, 0xcc / 255],
    [0x37 / 255, 0xff / 255, 0x37 / 255],
];

export const CIPHER_COLS = 20;
export const CIPHER_ROWS = 10;
export const CELL_W = 12;
export const CELL_H = 14;
const CANVAS_ASPECT = (CIPHER_ROWS * CELL_H) / (CIPHER_COLS * CELL_W);

const TOTAL = CIPHER_COLS * CIPHER_ROWS;
const STRIDE = 7;

function createInstData(): Float32Array {
    const instData = new Float32Array(TOTAL * STRIDE);
    for (let i = 0; i < TOTAL; i++) {
        instData[i * STRIDE + 0] = i % CIPHER_COLS;
        instData[i * STRIDE + 1] = Math.floor(i / CIPHER_COLS);
    }
    return instData;
}

function drawCanvas2D(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    instData: Float32Array,
) {
    const w = canvas.width;
    const h = canvas.height;
    const cellW = w / CIPHER_COLS;
    const cellH = h / CIPHER_ROWS;

    ctx.clearRect(0, 0, w, h);

    const fontPx = Math.max(8, Math.floor(cellH * 0.72));
    ctx.font = `${fontPx}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < TOTAL; i++) {
        const base = i * STRIDE;
        const a = instData[base + 6];
        if (a <= 0.001) {
            continue;
        }

        const col = i % CIPHER_COLS;
        const row = Math.floor(i / CIPHER_COLS);
        const cx = (col + 0.5) * cellW;
        const cy = (row + 0.5) * cellH;

        const charIdx = Math.floor(instData[base + 2]);
        const ch =
            CHAR_SET[Math.min(Math.max(0, charIdx), CHAR_SET.length - 1)] ?? '?';

        const r = Math.round(instData[base + 3] * 255);
        const g = Math.round(instData[base + 4] * 255);
        const b = Math.round(instData[base + 5] * 255);

        ctx.globalAlpha = Math.min(1, a);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillText(ch, cx, cy);
    }

    ctx.globalAlpha = 1;
}

export default function CipherGrid({
    id,
    cipherKey,
}: {
    id: string;
    cipherKey: string | undefined;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const instDataRef = useRef<Float32Array>(createInstData());

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const sync = () => {
            const dpr = window.devicePixelRatio || 1;
            const cssW = canvas.clientWidth;
            if (!cssW) return;
            const cssH = Math.round(cssW * CANVAS_ASPECT);
            canvas.style.height = `${cssH}px`;
            canvas.width = Math.round(cssW * dpr);
            canvas.height = Math.round(cssH * dpr);
        };
        sync();
        const ro = new ResizeObserver(sync);
        ro.observe(canvas);
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        const cellChars = new Uint8Array(TOTAL);
        const cellRGB = new Float32Array(TOTAL * 3);
        for (let i = 0; i < TOTAL; i++) {
            cellChars[i] = Math.floor(Math.random() * 73);
            const [r, g, b] = CELL_COLORS_RGB[Math.floor(Math.random() * 3)];
            cellRGB[i * 3] = r;
            cellRGB[i * 3 + 1] = g;
            cellRGB[i * 3 + 2] = b;
        }
        const fillOrder = Array.from({ length: TOTAL }, (_, i) => i).sort(() => Math.random() - 0.5);
        const filled = new Uint8Array(TOTAL);
        let prevFilledCount = 0;
        const colPos = new Float32Array(CIPHER_COLS).map(() => Math.random() * CIPHER_ROWS);
        const colSpeed = new Float32Array(CIPHER_COLS).map(() => 0.06 + Math.random() * 0.1);
        const colTrail = new Uint8Array(CIPHER_COLS).map(() => 3 + Math.floor(Math.random() * 5));

        downloadTickHandlers.set(id, (_frame) => {
            const canvas = canvasRef.current;
            const instData = instDataRef.current;
            const ctx = canvas?.getContext('2d');
            if (!canvas || !ctx) return;

            const progress = useCipherBreakStore.getState().entries[id]?.progress ?? 0;
            const filledCount = Math.round((progress / 100) * TOTAL);

            for (let i = prevFilledCount; i < filledCount; i++) filled[fillOrder[i]] = 1;
            prevFilledCount = filledCount;

            for (let i = 6; i < instData.length; i += STRIDE) instData[i] = 0;

            for (let i = 0; i < filledCount; i++) {
                const idx = fillOrder[i];
                const base = idx * STRIDE;
                instData[base + 2] = cellChars[idx];
                instData[base + 3] = cellRGB[idx * 3];
                instData[base + 4] = cellRGB[idx * 3 + 1];
                instData[base + 5] = cellRGB[idx * 3 + 2];
                instData[base + 6] = 1;
            }

            for (let c = 0; c < CIPHER_COLS; c++) {
                colPos[c] = (colPos[c] + colSpeed[c]) % CIPHER_ROWS;
                const headRow = Math.floor(colPos[c]);
                const trail = colTrail[c];

                for (let t = 0; t < trail; t++) {
                    const row = (headRow - t + CIPHER_ROWS) % CIPHER_ROWS;
                    const idx = row * CIPHER_COLS + c;
                    if (filled[idx]) continue;
                    const frac = 1 - t / trail;
                    const base = idx * STRIDE;
                    instData[base + 2] = Math.floor(Math.random() * 73);
                    if (t === 0) {
                        instData[base + 3] = 0.8;
                        instData[base + 4] = 1;
                        instData[base + 5] = 0.8;
                        instData[base + 6] = 1;
                    } else {
                        instData[base + 3] = 0;
                        instData[base + 4] = (55 + 165 * frac) / 255;
                        instData[base + 5] = 0;
                        instData[base + 6] = frac * 0.75;
                    }
                }
            }

            drawCanvas2D(ctx, canvas, instData);
        });

        return () => {
            downloadTickHandlers.delete(id);
        };
    }, [id, cipherKey]);

    useEffect(() => {
        cipherGridRenderers.set(id, (chars, classes) => {
            const canvas = canvasRef.current;
            const instData = instDataRef.current;
            const ctx = canvas?.getContext('2d');
            if (!canvas || !ctx) return;

            if (chars.length === 0) {
                for (let i = 6; i < instData.length; i += STRIDE) instData[i] = 0;
            } else {
                for (let i = 0; i < chars.length; i++) {
                    const base = i * STRIDE;
                    const [r, g, b] = CELL_COLORS_RGB[classes[i]] ?? CELL_COLORS_RGB[0];
                    instData[base + 2] = chars[i];
                    instData[base + 3] = r;
                    instData[base + 4] = g;
                    instData[base + 5] = b;
                    instData[base + 6] = 1;
                }
            }

            drawCanvas2D(ctx, canvas, instData);
        });
        return () => {
            cipherGridRenderers.delete(id);
        };
    }, [id]);

    return (
        <canvas
            ref={canvasRef}
            width={CIPHER_COLS * CELL_W}
            height={CIPHER_ROWS * CELL_H}
            className="cipher-break-canvas"
        />
    );
}
