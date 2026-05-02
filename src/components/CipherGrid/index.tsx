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

// ─── WebGL atlas layout ───────────────────────────────────────────────────────
// CHAR_SET has 75 chars = 15 × 5 grid of glyph cells in the texture atlas.
const ATLAS_COLS = 15;
const ATLAS_ROWS = 5;
const ATLAS_CHAR_W = 48; // glyph cell width in atlas pixels
const ATLAS_CHAR_H = 60; // glyph cell height in atlas pixels

// ─── GLSL shaders ────────────────────────────────────────────────────────────
const VERT_SRC = `#version 300 es
in vec2  a_quad;     // (0,0)→(1,1) corner of the quad
in float a_col;      // grid column  (instance)
in float a_row;      // grid row     (instance)
in float a_charIdx;  // atlas char index (instance)
in vec4  a_color;    // rgba          (instance)

uniform vec2 u_grid;       // (CIPHER_COLS, CIPHER_ROWS)
uniform vec2 u_atlasGrid;  // (ATLAS_COLS,  ATLAS_ROWS)

out vec2 v_uv;
out vec4 v_color;

void main() {
    vec2 pos = (vec2(a_col, a_row) + a_quad) / u_grid * 2.0 - 1.0;
    gl_Position = vec4(pos.x, -pos.y, 0.0, 1.0);  // flip Y for WebGL

    float ac = mod(a_charIdx, u_atlasGrid.x);
    float ar = floor(a_charIdx / u_atlasGrid.x);
    v_uv   = (vec2(ac, ar) + a_quad) / u_atlasGrid;
    v_color = a_color;
}`;

const FRAG_SRC = `#version 300 es
precision mediump float;
uniform sampler2D u_atlas;
in  vec2 v_uv;
in  vec4 v_color;
out vec4 fragColor;
void main() {
    float mask = texture(u_atlas, v_uv).a;
    fragColor   = vec4(v_color.rgb, v_color.a * mask);
}`;

// ─── WebGL resource bag ───────────────────────────────────────────────────────
type GLResources = {
    gl: WebGL2RenderingContext;
    vao: WebGLVertexArrayObject;
    instBuf: WebGLBuffer;
    instData: Float32Array;       // CIPHER_COLS * CIPHER_ROWS * 7 floats
    uGrid: WebGLUniformLocation;
    uAtlasGrid: WebGLUniformLocation;
};

function compileShader(
    gl: WebGL2RenderingContext,
    type: number,
    src: string,
): WebGLShader {
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS))
        throw new Error(gl.getShaderInfoLog(sh) ?? 'shader compile error');
    return sh;
}

function initGL(canvas: HTMLCanvasElement): GLResources | null {
    const gl = canvas.getContext('webgl2');
    if (!gl) return null;

    const vert = compileShader(gl, gl.VERTEX_SHADER,   VERT_SRC);
    const frag = compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vert);
    gl.attachShader(prog, frag);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
        throw new Error(gl.getProgramInfoLog(prog) ?? 'program link error');
    gl.useProgram(prog);

    const aQuad    = gl.getAttribLocation(prog, 'a_quad');
    const aCol     = gl.getAttribLocation(prog, 'a_col');
    const aRow     = gl.getAttribLocation(prog, 'a_row');
    const aCharIdx = gl.getAttribLocation(prog, 'a_charIdx');
    const aColor   = gl.getAttribLocation(prog, 'a_color');
    const uGrid      = gl.getUniformLocation(prog, 'u_grid')!;
    const uAtlasGrid = gl.getUniformLocation(prog, 'u_atlasGrid')!;

    gl.uniform2f(uGrid,      CIPHER_COLS, CIPHER_ROWS);
    gl.uniform2f(uAtlasGrid, ATLAS_COLS,  ATLAS_ROWS);
    gl.uniform1i(gl.getUniformLocation(prog, 'u_atlas'), 0);

    // ── VAO ──
    const vao = gl.createVertexArray()!;
    gl.bindVertexArray(vao);

    // Quad: two triangles covering one cell (per-vertex, shared)
    const quadBuf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0,0, 1,0, 0,1,
        0,1, 1,0, 1,1,
    ]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(aQuad);
    gl.vertexAttribPointer(aQuad, 2, gl.FLOAT, false, 0, 0);
    // divisor 0 (default) = per-vertex

    // Instance buffer: col row charIdx r g b a  = 7 floats / 28 bytes per cell
    const STRIDE = 7 * 4;
    const total  = CIPHER_COLS * CIPHER_ROWS;
    const instData = new Float32Array(total * 7);

    // Pre-fill col/row — they never change
    for (let i = 0; i < total; i++) {
        instData[i * 7 + 0] = i % CIPHER_COLS;
        instData[i * 7 + 1] = Math.floor(i / CIPHER_COLS);
    }

    const instBuf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, instBuf);
    gl.bufferData(gl.ARRAY_BUFFER, instData, gl.DYNAMIC_DRAW);

    const instAttr = (loc: number, size: number, off: number) => {
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, size, gl.FLOAT, false, STRIDE, off);
        gl.vertexAttribDivisor(loc, 1); // advance once per instance
    };
    instAttr(aCol,     1, 0);
    instAttr(aRow,     1, 4);
    instAttr(aCharIdx, 1, 8);
    instAttr(aColor,   4, 12);

    gl.bindVertexArray(null);

    // ── Atlas texture ─────────────────────────────────────────────────────────
    // White glyphs on transparent background, one cell per char in a 15×5 grid.
    const atl = document.createElement('canvas');
    atl.width  = ATLAS_COLS * ATLAS_CHAR_W;
    atl.height = ATLAS_ROWS * ATLAS_CHAR_H;
    const a2d  = atl.getContext('2d')!;
    a2d.font         = `${Math.round(ATLAS_CHAR_H * 0.75)}px monospace`;
    a2d.fillStyle    = 'white';
    a2d.textAlign    = 'center';
    a2d.textBaseline = 'middle';
    for (let i = 0; i < CHAR_SET.length; i++) {
        a2d.fillText(
            CHAR_SET[i],
            (i % ATLAS_COLS + 0.5) * ATLAS_CHAR_W,
            (Math.floor(i / ATLAS_COLS) + 0.5) * ATLAS_CHAR_H,
        );
    }
    const tex = gl.createTexture()!;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atl);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    return { gl, vao, instBuf, instData, uGrid, uAtlasGrid };
}

function drawGL(res: GLResources, canvas: HTMLCanvasElement) {
    const { gl, vao, instBuf, instData } = res;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, instBuf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, instData);
    gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, CIPHER_COLS * CIPHER_ROWS);
    gl.bindVertexArray(null);
}

export default function CipherGrid({
    id,
    cipherKey,
}: {
    id: string;
    cipherKey: string | undefined;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const glRef     = useRef<GLResources | null>(null);

    // ── Initialize WebGL once ────────────────────────────────────────────────
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        try { glRef.current = initGL(canvas); }
        catch (e) { console.error('WebGL init failed:', e); }
        return () => {
            glRef.current?.gl.getExtension('WEBGL_lose_context')?.loseContext();
            glRef.current = null;
        };
    }, []);

    // ── Keep canvas buffer matched to display size × dpr ─────────────────────
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const sync = () => {
            const dpr  = window.devicePixelRatio || 1;
            const cssW = canvas.clientWidth;
            if (!cssW) return;
            const cssH = Math.round(cssW * CANVAS_ASPECT);
            canvas.style.height = `${cssH}px`;
            canvas.width  = Math.round(cssW * dpr);
            canvas.height = Math.round(cssH * dpr);
        };
        sync();
        const ro = new ResizeObserver(sync);
        ro.observe(canvas);
        return () => ro.disconnect();
    }, []);

    // ── Download animation — driven by the game loop frame counter ───────────
    // Registers a handler in downloadTickHandlers keyed on id+cipherKey so each
    // new cipher instance gets fresh animation state. The handler is called by
    // the cipher's downloading() method on every game loop frame, so it pauses
    // automatically whenever the game loop pauses.
    useEffect(() => {
        const total = CIPHER_COLS * CIPHER_ROWS;

        const cellChars = new Uint8Array(total);
        const cellRGB   = new Float32Array(total * 3);
        for (let i = 0; i < total; i++) {
            cellChars[i] = Math.floor(Math.random() * 73);
            const [r, g, b] = CELL_COLORS_RGB[Math.floor(Math.random() * 3)];
            cellRGB[i * 3] = r; cellRGB[i * 3 + 1] = g; cellRGB[i * 3 + 2] = b;
        }
        const fillOrder       = Array.from({ length: total }, (_, i) => i).sort(() => Math.random() - 0.5);
        const filled          = new Uint8Array(total);
        let   prevFilledCount = 0;
        const colPos          = new Float32Array(CIPHER_COLS).map(() => Math.random() * CIPHER_ROWS);
        const colSpeed        = new Float32Array(CIPHER_COLS).map(() => 0.06 + Math.random() * 0.1);
        const colTrail        = new Uint8Array(CIPHER_COLS).map(() => 3 + Math.floor(Math.random() * 5));

        downloadTickHandlers.set(id, (_frame) => {
            const canvas = canvasRef.current;
            const res    = glRef.current;
            if (!canvas || !res) return;

            const { instData } = res;
            const progress    = useCipherBreakStore.getState().entries[id]?.progress ?? 0;
            const filledCount = Math.round((progress / 100) * total);

            for (let i = prevFilledCount; i < filledCount; i++) filled[fillOrder[i]] = 1;
            prevFilledCount = filledCount;

            for (let i = 6; i < instData.length; i += 7) instData[i] = 0;

            for (let i = 0; i < filledCount; i++) {
                const idx  = fillOrder[i];
                const base = idx * 7;
                instData[base + 2] = cellChars[idx];
                instData[base + 3] = cellRGB[idx * 3];
                instData[base + 4] = cellRGB[idx * 3 + 1];
                instData[base + 5] = cellRGB[idx * 3 + 2];
                instData[base + 6] = 1;
            }

            for (let c = 0; c < CIPHER_COLS; c++) {
                colPos[c] = (colPos[c] + colSpeed[c]) % CIPHER_ROWS;
                const headRow = Math.floor(colPos[c]);
                const trail   = colTrail[c];

                for (let t = 0; t < trail; t++) {
                    const row = (headRow - t + CIPHER_ROWS) % CIPHER_ROWS;
                    const idx = row * CIPHER_COLS + c;
                    if (filled[idx]) continue;
                    const frac = 1 - t / trail;
                    const base = idx * 7;
                    instData[base + 2] = Math.floor(Math.random() * 73);
                    if (t === 0) {
                        instData[base + 3] = 0.8; instData[base + 4] = 1; instData[base + 5] = 0.8;
                        instData[base + 6] = 1;
                    } else {
                        instData[base + 3] = 0;
                        instData[base + 4] = (55 + 165 * frac) / 255;
                        instData[base + 5] = 0;
                        instData[base + 6] = frac * 0.75;
                    }
                }
            }

            drawGL(res, canvas);
        });

        return () => { downloadTickHandlers.delete(id); };
    }, [id, cipherKey]);

    // ── Breaking-phase renderer ───────────────────────────────────────────────
    useEffect(() => {
        cipherGridRenderers.set(id, (chars, classes) => {
            const canvas = canvasRef.current;
            const res    = glRef.current;
            if (!canvas || !res) return;

            const { instData } = res;
            if (chars.length === 0) {
                for (let i = 6; i < instData.length; i += 7) instData[i] = 0;
            } else {
                for (let i = 0; i < chars.length; i++) {
                    const base      = i * 7;
                    const [r, g, b] = CELL_COLORS_RGB[classes[i]] ?? CELL_COLORS_RGB[0];
                    instData[base + 2] = chars[i];
                    instData[base + 3] = r;
                    instData[base + 4] = g;
                    instData[base + 5] = b;
                    instData[base + 6] = 1;
                }
            }

            drawGL(res, canvas);
        });
        return () => { cipherGridRenderers.delete(id); };
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