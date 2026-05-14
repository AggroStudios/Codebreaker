import { Box } from '@mui/material';
import clsx from 'clsx';
import './style.scss';

interface LinearProgressProps {
    total: number;
    current: number;
    success: number;
    failure: number;
    showLabel?: boolean;
    decimals?: number;
    color?: 'accent' | 'blue' | 'cyan' | 'orange' | 'red' | 'purple';
    className?: string;
}

export function LinearProgress({
    total,
    current,
    success: _success,
    failure,
    showLabel = true,
    decimals = 1,
    color = 'accent',
    className,
}: LinearProgressProps) {
    const safeTotal = Math.max(0, total);
    const safeCurrent = Math.max(0, Math.min(current, safeTotal));
    const safeFailure = Math.max(0, Math.min(failure, safeCurrent));

    const fillPercent = safeTotal > 0 ? (safeCurrent / safeTotal) * 100 : 0;
    const failurePercentOfFill = safeCurrent > 0 ? (safeFailure / safeCurrent) * 100 : 0;

    return (
        <Box className={clsx('linear-progress', color, className)}>
            <Box
                className="linear-progress-fill"
                style={{ width: `${fillPercent}%` }}
            >
                {failurePercentOfFill > 0 && (
                    <Box
                        className="linear-progress-failure"
                        style={{ width: `${failurePercentOfFill}%` }}
                    />
                )}
            </Box>
            {showLabel && (
                <span className="linear-progress-label">
                    {fillPercent.toFixed(decimals)}%
                </span>
            )}
        </Box>
    );
}
