import { CardHeader, CardHeaderProps } from '@mui/material';
import GlyphWall, { GlyphWallProps } from '../GlyphWall';

import omit from 'lodash/omit';

import './styles.scss';
import clsx from 'clsx';

export interface GlyphCardHeaderProps extends CardHeaderProps {
    glyphColor?: string;
    glyphCount?: GlyphWallProps['count'];
    online?: boolean;
}

export default function GlyphCardHeader({
    online = false,
    glyphColor = '#0af5b0',
    glyphCount,
    className,
    ...cardHeaderProps
}: GlyphCardHeaderProps) {
    return (
        <div className={className ? `glyph-card-header ${className}` : 'glyph-card-header'}>
            <GlyphWall color={glyphColor} count={glyphCount} />
            <CardHeader title={<div className="glyph-card-header__title"><span className={clsx('dot', online && 'online live-dot')} />{cardHeaderProps.title}</div>} {...omit(cardHeaderProps, ['title'])} className="glyph-card-header__header" />
        </div>
    );
}
