import {
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Drawer,
    Divider,
    Box,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link, useLocation } from 'react-router';
import { forwardRef, type ReactNode, type Ref } from 'react';

import LockTwoToneIcon from '@mui/icons-material/LockTwoTone';

import { mainNavigation, secondaryNavigation } from '../../data/navigation';

import AggroStudios from '../../assets/logos/AggroStudios.png';
import './styles.scss';
import PlayerLevel from '../PlayerLevel';

const StyledLinkItemButton = styled(ListItemButton)(({ theme }) => ({
    '&.Mui-selected': {
        color: 'var(--accent)',
        backgroundColor:
            theme.palette.mode === 'dark'
                ? 'rgba(10,245,176,0.08)'
                : 'rgba(0, 0, 0, 0.08)',
    },
    '&.Mui-selected svg': {
        color: 'var(--accent)',
    },
    '&.Mui-selected:hover': {
        backgroundColor:
            theme.palette.mode === 'dark'
                ? 'rgba(121, 239, 204, 0.08)'
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
) => <Link ref={ref} {...props} viewTransition />;
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
    id?: string;
    disabled?: boolean;
    children: ReactNode;
}) {
    const location = useLocation();
    return (
        <div className="sideNavContainer" id={props.id}>
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
                        id={`main-nav-item-${item.title.replaceAll(' ', '-').toLowerCase()}`}
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

export default function NavMenu() {
    return (
        <StyledDrawer
            variant="persistent"
            open={true}
            style={{ display: 'flex' }}
        >
            <StyledDrawerContainer>
                <Box sx={{ flexShrink: 1, flexGrow: 1, overflow: 'auto' }}>
                    <Divider />
                    <MainListItems />
                    <Divider />
                    <SecondaryListItems />
                    <StyledDrawerSpacer />
                </Box>
                <PlayerLevel />
                <img src={AggroStudios} className="aggroLogo" style={{ flexShrink: 0, flexGrow: 0 }} />
            </StyledDrawerContainer>
        </StyledDrawer>
    );
}
