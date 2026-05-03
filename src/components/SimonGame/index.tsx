import { useRef, useEffect, useCallback } from 'react';
import './style.scss';
import { MiniGameProps } from '../../includes/minigame.interfaces';
import { CIPHER_COLS, CIPHER_ROWS, CELL_W, CELL_H } from '../CipherGrid';
import { useMusicPlayerStore } from '../../stores/musicPlayer';
import simonSound1 from './audio/simonSound1.mp3';
import simonSound2 from './audio/simonSound2.mp3';
import simonSound3 from './audio/simonSound3.mp3';
import simonSound4 from './audio/simonSound4.mp3';

const CANVAS_ASPECT = (CIPHER_ROWS * CELL_H) / (CIPHER_COLS * CELL_W);

type GamePhase = 'idle' | 'showing' | 'input' | 'won' | 'lost';

interface ButtonDef {
  dimColor: string;
  brightColor: string;
  glowColor: string;
  startAngle: number;
  endAngle: number;
  sound: string;
}

// Quadrant layout (canvas angles: 0=right, clockwise, Y-down)
// Green=top-left, Red=top-right, Blue=bottom-right, Yellow=bottom-left
const BUTTONS: ButtonDef[] = [
  { dimColor: '#1a4a2e', brightColor: '#2ecc71', glowColor: '#2ecc71', startAngle: -Math.PI,      endAngle: -Math.PI / 2, sound: simonSound1 },
  { dimColor: '#4a1a1a', brightColor: '#e74c3c', glowColor: '#e74c3c', startAngle: -Math.PI / 2,  endAngle: 0, sound: simonSound2 },
  { dimColor: '#1a2a4a', brightColor: '#3498db', glowColor: '#3498db', startAngle: 0,              endAngle: Math.PI / 2, sound: simonSound3 },
  { dimColor: '#4a3a00', brightColor: '#f39c12', glowColor: '#f39c12', startAngle: Math.PI / 2,   endAngle: Math.PI, sound: simonSound4 },
];

const GAP = 0.06; // radians gap between segments

export const SimonGame: React.FC<MiniGameProps> = ({ rounds = 5, chances = 3, onWin, onLose, onProgress }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef<GamePhase>('idle');
  const sequenceRef = useRef<number[]>([]);
  const roundRef = useRef(0);
  const inputCountRef = useRef(0);
  const chancesLeftRef = useRef(chances);
  const sfxVolume = useMusicPlayerStore((s) => s.sfxVolume);
  const mutedSfx = useMusicPlayerStore((s) => s.mutedSfx);

  const drawCanvas = useCallback((activeBtn: number | null, phase: GamePhase, currentRound: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    const cx = w / 2;
    const cy = h / 2;
    const outerR = Math.min(cx, cy) * 0.88;
    const innerR = outerR * 0.32;

    ctx.clearRect(0, 0, w, h);

    BUTTONS.forEach((btn, i) => {
      const isActive = activeBtn === i;
      if (isActive) {
        try {
          const sound = new Audio(btn.sound);
          console.log('sfxVolume', sfxVolume);
          console.log('mutedSfx', mutedSfx);
          sound.volume = mutedSfx ? 0 : sfxVolume;
          sound.play();
        }
        catch (error) {
          console.error('Error playing sound:', error);
        }
      }

      ctx.beginPath();
      ctx.arc(cx, cy, innerR, btn.startAngle + GAP, btn.endAngle - GAP, false);
      ctx.arc(cx, cy, outerR, btn.endAngle - GAP, btn.startAngle + GAP, true);
      ctx.closePath();

      ctx.shadowBlur = isActive ? 28 : 0;
      ctx.shadowColor = btn.glowColor;
      ctx.fillStyle = isActive ? btn.brightColor : btn.dimColor;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.strokeStyle = 'rgba(0,0,0,0.55)';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Center disc
    ctx.beginPath();
    ctx.arc(cx, cy, innerR - 3, 0, Math.PI * 2);
    ctx.fillStyle = '#080c0a';
    ctx.fill();
    ctx.strokeStyle = phase === 'input' ? '#0af5b0' : 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Chances dots
    if (phase === 'showing' || phase === 'input') {
      const chancesLeft = chancesLeftRef.current;
      const dotR = Math.max(2, innerR * 0.09);
      const dotSpacing = dotR * 2.6;
      const totalDotsW = chances * dotSpacing - (dotSpacing - dotR * 2);
      const dotStartX = cx - totalDotsW / 2 + dotR;
      const dotY = cy + innerR * 0.52;
      for (let i = 0; i < chances; i++) {
        ctx.beginPath();
        ctx.arc(dotStartX + i * dotSpacing, dotY, dotR, 0, Math.PI * 2);
        if (i < chancesLeft) {
          ctx.fillStyle   = '#0af5b0';
          ctx.shadowColor = '#0af5b0';
          ctx.shadowBlur  = 6;
        } else {
          ctx.fillStyle  = 'rgba(255,255,255,0.12)';
          ctx.shadowBlur = 0;
        }
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    }

    // Center labels
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const mainSize = Math.floor(innerR * 0.38);
    const subSize  = Math.floor(innerR * 0.28);

    if (phase === 'idle') {
      ctx.fillStyle = 'rgba(255,255,255,0.72)';
      ctx.font = `600 ${mainSize}px Inter, system-ui, sans-serif`;
      ctx.fillText('CLICK', cx, cy - subSize * 0.45);
      ctx.fillStyle = 'rgba(255,255,255,0.32)';
      ctx.font = `${subSize}px Inter, system-ui, sans-serif`;
      ctx.fillText('TO START', cx, cy + subSize * 0.95);
    } else if (phase === 'showing' || phase === 'input') {
      ctx.fillStyle = phase === 'input' ? '#0af5b0' : 'rgba(255,255,255,0.55)';
      ctx.font = `600 ${mainSize}px Inter, system-ui, sans-serif`;
      ctx.fillText(`${currentRound} / ${rounds}`, cx, cy - subSize * 1.6);
      ctx.font = `${subSize}px Inter, system-ui, sans-serif`;
      ctx.fillText(phase === 'input' ? 'YOUR TURN' : 'WATCH', cx, cy);
    } else if (phase === 'won') {
      ctx.fillStyle = '#2ecc71';
      ctx.shadowColor = '#2ecc71';
      ctx.shadowBlur = 16;
      ctx.font = `700 ${mainSize}px Inter, system-ui, sans-serif`;
      ctx.fillText('WIN!', cx, cy);
    } else if (phase === 'lost') {
      ctx.fillStyle = '#e74c3c';
      ctx.shadowColor = '#e74c3c';
      ctx.shadowBlur = 16;
      ctx.font = `700 ${mainSize}px Inter, system-ui, sans-serif`;
      ctx.fillText('FAIL', cx, cy);
    }
  }, [rounds, chances, sfxVolume, mutedSfx]);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr  = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth;
    if (!cssW) return;
    const cssH = Math.round(cssW * CANVAS_ASPECT);
    canvas.style.height = `${cssH}px`;
    canvas.width  = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);
    drawCanvas(null, phaseRef.current, roundRef.current);
  }, [drawCanvas]);

  useEffect(() => {
    initCanvas();
    const ro = new ResizeObserver(initCanvas);
    if (canvasRef.current) ro.observe(canvasRef.current);
    return () => ro.disconnect();
  }, [initCanvas]);

  const showSequence = useCallback((seq: number[], roundNum: number) => {
    phaseRef.current = 'showing';
    drawCanvas(null, 'showing', roundNum);

    const slice = seq.slice(0, roundNum);
    let i = 0;

    const step = () => {
      if (i >= slice.length) {
        phaseRef.current = 'input';
        inputCountRef.current = 0;
        drawCanvas(null, 'input', roundNum);
        return;
      }
      const btn = slice[i];
      drawCanvas(btn, 'showing', roundNum);
      setTimeout(() => {
        drawCanvas(null, 'showing', roundNum);
        i++;
        setTimeout(step, 300);
      }, 600);
    };

    setTimeout(step, 500);
  }, [drawCanvas]);

  const startGame = useCallback(() => {
    const seq = Array.from({ length: rounds }, () => Math.floor(Math.random() * 4));
    sequenceRef.current = seq;
    roundRef.current = 1;
    inputCountRef.current = 0;
    chancesLeftRef.current = chances;
    showSequence(seq, 1);
    onProgress(0);
  }, [rounds, chances, showSequence, onProgress]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x  = e.clientX - rect.left;
    const y  = e.clientY - rect.top;
    const cx = rect.width  / 2;
    const cy = rect.height / 2;
    const outerR = Math.min(cx, cy) * 0.88;
    const innerR = outerR * 0.32;
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const phase = phaseRef.current;

    if (phase === 'won' || phase === 'lost') return;

    if (phase === 'idle') {
      if (dist <= outerR) startGame();
      return;
    }

    if (phase !== 'input' || dist < innerR || dist > outerR) return;

    const angle = Math.atan2(dy, dx);
    let clicked: number;
    if      (angle >= -Math.PI    && angle < -Math.PI / 2) clicked = 0;
    else if (angle >= -Math.PI / 2 && angle < 0)           clicked = 1;
    else if (angle >= 0            && angle < Math.PI / 2)  clicked = 2;
    else                                                     clicked = 3;

    const currentRound = roundRef.current;

    drawCanvas(clicked, 'input', currentRound);
    setTimeout(() => drawCanvas(null, 'input', currentRound), 200);

    const progress = Math.round((currentRound / rounds) * 100);

    const inputPos = inputCountRef.current;
    if (clicked !== sequenceRef.current[inputPos]) {
      chancesLeftRef.current--;
      if (chancesLeftRef.current <= 0) {
        phaseRef.current = 'lost';
        setTimeout(() => {
          drawCanvas(null, 'lost', currentRound);
          onLose();
          onProgress(100);
        }, 220);
      } else {
        phaseRef.current = 'showing';
        setTimeout(() => showSequence(sequenceRef.current, currentRound), 400);
      }
      return;
    }

    inputCountRef.current = inputPos + 1;

    if (inputCountRef.current === currentRound) {
      const next = currentRound + 1;
      if (next > rounds) {
        phaseRef.current = 'won';
        setTimeout(() => {
          drawCanvas(null, 'won', currentRound);
          onProgress(100);
          onWin();
        }, 220);
      } else {
        roundRef.current = next;
        onProgress(progress);
        setTimeout(() => showSequence(sequenceRef.current, next), 500);
      }
    }
  }, [startGame, drawCanvas, rounds, onWin, onLose, onProgress, showSequence]);

  return (
    <div className="simon-game">
      <canvas
        ref={canvasRef}
        className="simon-game__canvas"
        onClick={handleClick}
      />
    </div>
  );
}

export default SimonGame;
