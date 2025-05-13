import { Component } from 'solid-js';
import {
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Drawer,
    Divider
} from '@suid/material';
import { A } from '@solidjs/router';
import { styled } from '@suid/material';
import { useLocation } from '@solidjs/router';

import LockTwoToneIcon from '@suid/icons-material/LockTwoTone';

import { mainNavigation, secondaryNavigation } from '../lib/navigation';
import { MenuStateType } from '../includes/Process.interface';

import AggroStudios from '../assets/logos/AggroStudios.png';
import './NavMenu.scss';

const StyledLinkItemButton = styled(ListItemButton)<typeof ListItemButton>(({ theme }) => ({
    '&.Mui-selected': {
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.08)',
    },
    '&.Mui-selected:hover': {
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.08)',
    },
}));

const StyledDrawer = styled(Drawer)<typeof Drawer>(() => ({
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
    }
}));

const StyledDrawerContainer = styled('div')(() => ({
    overflow: 'auto',
    height: '100%',
    flexDirection: 'column',
    display: 'flex',
}));

const StyledDrawerSpacer = styled('div')(() => ({
    flexGrow: 1
}));

const StyledA = styled(A)(() => ({
    '&:hover': {
        color: 'white'
    }
}));

function ListItemNavLink(props: { to: string, disabled: boolean, children: Element }) {
    const location = useLocation();
    return (
        <div class="sideNavContainer">
            <StyledLinkItemButton
                disabled={props.disabled}
                selected={location.pathname === props.to}
                component={StyledA}
                href={props.to}
            >
                {props.children}
            </StyledLinkItemButton>
        </div>
    );
}

function MainListItems(props: any) {

    return (
        <List>
            {mainNavigation.map((item, key) =>
                <ListItemNavLink key={key} disabled={item.locked} to={item.link} {...props}>
                    <ListItemIcon>
                        { item.locked ? <LockTwoToneIcon /> : <item.icon /> }
                    </ListItemIcon>
                    <ListItemText primary={item.locked ? 'Locked' : item.title} />
                </ListItemNavLink>
            )}
        </List>
    );
}

function SecondaryListItems(props: any) {
    return (
        <List>
            {secondaryNavigation.map((item, key) =>
                <ListItemNavLink key={key} to={item.link} {...props}>
                    <ListItemIcon>
                        <item.icon />
                    </ListItemIcon>
                    <ListItemText primary={item.title} />
                </ListItemNavLink>
            )}
        </List>
    );
}

const NavMenu: Component<{menuStateStore?: MenuStateType}> = (props) => {
    return (
        <StyledDrawer
            variant="persistent"
            open={props.menuStateStore?.open}
            style={{
                display: props.menuStateStore?.open ? 'flex' : 'none'
            }}
        >
            <StyledDrawerContainer>
                <Divider />
                <MainListItems />
                <Divider />
                <SecondaryListItems />
                <StyledDrawerSpacer />
                <img src={AggroStudios} class="aggroLogo" />
            </StyledDrawerContainer>
        </StyledDrawer>
    );
}

export default NavMenu;