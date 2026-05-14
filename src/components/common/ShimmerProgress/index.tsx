import { Box, LinearProgress } from '@mui/material';
import './style.scss';
import clsx from 'clsx';

const SHIMMER_DURATION_MS = 5000;

interface ShimmerProgressProps {
    title?: React.ReactNode;
    value: number;
    subheader?: React.ReactNode;
    color: string;
}

export function ShimmerProgress({ title, value, subheader, color }: ShimmerProgressProps) {
    return (
        <Box className="shimmer-progress-container">
            {title && <Box className="shimmer-progress-header">
                {title}
            </Box>}
            <LinearProgress
                className={clsx('shimmer-progress-bar', color)}
                variant="determinate"
                value={value}
                style={{
                    '--progress': `${value}%`,
                    '--shimmer-delay': `-${Date.now() % SHIMMER_DURATION_MS}ms`,
                } as Record<string, string>}
            />
            {subheader && <Box className="shimmer-progress-footer">
                {subheader}
            </Box>}
        </Box>
    );
}