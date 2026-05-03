import { CardHeader, CardHeaderProps } from '@mui/material';
import GlyphWall, { GlyphWallProps } from '../GlyphWall';

import './styles.scss';

export interface GlyphCardHeaderProps extends CardHeaderProps {
    glyphColor?: string;
    glyphCount?: GlyphWallProps['count'];
}

export default function GlyphCardHeader({
    glyphColor = '#0af5b0',
    glyphCount,
    className,
    ...cardHeaderProps
}: GlyphCardHeaderProps) {
    return (
        <div className={className ? `glyph-card-header ${className}` : 'glyph-card-header'}>
            <GlyphWall color={glyphColor} count={glyphCount} />
            <CardHeader {...cardHeaderProps} className="glyph-card-header__header" />
        </div>
    );
}
