import {
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Drawer,
    Divider,
    Card,
    CardHeader,
    CardContent,
    Box,
    LinearProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link, useLocation } from 'react-router';
import { forwardRef, type ReactNode, type Ref } from 'react';

import LockTwoToneIcon from '@mui/icons-material/LockTwoTone';

import { mainNavigation, secondaryNavigation } from '../lib/navigation';
import { usePlayerStore } from '../stores/player';

import AggroStudios from '../assets/logos/AggroStudios.png';
import './NavMenu.scss';
import XpLabel from './XpLabel';
import { useAnchors } from './AnchorsContext';

const StyledLinkItemButton = styled(ListItemButton)(({ theme }) => ({
    '&.Mui-selected': {
        backgroundColor:
            theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.16)'
                : 'rgba(0, 0, 0, 0.08)',
    },
    '&.Mui-selected:hover': {
        backgroundColor:
            theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.16)'
                : 'rgba(0, 0, 0, 0.08)',
    },
}));

const StyledDrawer = styled(Drawer)({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    top: 0,
    width: 240,
    height: '100%',
    flexShrink: 0,
    '.MuiDrawer-paper': {
        position: 'relative',
        width: 240,
        background: 'rgba(50, 50, 50, 0.85)',
        alignItems: 'stretch',
    },
});

const StyledDrawerContainer = styled('div')({
    overflow: 'auto',
    height: '100%',
    flexDirection: 'column',
    display: 'flex',
});

const StyledDrawerSpacer = styled('div')({
    flexGrow: 1,
});

const RouterLinkInner = (
    props: React.ComponentProps<typeof Link>,
    ref: Ref<HTMLAnchorElement>,
) => <Link ref={ref} {...props} />;
const RouterLink = forwardRef(RouterLinkInner);

const StyledA = styled(RouterLink)({
    '&:hover': {
        color: 'white',
    },
    textDecoration: 'none',
    color: 'inherit',
    display: 'flex',
    width: '100%',
});

function ListItemNavLink(props: {
    to: string;
    disabled?: boolean;
    children: ReactNode;
}) {
    const location = useLocation();
    return (
        <div className="sideNavContainer">
            <StyledLinkItemButton
                disabled={props.disabled}
                selected={location.pathname === props.to}
                {...({ component: StyledA, to: props.to } as object)}
            >
                {props.children}
            </StyledLinkItemButton>
        </div>
    );
}

function MainListItems() {
    return (
        <List>
            {mainNavigation.map((item, key) => {
                const Icon = item.icon;
                return (
                    <ListItemNavLink
                        key={key}
                        disabled={item.locked || false}
                        to={item.link}
                    >
                        <ListItemIcon>
                            {item.locked ? <LockTwoToneIcon /> : <Icon />}
                        </ListItemIcon>
                        <ListItemText
                            primary={item.locked ? 'Locked' : item.title}
                        />
                    </ListItemNavLink>
                );
            })}
        </List>
    );
}

function SecondaryListItems() {
    return (
        <List>
            {secondaryNavigation.map((item, key) => {
                const Icon = item.icon;
                return (
                    <ListItemNavLink key={key} to={item.link}>
                        <ListItemIcon>
                            <Icon />
                        </ListItemIcon>
                        <ListItemText primary={item.title} />
                    </ListItemNavLink>
                );
            })}
        </List>
    );
}

function PlayerLevel() {
    const player = usePlayerStore((s) => s.player);
    const xpLabel = usePlayerStore((s) => s.xpLabel);
    const { xpAnchorRef } = useAnchors();

    return (
        <Card
            ref={(el: HTMLElement | null) => {
                xpAnchorRef.current = el;
            }}
            className="playerLevelCard centerContent"
        >
            <CardHeader title={`Level ${player.level}`} />
            <CardContent>
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
                </Box>
            </CardContent>
        </Card>
    );
}

export default function NavMenu() {
    return (
        <StyledDrawer
            variant="persistent"
            open={true}
            style={{ display: 'flex' }}
        >
            <StyledDrawerContainer>
                <Divider />
                <MainListItems />
                <Divider />
                <SecondaryListItems />
                <StyledDrawerSpacer />
                <PlayerLevel />
                <img src={AggroStudios} className="aggroLogo" />
            </StyledDrawerContainer>
        </StyledDrawer>
    );
}
