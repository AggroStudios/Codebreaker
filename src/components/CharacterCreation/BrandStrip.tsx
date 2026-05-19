import { Box, Typography } from '@mui/material';

export default function BrandStrip() {
    return (
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
    );
}
