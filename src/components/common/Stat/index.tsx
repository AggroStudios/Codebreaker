import clsx from 'clsx';
import './style.scss';

interface StatProps {
    titleIcon?: React.ReactNode;
    titleIconAccent?: string;
    label: string;
    value: string;
    subheader?: string;
    accent?: string;
    className?: string;
}

export function Stat({ titleIcon, titleIconAccent, label, value, subheader, accent, className }: StatProps) {
    return (
        <div className={clsx('stat', className)}>
            <div className="label">{titleIcon && <span className={clsx('title-icon', titleIconAccent)}>{titleIcon}</span>}{label}</div>
            <div className={clsx('value', accent ?? undefined)}>{value}</div>
            {subheader && <div className="subheader">{subheader}</div>}
        </div>
    );
}
