import { Box, Chip, LinearProgress, LinearProgressProps, Typography } from '@mui/material';
import './styles.scss';
import { Stat } from '../common/Stat';
import { formatMoney } from '../../lib/utils';
import { CipherState, ICipherType } from '../../includes/Cipher.interface';
import clsx from 'clsx';
import { useCipherBreakStore } from '../../stores/cipher';

export function CipherInfo({ cipherType }: { cipherType: ICipherType | undefined; }) {
    return (
        <Box className="cipher-info-container">
            <Stat label="Payout" value={`$${formatMoney(cipherType?.payout)}`} accent="income" />
            <Stat label="XP" value={`${cipherType?.xp} XP`} />
        </Box>
    );
}

export function CipherProgressBar({
    id,
    cipherType,
    cipherState,
}: {
    id: string;
    cipherType: ICipherType | undefined;
    cipherState: CipherState | undefined;
}) {
    const progress = useCipherBreakStore((s) => s.entries[id]?.progress) ?? 0;

    return (
        <div className="progress">
            <LinearProgressWithLabel
                variant="determinate"
                value={progress}
                type={cipherType}
                status={cipherState}
            />
        </div>
    );
}

function LinearProgressWithLabel(
    props: LinearProgressProps & { value: number; type?: ICipherType | undefined; status?: CipherState },
) {
    const { status = CipherState.IDLE, type } = props;

    let statusClassName = 'idle';
    switch (status) {
        case CipherState.BREAKING:
            statusClassName = 'breaking';
            break;
        case CipherState.DOWNLOADING:
            statusClassName = 'downloading';
            break;
        case CipherState.SUCCESS:
            statusClassName = 'success';
            break;
        case CipherState.CANCELLED:
            statusClassName = 'cancelled';
            break;
        case CipherState.FAILURE:
            statusClassName = 'cancelled';
            break;
        case CipherState.PAUSED:
            statusClassName = 'paused';
            break;
    }

    return (
        <Box className="cipher-progress-bar-container">
            <Box className="cipher-progress-header" sx={{ display: 'flex', alignItems: 'center' }}>
                {status && (
                    <Box sx={{ textAlign: 'left', flex: '1 1 0', justifyContent: 'flex-start', m: 0, whiteSpace: 'nowrap' }}>
                        <Chip className={clsx('cipher-progress-chip', statusClassName)} label={status.toString()} />
                        <span className="cipher-progress-complexity">C{type?.complexity} · x{type?.parallelism}</span>
                    </Box>
                )}
                <Box sx={{ textAlign: 'right', flex: '1 1 0', justifyContent: 'flex-end', m: 0 }}>
                    <Typography
                        className="cipher-progress-percentage"
                        variant="body2"
                        sx={{ color: 'text.secondary' }}
                    >{`${Math.round(props.value)}%`}</Typography>
                </Box>
            </Box>
            <Box className="cipher-progress-container">
                <LinearProgress className={clsx('cipher-progress-bar', statusClassName)} variant="determinate" {...props} />
            </Box>
        </Box>
    );
}