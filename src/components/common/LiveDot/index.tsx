import { styled } from '@mui/material/styles';

interface LiveDotProps {
    color?: string;
    online?: boolean;
}

declare module '@mui/material/styles' {
    interface Components {
        LiveDot?: {
            defaultProps?: LiveDotProps;
        };
    }
}

export const LiveDot = styled('span', {
    name: 'LiveDot',
    slot: 'root',
    shouldForwardProp: (prop) => prop !== 'color' && prop !== 'online',
    overridesResolver: (props: any, styles: any) => ({
        ...styles.root,
        ...(props?.online ? styles.online : {}),
        ...(props?.online && props?.color && {
            backgroundColor: props.theme.palette[props.color].main,
            boxShadow: `0 0 6px ${props.theme.palette[props.color].main}`,
        })
    })
})<LiveDotProps>({});