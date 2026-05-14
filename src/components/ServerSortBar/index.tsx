import { clsx } from 'clsx';
import './style.scss';
import { Card, CardContent, styled, ToggleButton, toggleButtonClasses, ToggleButtonGroup, toggleButtonGroupClasses } from '@mui/material';
import { Server } from '../../includes/Servers.interface';
import { useEffect, useState } from 'react';
import { VerticalAlignBottomOutlined, VerticalAlignTopOutlined } from '@mui/icons-material';

export interface ServerSortBarProps {
    servers: Server[];
    totalServers: number;
    className?: string;
    onSort: (sortBy: string) => void;
}

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
    gap: '1rem',
    [`& .${toggleButtonGroupClasses.firstButton}, & .${toggleButtonGroupClasses.middleButton}`]: {
        borderTopRightRadius: (theme.vars || theme).shape.borderRadius,
        borderBottomRightRadius: (theme.vars || theme).shape.borderRadius,
    },
    [`& .${toggleButtonGroupClasses.lastButton}, & .${toggleButtonGroupClasses.middleButton}`]: {
        borderTopLeftRadius: (theme.vars || theme).shape.borderRadius,
        borderBottomLeftRadius: (theme.vars || theme).shape.borderRadius,
        borderLeft: `1px solid ${(theme.vars || theme).palette.divider}`,
    },
    [`& .${toggleButtonGroupClasses.lastButton}.${toggleButtonClasses.disabled}, & .${toggleButtonGroupClasses.middleButton}.${toggleButtonClasses.disabled}`]: {
        borderLeft: `1px solid ${(theme.vars || theme).palette.action.disabledBackground}`,
    },
}));

export default function ServerSortBar({ servers, totalServers, className, onSort }: ServerSortBarProps) {

    const [sortBy, setSortBy] = useState<string>('tierAsc');

    const handleSortChange = (_: React.MouseEvent<HTMLElement>, value: string | null) => {
        if (value) {
            setSortBy(value);
        }
    };

    useEffect(() => {
        onSort(sortBy);
    }, [sortBy]);

    return (
        <Card className={clsx('server-sort', 'background', className)} elevation={0}>
            <CardContent>
                <div className="server-sort-bar__container">
                    <div className="server-sort-bar__show-items">
                        <span className="server-sort-bar__show-items-label">Showing <span className="accent">{servers.length}</span> / {totalServers} units</span>
                    </div>
                    <div className="server-sort-bar__item">
                        <span className="server-sort-bar__item-label">Sort</span>
                        <StyledToggleButtonGroup value={sortBy} exclusive onChange={handleSortChange}>
                            <ToggleButton className="server-sort-bar__item-button" value="tierAsc">Tier <VerticalAlignTopOutlined /></ToggleButton>
                            <ToggleButton className="server-sort-bar__item-button" value="tierDesc">Tier <VerticalAlignBottomOutlined /></ToggleButton>
                            <ToggleButton className="server-sort-bar__item-button" value="priceAsc">Price <VerticalAlignTopOutlined /></ToggleButton>
                            <ToggleButton className="server-sort-bar__item-button" value="priceDesc">Price <VerticalAlignBottomOutlined /></ToggleButton>
                        </StyledToggleButtonGroup>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};