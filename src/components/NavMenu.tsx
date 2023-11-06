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

import { mainNavigation, secondaryNavigation } from '../lib/navigation';

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

function ListItemNavLink(props: { to: string, children: Element }) {
    const location = useLocation();
    return (
        <StyledLinkItemButton
            selected={location.pathname === props.to}
            component={StyledA}
            href={props.to}
        >
            {props.children}
        </StyledLinkItemButton>
    );
}

function MainListItems(props) {

    return (
        <List>
            {mainNavigation.map((item, key) =>
                <ListItemNavLink key={key} to={item.link} {...props}>
                    <ListItemIcon>
                        {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.title} />
                </ListItemNavLink>
            )}
        </List>
    );
}

function SecondaryListItems(props) {
    return (
        <List>
            {secondaryNavigation.map((item, key) =>
                <ListItemNavLink key={key} to={item.link} {...props}>
                    <ListItemIcon>
                        {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.title} />
                </ListItemNavLink>
            )}
        </List>
    );
}

const NavMenu: Component = () => {
    return (
        <StyledDrawer
            variant="permanent"
            open={true}
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