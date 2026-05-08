import { useEffect, useRef, useState } from 'react';
import { IDataCenter, IDataCenterContractsByRegion } from '../../includes/DataCenter.interface';
import { DataCenterPin } from './components';
import { projectLngLat, Y_AT_EQUATOR } from '../../lib/utils';

import worldSvgUrl from '../../assets/world.svg?url';

import './style.scss';

// ── SVG coordinate system (matches assets/world.svg) ────────────────────────
const MAP_W = 3882.44;
const MAP_H = 2100;

interface IWorldMapProps {
    dataCenters: IDataCenter[];
    contracts: IDataCenterContractsByRegion;
    selectedId: string;
    onSelect: (id: string) => void;
    selectedDataCenter: IDataCenter | null;
    floatingCard: React.ReactNode;
}

interface IRect {
    x: number;
    y: number;
    w: number;
    h: number;
}

// ── Loaded SVG → extracted <path d="…" /> array ─────────────────────────────
function useWorldPaths() {
    const [paths, setPaths] = useState<string[]>([]);
    useEffect(() => {
        let alive = true;
        fetch(worldSvgUrl)
        .then((r) => r.text())
        .then((txt) => {
            if (!alive) return;
            // crude extract — we only want the d="…" strings
            const out: string[] = [];
            const re = /<path\b[^>]*\bd="([^"]+)"[^>]*>/g;
            let m: RegExpExecArray | null;
            while ((m = re.exec(txt)) !== null) out.push(m[1]);
            setPaths(out);
        })
        .catch(() => setPaths([]));
        return () => {
            alive = false;
        };
    }, []);
    return paths;
}

// ── Map root ────────────────────────────────────────────────────────────────
export function WorldMap({ dataCenters, contracts, selectedId, onSelect, selectedDataCenter, floatingCard }: IWorldMapProps) {
    const paths = useWorldPaths();
    
    // Pan / zoom state — viewBox in SVG units. Initial view = full map.
    const MIN_ZOOM = 1;
    const MAX_ZOOM = 8;
    const [view, setView] = useState<IRect>({ x: 0, y: 0, w: MAP_W, h: MAP_H });
    const [zoom, setZoom] = useState<number>(1);
    const svgRef = useRef<SVGSVGElement>(null);
    const dragRef = useRef<{ startX: number; startY: number; startView: IRect }>(null);
    const movedRef = useRef<boolean>(false);
    
    // Clamp viewBox to the map bounds so you can't pan into empty space.
    const clampView = (x: number, y: number, w: number, h: number) => ({
        x: Math.min(Math.max(0, x), Math.max(0, MAP_W - w)),
        y: Math.min(Math.max(0, y), Math.max(0, MAP_H - h)),
        w,
        h,
    });
    
    const setZoomAt = (newZoom: number, anchorSvgX: number, anchorSvgY: number) => {
        const z = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, newZoom));
        const w = MAP_W / z;
        const h = MAP_H / z;
        const ratioX = (anchorSvgX - view.x) / view.w;
        const ratioY = (anchorSvgY - view.y) / view.h;
        const x = anchorSvgX - ratioX * w;
        const y = anchorSvgY - ratioY * h;
        setView(clampView(x, y, w, h));
        setZoom(z);
    };
    
    const screenToSvg = (clientX: number, clientY: number) => {
        const svg = svgRef.current;
        if (!svg) return [0, 0];
        const rect = svg.getBoundingClientRect();
        const px = (clientX - rect.left) / rect.width;
        const py = (clientY - rect.top) / rect.height;
        return [view.x + px * view.w, view.y + py * view.h];
    };
    
    const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        const [sx, sy] = screenToSvg(e.clientX, e.clientY);
        const factor = e.deltaY < 0 ? 1.18 : 1 / 1.18;
        setZoomAt(zoom * factor, sx, sy);
    };
    
    // attach wheel as a non-passive native listener so preventDefault works
    useEffect(() => {
        const svg = svgRef.current;
        if (!svg) return;
        const handler = (e: WheelEvent) => onWheel(e);
        svg.addEventListener('wheel', handler, { passive: false });
        return () => svg.removeEventListener('wheel', handler);
    });
    
    // Drag uses window-level listeners (not pointer capture) so clicks on
    // child elements like region pins still fire normally.
    const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
        if (e.button !== 0) return;
        movedRef.current = false;
        const startX = e.clientX;
        const startY = e.clientY;
        const startView = { x: view.x, y: view.y, w: view.w, h: view.h };
        dragRef.current = { startX, startY, startView };
        
        const move = (ev: PointerEvent) => {
            const svg = svgRef.current;
            if (!svg) return;
            const rect = svg.getBoundingClientRect();
            const dx = ((ev.clientX - startX) / rect.width) * startView.w;
            const dy = ((ev.clientY - startY) / rect.height) * startView.h;
            if (Math.abs(ev.clientX - startX) + Math.abs(ev.clientY - startY) > 5) {
                movedRef.current = true;
            }
            setView(clampView(startView.x - dx, startView.y - dy, startView.w, startView.h));
        };
        const up = () => {
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', up);
            window.removeEventListener('pointercancel', up);
            // Reset moved flag a tick later so the just-fired click can read it
            setTimeout(() => { movedRef.current = false; dragRef.current = null; }, 0);
        };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
        window.addEventListener('pointercancel', up);
    };
    
    const handlePinClick = (id: string) => {
        if (movedRef.current) return; // suppress click if user just panned
        onSelect(id);
    };
    
    const resetView = () => {
        setView({ x: 0, y: 0, w: MAP_W, h: MAP_H });
        setZoom(1);
    };
    const zoomIn = () => {
        setZoomAt(zoom * 1.4, view.x + view.w / 2, view.y + view.h / 2);
    };
    const zoomOut = () => {
        setZoomAt(zoom / 1.4, view.x + view.w / 2, view.y + view.h / 2);
    };
    
    // Counter-scale pin visuals so they don't blow up when zoomed in
    const pinScale = 1 / zoom;
    const selectedPoint = selectedDataCenter ? projectLngLat(selectedDataCenter.lng, selectedDataCenter.lat) : null;
    const selectedLeftPct = selectedPoint ? ((selectedPoint[0] - view.x) / view.w) * 100 : 0;
    const selectedTopPct = selectedPoint ? ((selectedPoint[1] - view.y) / view.h) * 100 : 0;
    const placeLeft = selectedLeftPct > 55;
    // Use broad top/bottom safe zones so tall cards don't clip.
    const placeHigh = selectedTopPct > 64;
    const placeLow = selectedTopPct < 45;
    
    return (
        <div className="world-map">
            <svg
                ref={svgRef}
                viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
                preserveAspectRatio="xMidYMid meet"
                onPointerDown={onPointerDown}
                style={{
                    cursor: dragRef.current ? 'grabbing' : 'grab',
                }}
            >
                {/* meridian / parallel grid */}
                <g stroke="rgba(255,255,255,0.04)" strokeWidth={1.8} fill="none">
                    {Array.from({ length: 13 }, (_, i) => {
                        const x = (i * MAP_W) / 12;
                        return <line key={`m${i}`} x1={x} y1={0} x2={x} y2={MAP_H} />;
                    })}
                    {Array.from({ length: 9 }, (_, i) => {
                        const y = (i * MAP_H) / 8;
                        return <line key={`p${i}`} x1={0} y1={y} x2={MAP_W} y2={y} />;
                    })}
                </g>
                
                {/* equator emphasis */}
                <line
                    x1={0}
                    y1={Y_AT_EQUATOR}
                    x2={MAP_W}
                    y2={Y_AT_EQUATOR}
                    stroke="rgba(10,245,176,0.10)"
                    strokeWidth={1.8}
                />
                
                {/* country outlines from world.svg — soft fill + accent stroke */}
                <g
                    fill="rgba(10,245,176,0.04)"
                    stroke="rgba(10,245,176,0.55)"
                    strokeWidth={1.6}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    style={{ filter: 'drop-shadow(0 0 2px rgba(10,245,176,0.35))' }}
                >
                    {paths.map((d: string, i: number) => (
                        <path key={i} d={d} />
                    ))}
                </g>
                
                {/* great-circle arcs between owned contracts */}
                <g stroke="rgba(10,245,176,0.22)" strokeWidth={2.2} fill="none">
                    {(() => {
                        const owned = dataCenters.filter((r: IDataCenter) => contracts[r.id]);
                        const lines: React.ReactElement[] = [];
                        for (let i: number = 0; i < owned.length; i++) {
                            for (let j: number = i + 1; j < owned.length; j++) {
                                const a = projectLngLat(owned[i].lng, owned[i].lat);
                                const b = projectLngLat(owned[j].lng, owned[j].lat);
                                const mx = (a[0] + b[0]) / 2;
                                const my = (a[1] + b[1]) / 2 - Math.abs(b[0] - a[0]) * 0.12;
                                lines.push(
                                    <path
                                    key={`${i}-${j}`}
                                    d={`M ${a[0]} ${a[1]} Q ${mx} ${my} ${b[0]} ${b[1]}`}
                                    strokeDasharray="4 6"
                                    />
                                );
                            }
                        }
                        return lines;
                    })()}
                </g>
                
                {/* data center pins */}
                <g>
                    {dataCenters.map((r: IDataCenter) => (
                        <DataCenterPin
                            key={r.id}
                            dataCenter={r}
                            signed={!!contracts[r.id]}
                            selected={selectedId === r.id}
                            onClick={handlePinClick}
                            scale={pinScale}
                        />
                    ))}
                </g>
            </svg>
            
            {/* floating region detail card */}
            {floatingCard && selectedPoint && (
                <div
                    style={{
                        position: 'absolute',
                        left: `${Math.max(2, Math.min(98, selectedLeftPct))}%`,
                        top: placeHigh ? 'auto' : placeLow ? '4%' : `${Math.max(12, Math.min(90, selectedTopPct))}%`,
                        bottom: placeHigh ? '4%' : 'auto',
                        transform: placeLeft ? `translate(-102%, ${placeHigh ? '0%' : placeLow ? '0%' : '-50%'})` : `translate(2%, ${placeHigh ? '0%' : placeLow ? '0%' : '-50%'})`,
                        width: 'min(430px, 42vw)',
                        minWidth: 340,
                        maxHeight: placeHigh || placeLow ? '92%' : '88%',
                        overflow: 'auto',
                        zIndex: 20,
                        pointerEvents: 'auto',
                    }}
                >
                    {floatingCard}
                </div>
            )}
            
            {/* corner overlays */}
            <div
                style={{
                    position: 'absolute',
                    top: 12,
                    left: 14,
                    fontFamily: "'Fira Code', monospace",
                    fontSize: 10,
                    letterSpacing: '0.16em',
                    color: 'rgba(10,245,176,0.85)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                }}
            >
                <span className="live-dot" />GLOBAL UPLINK · {dataCenters.length} NODES TRACKED
            </div>
            <div
                style={{
                    position: 'absolute',
                    bottom: 10,
                    left: 14,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    fontSize: 10,
                    fontFamily: "'Fira Code', monospace",
                    color: 'rgba(255,255,255,0.55)',
                    letterSpacing: '0.10em',
                }}
            >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: '#0af5b0',
                            boxShadow: '0 0 6px #0af5b0',
                        }}
                    />
                    UNDER CONTRACT
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span
                    style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: '#26c6da',
                        opacity: 0.85,
                    }}
                />
                    AVAILABLE
                </span>
            </div>
            <div
                style={{
                    position: 'absolute',
                    bottom: 10,
                    right: 14,
                    fontSize: 10,
                    fontFamily: "'Fira Code', monospace",
                    color: 'rgba(255,255,255,0.45)',
                    letterSpacing: '0.10em',
                }}
            >
                DRAG TO PAN · SCROLL TO ZOOM ↗
            </div>
            
            {/* zoom controls */}
            <div
                style={{
                    position: 'absolute',
                    top: 44,
                    right: 14,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                }}
            >
                {[
                    { glyph: '+', onClick: zoomIn, title: 'Zoom in' },
                    { glyph: '\u2212', onClick: zoomOut, title: 'Zoom out' },
                    { glyph: '\u29C9', onClick: resetView, title: 'Reset view', size: 14 },
                ].map((b: { glyph: string; onClick: () => void; title: string; size?: number }, i: number) => (
                    <button
                        key={i}
                        onClick={b.onClick}
                        title={b.title}
                        style={{
                            width: 28,
                            height: 28,
                            border: '1px solid rgba(10,245,176,0.32)',
                            background: 'rgba(8,12,12,0.78)',
                            color: 'rgba(10,245,176,0.92)',
                            fontFamily: "'Fira Code', monospace",
                            fontSize: b.size || 16,
                            fontWeight: 600,
                            cursor: 'pointer',
                            borderRadius: 4,
                            padding: 0,
                            lineHeight: 1,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {b.glyph}
                    </button>
                ))}
                <div
                    style={{
                        marginTop: 4,
                        padding: '2px 6px',
                        border: '1px solid rgba(255,255,255,0.10)',
                        background: 'rgba(8,12,12,0.78)',
                        color: 'rgba(255,255,255,0.6)',
                        fontFamily: "'Fira Code', monospace",
                        fontSize: 10,
                        textAlign: 'center',
                        borderRadius: 3,
                    }}
                >
                    {zoom.toFixed(1)}×
                </div>
            </div>
        </div>
    );
}

export default WorldMap;
