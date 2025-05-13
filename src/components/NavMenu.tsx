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

const StyledLinkItemButton = styled(ListItemButton)<typeof ListItemButton>(({ theme }) => ({
    '&.Mui-selected': {
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.08)',
    },
    '&.Mui-selected:hover': {
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.08)',
    },
}));

const StyledDrawer = styled(Drawer)<typeof Drawer>(() => ({
    position: 'absolute',
    top: 0,
    width: 240,
    height: "100vh",
    flexShrink: 0,
    '.MuiDrawer-paper': {
        width: 240,
        top: '64px',
        background: 'rgba(50, 50, 50, 0.85)'
    }
}));

const StyledDrawerContainer = styled('div')(() => ({
    overflow: 'auto',
    height: '100%',
}));

const StyledA = styled(A)(() => ({
    '&:hover': {
        color: 'white'
    }
}));

function ListItemNavLink(props: { to: string, disabled: boolean, children: Element }) {
    const location = useLocation();
    return (
        <StyledLinkItemButton
            disabled={props.disabled}
            selected={location.pathname === props.to}
            component={StyledA}
            href={props.to}
        >
            {props.children}
        </StyledLinkItemButton>
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
                display: props.menuStateStore?.open ? 'block' : 'none'
            }}
        >
            <StyledDrawerContainer>
                <Divider />
                <MainListItems />
                <Divider />
                <SecondaryListItems />
            </StyledDrawerContainer>
        </StyledDrawer>
    );
}

export default NavMenu;