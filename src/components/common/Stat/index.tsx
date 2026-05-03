import clsx from 'clsx';
import './style.scss';

interface StatProps {
    label: string;
    value: string;
    accent?: string;
    className?: string;
}

export function Stat({ label, value, accent, className }: StatProps) {
    return (
        <div className={clsx('stat', className)}>
            <div className="label">{label}</div>
            <div className={clsx('value', accent ?? undefined)}>{value}</div>
        </div>
    );
}
