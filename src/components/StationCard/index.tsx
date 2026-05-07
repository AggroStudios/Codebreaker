import { Avatar, Card, CardActions, CardContent, CardHeader, SvgIconTypeMap } from '@mui/material';

import './style.scss';
import { OverridableComponent } from '@mui/material/OverridableComponent';
import clsx from 'clsx';

export enum StationCardAccentType {
    ACCENT = 'accent',
    CYAN = 'cyan',
}

export interface StationCardAccentProps {
    color: string;
    bgcolor: string;
}

export const StationCardAccent: Record<StationCardAccentType, StationCardAccentProps> = {
    [StationCardAccentType.ACCENT]: {
        color: '#0af5b0',
        bgcolor: 'rgba(10,245,176,0.15)',
    },
    [StationCardAccentType.CYAN]: {
        color: '#26c6da',
        bgcolor: 'rgba(38,198,218,0.15)',
    },
};

export interface StationCardProps {
    ref?: React.RefObject<HTMLDivElement>;
    id?: string;
    avatar: OverridableComponent<SvgIconTypeMap<object, 'svg'>>;
    accent: StationCardAccentType;
    title: string;
    subheader: string;
    headerAction?: React.ReactNode;
    action?: React.ReactNode;
    content: React.ReactNode;
    highlight?: boolean;
}

export default function StationCard(props: StationCardProps) {
    return (
        <Card ref={props.ref} className={clsx('background station-card', props.highlight ? `highlight ${props.accent}` : undefined)} id={props.id}>
            <CardHeader
                avatar={<Avatar sx={{ color: StationCardAccent[props.accent].color, bgcolor: StationCardAccent[props.accent].bgcolor }}><props.avatar /></Avatar>}
                title={props.title}
                subheader={props.subheader}
                slotProps={{
                    title: { noWrap: true },
                }}
                action={props.headerAction}
            />
            <CardContent>
                {props.content}
            </CardContent>
            {props.action &&
                <CardActions disableSpacing sx={{
                    display: 'flex',
                    flexWrap: 'nowrap',
                    alignItems: 'stretch',
                    alignContent: 'space-between',
                    flexDirection: 'row',
                    justifyContent: 'space-between'
                }}>
                    {props.action}
                </CardActions>
            }
        </Card>
    );
}