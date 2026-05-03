import clsx from 'clsx';
import './style.scss';

export function Stat({ label, value, accent }: { label: string, value: string, accent?: string }) {
    return (
        <div className="stat">
            <div className="label">{label}</div>
            <div className={clsx('value', accent ?? undefined)}>{value}</div>
        </div>
    );
}
