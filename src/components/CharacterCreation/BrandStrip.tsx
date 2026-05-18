import { Box, Typography } from '@mui/material';
import { TerminalTwoTone } from '@mui/icons-material';

export default function BrandStrip() {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                pb: 1.5,
                mb: 2.5,
                borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
        >
            <Box
                sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '6px',
                    background: 'linear-gradient(180deg, #00e5bf, #003d35)',
                    boxShadow: '0 0 12px rgba(10,245,176,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0a0f0d',
                }}
            >
                <TerminalTwoTone sx={{ fontSize: 18 }} />
            </Box>
            <Typography
                sx={{
                    fontSize: 14,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: 'rgba(255,255,255,0.92)',
                }}
            >
                CODEBREAKER
            </Typography>
            <Typography
                sx={{
                    fontFamily: 'Fira Code, monospace',
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.4)',
                }}
            >
                v3.4.1
            </Typography>
            <Box sx={{ flex: 1 }} />
            <Box
                sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.75,
                    px: 1.25,
                    py: 0.5,
                    borderRadius: 9999,
                    background: 'rgba(10,245,176,0.08)',
                    border: '1px solid rgba(10,245,176,0.40)',
                }}
            >
                <Box
                    className="char-live-dot"
                    sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: '#0af5b0',
                        boxShadow: '0 0 6px #0af5b0',
                    }}
                />
                <Typography
                    sx={{
                        fontFamily: 'Fira Code, monospace',
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.18em',
                        color: '#0af5b0',
                    }}
                >
                    ONBOARDING SECURE
                </Typography>
            </Box>
        </Box>
    );
}
