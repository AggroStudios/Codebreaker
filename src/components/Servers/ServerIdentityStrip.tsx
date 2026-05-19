import { Box, Typography } from '@mui/material';

import { Server, ServerTier, ServerTierColor, ServerTiers } from '../../includes/Servers.interface';
import { tierLevelFromEnum } from '../../data/cipherMeta';

interface ServerIdentityStripProps {
    server: Server;
}

const memorySize = (memory: Server['memory']): string => {
    const raw = (memory as unknown as { sizeInGb?: number; size?: number; capacity?: number }) ?? {};
    const gb = raw.sizeInGb ?? raw.size ?? raw.capacity;
    return gb != null ? `${gb}GB` : '— RAM';
};

export default function ServerIdentityStrip({ server }: ServerIdentityStripProps) {
    const tier = server.tier as ServerTier;
    const tierColor = ServerTierColor[tier] ?? '#ffffff';
    const tierLabel = ServerTiers[tier] ?? 'T?';
    const tierIndex = tierLevelFromEnum(tier);

    const cores = server.cpuAmount;
    const threads = cores * server.threadingFactor;
    const ram = memorySize(server.memory);
    const location = server.location ?? '—';
    const nickname = server.name ?? server.model;

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.75,
                p: 1.5,
                background: 'rgba(0,0,0,0.30)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '10px',
            }}
        >
            <Box
                sx={{
                    width: 72,
                    height: 56,
                    borderRadius: '8px',
                    background: `radial-gradient(circle at 50% 50%, ${tierColor}30, transparent 70%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}
            >
                {server.imageSrc && (
                    <Box
                        component="img"
                        src={server.imageSrc}
                        alt={server.model}
                        sx={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.6))',
                        }}
                    />
                )}
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography
                        sx={{
                            fontSize: 15,
                            fontWeight: 600,
                            color: 'rgba(255,255,255,0.92)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {nickname}
                    </Typography>
                    <Box
                        sx={{
                            width: 6,
                            height: 6,
                            background: tierColor,
                            boxShadow: `0 0 6px ${tierColor}aa`,
                        }}
                    />
                    <Typography
                        sx={{
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 9,
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            color: tierColor,
                            border: `1px solid ${tierColor}55`,
                            borderRadius: 9999,
                            px: 0.75,
                            py: 0.125,
                        }}
                    >
                        {tierLabel || `T${tierIndex}`}
                    </Typography>
                </Box>
                <Typography
                    sx={{
                        fontFamily: 'Fira Code, monospace',
                        fontSize: 11,
                        color: 'rgba(255,255,255,0.55)',
                    }}
                >
                    {server.model} · {cores}c/{threads}t · {ram} · {location}
                </Typography>
            </Box>
        </Box>
    );
}

export const useServerSpec = (server: Server) => {
    const cores = server.cpuAmount;
    const threads = cores * server.threadingFactor;
    return { cores, threads };
};
