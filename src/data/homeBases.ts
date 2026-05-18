import { HomeBase } from '../includes/Character.interface';

export const HOME_BASES: HomeBase[] = [
    { id: 'tyo', city: 'Tokyo',     name: 'Free Port',   meta: 'JP · 32 Tbps', color: '#26c6da' },
    { id: 'rkv', city: 'Reykjavik', name: 'Cold Site',   meta: 'IS · −4°C',    color: '#61dafb' },
    { id: 'gru', city: 'São Paulo', name: 'Grid Sub-7',  meta: 'BR · Mesh',    color: '#ff9800' },
    { id: 'lgs', city: 'Lagos',     name: 'Sandbox',     meta: 'NG · Tier-A',  color: '#0af5b0' },
];

export const HOME_BASE_BY_ID: Record<string, HomeBase> = Object.fromEntries(
    HOME_BASES.map((b) => [b.id, b]),
);
