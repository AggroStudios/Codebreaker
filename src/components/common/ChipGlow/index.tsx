import { type ComponentType, ReactNode } from 'react';
import MuiChip, { type ChipProps } from '@mui/material/Chip';
import { alpha, styled } from '@mui/material/styles';

interface ChipGlowComponentProps {
    color: string;
    variant: string;
}

export const ChipGlowComponent = styled(MuiChip as ComponentType<Omit<ChipProps, 'color'>>, {
    name: 'ChipGlow',
    slot: 'root',
    shouldForwardProp: (prop) => prop !== 'color',
    overridesResolver: (props: any, styles: any) => ({
        ...styles.root,
        ...(props?.color && {
            backgroundColor: alpha(props.theme.palette[props.color].main, 0.3),
            boxShadow: `0 0 10px ${props.theme.palette[props.color].main}`,
            border: `1px solid ${props.theme.palette[props.color].light}`,
            '&&:hover': {
                backgroundColor: alpha(props.theme.palette[props.color].main, 0.3),
            }
        }),
        '& .MuiChip-label': {
            padding: props.theme.spacing(0,3),
            ...props?.color && {
                color: props.theme.palette[props.color].light,
                '&:hover': {
                    color: props.theme.palette[props.color].light,
                }
            }
        }
    })
})<ChipGlowComponentProps>({});

interface ChipGlowProps {
    active?: boolean;
    children?: ReactNode;
    color: string;
    label?: string;
    onClick?: () => void;
    size?: 'small' | 'medium';
}

export default function ChipGlow({ color, label, onClick, size = 'medium' }: ChipGlowProps) {
    return (
        <ChipGlowComponent color={color} label={label} onClick={onClick} size={size} variant="outlined" />
    );
}
