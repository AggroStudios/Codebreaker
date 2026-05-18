import { ReactElement } from 'react';
import Box from '@mui/material/Box';
import CardHeader, { CardHeaderProps } from '@mui/material/CardHeader';
import GlyphWall, { GlyphWallProps } from '../GlyphWall';
import Typography from '@mui/material/Typography';
import { LiveDot } from '../LiveDot';
import { alpha, styled } from '@mui/material/styles';

export interface GlyphCardHeaderProps extends CardHeaderProps {
    avatar?: ReactElement;
    action?: ReactElement;
    color?: string;
    glyphCount?: GlyphWallProps['count'];
    online?: boolean;
    title: string;
}

const GlyphCardHeaderWrapper = styled(Box, {
    name: 'GlyphCardHeader',
    slot: 'root',
    shouldForwardProp: (prop) => prop !== 'color',
    overridesResolver: (props: any, styles: any) => ({
        ...styles.root,
        ...(props?.color ? {
            background: `linear-gradient(180deg, ${alpha(props.theme.palette[props.color].main, 0.12)} 0%, rgba(0, 0, 0, 0) 100%)`,
        } : {
            background: `linear-gradient(180deg, ${alpha(props.theme.palette.accent.main, 0.12)} 0%, rgba(0, 0, 0, 0) 100%)`,
        })
    })
})({});

export default function GlyphCardHeader({
    color,
    glyphCount = 24,
    online = false,
    subheader,
    title,
    ...rest
}: GlyphCardHeaderProps) {
    return (
        <GlyphCardHeaderWrapper color={color}>
            <GlyphWall color={color} count={glyphCount} />
            <CardHeader
                disableTypography
                subheader={
                    <Typography noWrap variant="caption">
                        {subheader}
                    </Typography>
                }
                title={
                    <Typography noWrap variant="h2">
                        <LiveDot color="accent" online={online}/>{title}
                    </Typography>
                }
                {...rest}
            />
        </GlyphCardHeaderWrapper>
    );
}
