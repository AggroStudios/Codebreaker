import { ReactNode } from 'react';
import { Box, Dialog, IconButton, Typography } from '@mui/material';
import { CloseTwoTone } from '@mui/icons-material';
import { SvgIconTypeMap } from '@mui/material/SvgIcon';
import { OverridableComponent } from '@mui/material/OverridableComponent';

interface ServerModalShellProps {
    open: boolean;
    onClose: () => void;
    accent: string;
    icon: OverridableComponent<SvgIconTypeMap<object, 'svg'>>;
    eyebrow: string;
    title: string;
    width?: number;
    /** When true, the close button + backdrop click + Escape are disabled. */
    lockClose?: boolean;
    children: ReactNode;
    footer?: ReactNode;
}

export default function ServerModalShell({
    open,
    onClose,
    accent,
    icon: Icon,
    eyebrow,
    title,
    width = 560,
    lockClose,
    children,
    footer,
}: ServerModalShellProps) {
    return (
        <Dialog
            open={open}
            onClose={(_, reason) => {
                if (lockClose && (reason === 'backdropClick' || reason === 'escapeKeyDown')) return;
                onClose();
            }}
            maxWidth={false}
            slotProps={{
                backdrop: {
                    sx: { background: 'rgba(0,0,0,0.62)', backdropFilter: 'blur(6px)' },
                },
                paper: {
                    sx: {
                        width: '100%',
                        maxWidth: width,
                        background: 'rgba(22,22,22,0.96)',
                        border: `1px solid ${accent}40`,
                        borderRadius: '14px',
                        boxShadow: `0 24px 64px rgba(0,0,0,0.8), 0 0 32px ${accent}26`,
                        overflow: 'hidden',
                    },
                },
                transition: { timeout: { enter: 220, exit: 160 } },
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.5,
                    p: '18px 22px',
                    background: `linear-gradient(180deg, ${accent}10, transparent)`,
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
            >
                <Box
                    sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '10px',
                        background: `${accent}1c`,
                        border: `1px solid ${accent}40`,
                        color: accent,
                        boxShadow: `0 0 16px ${accent}22`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}
                >
                    <Icon />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                        sx={{
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: '0.18em',
                            textTransform: 'uppercase',
                            color: accent,
                        }}
                    >
                        {eyebrow}
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: 20,
                            fontWeight: 700,
                            lineHeight: 1.2,
                            color: 'rgba(255,255,255,0.96)',
                        }}
                    >
                        {title}
                    </Typography>
                </Box>
                <IconButton
                    size="small"
                    onClick={onClose}
                    disabled={lockClose}
                    sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: 'rgba(255,255,255,0.7)',
                    }}
                >
                    <CloseTwoTone fontSize="small" />
                </IconButton>
            </Box>

            <Box sx={{ p: '18px 22px', display: 'flex', flexDirection: 'column', gap: 1.75 }}>
                {children}
            </Box>

            {footer && (
                <Box
                    sx={{
                        p: '14px 22px',
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                        background: 'rgba(0,0,0,0.30)',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 1.25,
                        alignItems: 'center',
                    }}
                >
                    {footer}
                </Box>
            )}
        </Dialog>
    );
}
