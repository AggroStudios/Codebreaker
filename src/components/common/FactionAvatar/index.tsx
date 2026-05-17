import { useMemo } from 'react';
import MuiAvatar from '@mui/material/Avatar';
import { 
    GavelRounded, 
    HubOutlined, 
    LocalFireDepartmentOutlined, 
    Memory, 
    SecurityOutlined, 
    VisibilityOffOutlined 
} from '@mui/icons-material';
import { alpha, styled } from '@mui/material/styles';

const glyphsMap = {
    GavelRounded, 
    HubOutlined, 
    LocalFireDepartmentOutlined, 
    Memory, 
    SecurityOutlined, 
    VisibilityOffOutlined 
};

interface FactionAvatarComponentProps {
    color: string;
    variant: string;
}

export const FactionAvatarComponent = styled(MuiAvatar, {
    name: 'FactionAvatar',
    slot: 'root',
    shouldForwardProp: (prop) => prop !== 'color',
    overridesResolver: (props: any, styles: any) => ({
        ...styles.root,
        ...(props?.color && {
            background: `linear-gradient(${alpha(props.theme.palette[props.color].main, 0.3)}, ${alpha(props.theme.palette[props.color].main, 0.1)})`,
            border: `1px solid ${props.theme.palette[props.color].main}`,
            '& .MuiSvgIcon-root': {
                color: props.theme.palette[props.color].main
            }
        })
    })
})<FactionAvatarComponentProps>({});

interface FactionAvatarProps {
    color: string;
    glyph: string;
}

export default function FactionAvatar({
    color,
    glyph
}: FactionAvatarProps) {
    
    const Icon = useMemo(() => {
        return glyphsMap[glyph]
    },[glyph]);

    return (
        <FactionAvatarComponent color={color} variant="square">
            <Icon />
        </FactionAvatarComponent>
    );
}