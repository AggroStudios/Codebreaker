import { Component, createSignal, JSX } from 'solid-js';

import { Box, AppBar, Toolbar, IconButton, Typography, styled, alpha, InputBase, Menu, MenuItem, Badge } from '@suid/material';
import MenuIcon from '@suid/icons-material/Menu';
import MailIcon from '@suid/icons-material/Mail';
import NotificationsIcon from '@suid/icons-material/Notifications';
import AccountCircle from '@suid/icons-material/AccountCircle';
import SearchIcon from '@suid/icons-material/Search';
import MoreIcon from '@suid/icons-material/More';
import PlayArrowIcon from '@suid/icons-material/PlayArrow';
import PauseIcon from '@suid/icons-material/Pause';

import { GameStoreType } from '../includes/Process.interface';

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: 'auto',
    },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '20ch',
        },
    },
}));

const AppBarComponent: Component<{ gcStore?: GameStoreType }> = (props) => {

    const [anchorEl, setAnchorEl] = createSignal<null | HTMLElement>(null);
    const [mobileAnchorEl, setMobileAnchorEl] = createSignal<null | HTMLElement>(null);

    const isMenuOpen = () => Boolean(anchorEl());
    const isMobileMenuOpen = () => Boolean(mobileAnchorEl());

    const handleProfileMenuOpen: JSX.EventHandler<HTMLElement, MouseEvent> = event => {
        setAnchorEl(event.currentTarget);
    };

    const handleMobileMenuOpen: JSX.EventHandler<HTMLElement, MouseEvent> = event => {
        setMobileAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleMobileMenuClose = () => {
        setMobileAnchorEl(null);
    }

    const menuId = 'primary-search-account-menu';
    const renderMenu = (
        <Menu
            anchorEl={anchorEl()}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            id={menuId}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={isMenuOpen()}
            onClose={handleMenuClose}
        >
            <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
            <MenuItem onClick={handleMenuClose}>My Account</MenuItem>
        </Menu>
    );

    const mobileMenuId = 'primary-search-account-menu-mobile';
    const renderMobileMenu = (
        <Menu
            anchorEl={mobileAnchorEl()}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            id={mobileMenuId}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={isMobileMenuOpen()}
            onClose={handleMobileMenuClose}
        >
            <MenuItem>
                <IconButton size="large" aria-label="show 4 new mails" color="inherit" style={{ outline: 0 }}>
                    <Badge badgeContent={4} color="error">
                        <MailIcon />
                    </Badge>
                </IconButton>
                <p>Messages</p>
            </MenuItem>
            <MenuItem>
                <IconButton
                    size="large"
                    aria-label="show 17 new notifications"
                    color="inherit"
                    style={{ outline: 0 }}
                >
                    <Badge badgeContent={17} color="error">
                        <NotificationsIcon />
                    </Badge>
                </IconButton>
                <p>Notifications</p>
            </MenuItem>
            <MenuItem onClick={handleProfileMenuOpen}>
                <IconButton
                    size="large"
                    aria-label="account of current user"
                    aria-controls="primary-search-account-menu"
                    aria-haspopup="true"
                    color="inherit"
                    style={{ outline: 0 }}
                >
                    <AccountCircle />
                </IconButton>
                <p>Profile</p>
            </MenuItem>
        </Menu>
    );  

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position='fixed' style={{ background: 'rgba(50, 50, 50, 0.75)'}}>
                <Toolbar>
                    <IconButton
                        size='large'
                        edge='start'
                        color='inherit'
                        aria-label='open drawer'
                        style={{ outline: 0 }}
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant='h6' noWrap component='div' sx={{ display: { xs: 'none', sm: 'block' }}} style={{
                        width: '150px',
                        'text-align': 'left',
                    }}>
                        Code Breaker
                    </Typography>
                    <Search>
                        <SearchIconWrapper>
                            <SearchIcon />
                        </SearchIconWrapper>
                        <StyledInputBase placeholder='Search...' inputProps={{ 'aria-label': 'search' }} />
                    </Search>
                    <Box sx={{ flexGrow: 1 }}>
                        {props.gcStore && (
                            <>
                                <Typography variant='h6' noWrap component='div' sx={{ display: { xs: 'none', sm: 'block' }}}>
                                    Frame: {props.gcStore.frame.toFixed(3)} | Count: {props.gcStore.count} | Exponent: {props.gcStore.exponent}
                                    <IconButton
                                        size='large'
                                        aria-label='Start/Stop Game Timer'
                                        color='inherit'
                                        style={{ outline: 0 }}
                                        onClick={() => props.gcStore.toggleGameLoop()}
                                    >
                                        {props.gcStore.isRunning ? <PauseIcon /> : <PlayArrowIcon />}
                                    </IconButton>
                                </Typography>
                            </>
                        )}
                    </Box>
                    <Box sx={{ display: { xs: 'none', md: 'flex' }}}>
                        <IconButton size='large' aria-label='show 4 new mails' color='inherit' style={{ outline: 0 }}>
                            <Badge badgeContent={4} color='error'>
                                <MailIcon />
                            </Badge>
                        </IconButton>
                        <IconButton size='large' aria-label='show 17 new notifications' color='inherit' style={{ outline: 0 }}>
                            <Badge badgeContent={17} color='error'>
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>
                        <IconButton
                            size='large'
                            aria-label='Account of current user'
                            aria-controls={menuId}
                            aria-haspopup='true'
                            onClick={handleProfileMenuOpen}
                            color='inherit'
                            style={{ outline: 0 }}
                        >
                            <AccountCircle />
                        </IconButton>
                    </Box>
                    <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                        <IconButton
                            size="large"
                            aria-label="show more"
                            aria-controls={mobileMenuId}
                            aria-haspopup="true"
                            onClick={handleMobileMenuOpen}
                            color="inherit"
                            style={{ outline: 0 }}
                        >
                            <MoreIcon />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>
            {renderMenu}
            {renderMobileMenu}
        </Box>
    );
};

export default AppBarComponent;