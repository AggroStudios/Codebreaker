import { Card, CardContent, Box, LinearProgress, Typography } from '@mui/material';
import { usePlayerStore } from '../../../stores/player';
import { useAnchors } from '../../AnchorsContext';
import XpLabel from '../../XpLabel';
import './index.scss';

export default function PlayerLevel() {
    const player = usePlayerStore((s) => s.player);
    const xpLabel = usePlayerStore((s) => s.xpLabel);
    const { xpAnchorRef } = useAnchors();

    return (
        <Card
            sx={{ flexShrink: 0, flexGrow: 0 }}
            ref={(el: HTMLElement | null) => {
                xpAnchorRef.current = el;
            }}
            className="playerLevelCard"
        >
            <CardContent sx={{ padding: 0, '&:last-child': { padding: 0 } }}>
                <Typography variant="body2" className="playerLevelCardHeader">
                    {`Level ${player.level}`}
                </Typography>
                <Box sx={{ width: '100%' }}>
                    {xpLabel?.data?.amount != null && (
                        <XpLabel
                            key={xpLabel.id}
                            amount={xpLabel.data.amount}
                            levelUp={xpLabel.data.levelUp}
                        />
                    )}
                    <LinearProgress
                        variant="determinate"
                        value={
                            (player.experience / player.nextLevel) * 100
                        }
                    />
                    <Typography variant="body2" className="playerLevelCardFooter">
                        {`${player.experience} / ${player.nextLevel} XP`}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
}
