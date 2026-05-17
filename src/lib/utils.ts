import isEmpty from 'lodash/isEmpty';

export const dataSizeSuffixes = [
    'B',
    'KB',
    'MB',
    'GB',
    'TB',
    'PB',
    'EB',
    'ZB',
    'YB',
    'BB',
];

export const formatMoney = (money: number, decimalPlaces: number = 2) => {
    return (money || 0).toLocaleString('en-US', {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
    });
}

export const formatPower = (power: number) => {
    const units = ['W', 'kW', 'MW', 'GW', 'TW'];
    const index = Math.floor(Math.log10(power) / 3);
    return `${(power / Math.pow(10, index * 3)).toFixed(0)} ${units[index]}`;
}

export const formatMoneyDay = (money: number) => formatMoney(money) + '/d';
export const formatKw = (power: number) => `${power.toFixed(0)} kW`;
export const formatGbps = (uplink: number) => uplink >= 1000 ? `${(uplink/1000).toFixed(1)} Tbps` : `${uplink} Gbps`;
export const formatMs = (latency: number) => `${latency} ms`;


export const DURATION_UNITS_LONG: ReadonlyArray<string> = ['days', 'hours', 'minutes', 'seconds'];

const DURATION_UNITS: ReadonlyArray<readonly [string, number]> = [
    ['d', 60 * 60 * 24],
    ['h', 60 * 60],
    ['m', 60],
    ['s', 1],
];

/**
 * Convert a duration in seconds into a human readable string like
 * `375d 2h`, `2h 5m`, or `45s`. Shows the `precision` largest non-zero
 * units; defaults to 2. Days are the largest unit (no years/weeks).
 *
 * - Negative inputs are clamped to 0.
 * - Sub-second inputs (including 0) render as `0s`.
 * - Fractional seconds are floored.
 */
export const formatDuration = (seconds: number, raw: boolean = false, showUnits: boolean = true, precision: number = 4): string | string[] => {
    if (!Number.isFinite(seconds) || seconds <= 0) return '0s';

    let remaining = Math.floor(seconds);
    const parts: string[] = [];

    for (const [label, size] of DURATION_UNITS) {
        if (parts.length >= precision) break;
        const value = Math.floor(remaining / size);
        parts.push(`${value}${showUnits ? label : ''}`);
        remaining -= value * size;
    }

    return raw ? parts : parts.join(' ') || '0s';
};

export const dataSizeFromSuffix = ({ size, unit }) => {
    const index = dataSizeSuffixes.indexOf(unit);
    if (index === -1) {
        return size;
    }
    return size * Math.pow(1024, index);
};

export const dataSizeSuffix = (value: number, startPoint: number = 0) => {
    let index = 0;
    let currentValue = value;

    while (
        Math.floor(currentValue / 1024) > 0 &&
        index + startPoint + 1 < dataSizeSuffixes.length
    ) {
        currentValue /= 1024;
        index++;
    }

    return `${Number(currentValue.toFixed(2))} ${dataSizeSuffixes[index + startPoint]}`;
};

export const stripLastSlash = (path: string): string => path.replace(/\/$/, '');
export const stripTrailingSlashes = (path: string): string => {
    while (path.endsWith('/')) {
        path = stripLastSlash(path);
    }
    return path;
};

export const path = class Path {
    static extname(path: string) {
        const exploded = path.split('.');
        if (exploded[0] === '') exploded.shift();
        if (exploded.length > 1) {
            return `.${exploded.pop()}`;
        } else {
            return '';
        }
    }

    static normalize(path: string) {
        if (isEmpty(path)) return;

        return path
            .split('/')
            .reduce((acc: string[], cur: string) => {
                if (cur === '..') {
                    acc.pop();
                } else if (cur !== '.') {
                    acc.push(cur);
                }
                return acc;
            }, [])
            .join('/');
    }

    static parse(path: string) {
        path = this.normalize(path) || '';
        const root = '/';
        const parts = path.split('/').slice(1);
        const base = parts.pop() || '';
        const dir = root + parts.join('/');
        const ext = this.extname(base);
        const name = base.slice(0, base.length - ext.length);

        return {
            root,
            dir,
            base,
            name,
            ext,
        };
    }

    static dirname(path: string) {
        return Path.parse(path).dir;
    }

    static basename(path: string, excludeExt: string = '') {
        const { name, ext, base } = this.parse(path);
        return ext === excludeExt ? name : base;
    }

    static isAbsolute(path: string) {
        return path.startsWith('/');
    }

    static join(...paths: string[]) {
        return this.normalize(paths.join('/'));
    }

    static format(pathObject: { dir: string; base: string }) {
        return (
            `${pathObject.dir}/${pathObject.base}`
                .replaceAll('//', '/')
                .replace(/(.*?)\/$/, '$1') || '/'
        );
    }
};

// viewBox: 0 0 3882.44 2100. The map geometry in this asset aligns best with
// a calibrated linear lon/lat mapping:
// x = X_AT_LNG_MINUS_180 + (lng + 180) * PX_PER_DEG
// y = Y_AT_EQUATOR - lat * PY_PER_DEG
// Constants are fit to the visible world bbox so city pins sit on land.

// Tuned to place NA/EMEA/APAC pins on the visual landmass in this specific SVG.
const X_AT_LNG_MINUS_180 = 135.0;
const PX_PER_DEG = 3402.4 / 360; // 9.479...
const PY_PER_DEG = 9.479;
export const Y_AT_EQUATOR = 1275;

export function projectLngLat(lng: number, lat: number) {
    return [
      X_AT_LNG_MINUS_180 + (lng + 180) * PX_PER_DEG,
      Y_AT_EQUATOR - lat * PY_PER_DEG,
    ];
}