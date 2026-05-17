import { useEffect, useRef, useState } from 'react';

type LineClass = 'ok' | 'warn' | 'err' | 'dim';

interface LogLine {
    c: LineClass;
    t: string;
}

const LOG_LINES: LogLine[] = [
    { c: 'ok',   t: '[BOOT]  init.kernel ......... ok' },
    { c: 'dim',  t: '[BOOT]  mounting /dev/codium' },
    { c: 'ok',   t: '[BOOT]  cipher engine v3.1 .. ok' },
    { c: 'dim',  t: '[NET]   probing 198.51.100.0/24' },
    { c: 'warn', t: '[NET]   ICMP throttled @ gw.aggro' },
    { c: 'ok',   t: '[AUTH]  handshake established' },
    { c: 'dim',  t: '[FS]    decrypt manifest.dat' },
    { c: 'ok',   t: '[FS]    sha256 verified' },
    { c: 'dim',  t: '[GFX]   neon shaders compiled' },
    { c: 'err',  t: '[WARN]  trace beacon detected' },
    { c: 'ok',   t: '[WARN]  countermeasures online' },
    { c: 'dim',  t: '[STN]   loading station_bg.png' },
    { c: 'ok',   t: '[STN]   parallax routing ok' },
    { c: 'dim',  t: '[SYS]   awaiting operator...' },
];

const MAX_LINES = 9;
const INTERVAL_MS = 850;

export default function TerminalLog() {
    const [lines, setLines] = useState<LogLine[]>([{ c: 'dim', t: 'boot sequence...' }]);
    const idx = useRef(0);

    useEffect(() => {
        const id = setInterval(() => {
            setLines((prev) => {
                const next = [...prev, LOG_LINES[idx.current % LOG_LINES.length]];
                idx.current += 1;
                return next.slice(-MAX_LINES);
            });
        }, INTERVAL_MS);
        return () => clearInterval(id);
    }, []);

    return (
        <div className="term-log">
            {lines.map((l, i) => (
                <div
                    key={`${idx.current}-${i}`}
                    className={`line ${l.c} ${i === lines.length - 1 ? 'cursor' : ''}`}
                >
                    {l.t}
                </div>
            ))}
        </div>
    );
}
