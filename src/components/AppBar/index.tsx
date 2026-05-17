import { useEffect, useState, type MouseEvent as ReactMouseEvent } from 'react';

import {
    Box,
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    InputBase,
    Menu,
    MenuItem,
    Badge,
    ListItemIcon,
    ListItemText,
    Divider,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';

import MailIcon from '@mui/icons-material/Mail';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircle from '@mui/icons-material/AccountCircle';
import SearchIcon from '@mui/icons-material/Search';
import MoreIcon from '@mui/icons-material/More';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SettingsIcon from '@mui/icons-material/Settings';
import InfoTwoTone from '@mui/icons-material/InfoTwoTone';
import WarningTwoTone from '@mui/icons-material/WarningTwoTone';
import ErrorTwoTone from '@mui/icons-material/ErrorTwoTone';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';

import CodeBreakerLogo from '../../assets/logos/codebreaker-logo.png';
import './styles.scss';
import { NotificationLevel } from '../../includes/OperatingSystem.interface';
import MoneyLabel from '../MoneyLabel';
import Settings from '../Settings';
import About from '../About';
import { usePlayerStore } from '../../stores/player';
import { useStationContext } from '../../stores/stationContext';
import { useAnchors } from '../AnchorsContext';
import { useMusicPlayerStore } from '../../stores/musicPlayer';
import { formatMoney } from '../../lib/utils';
import { ExitToAppOutlined } from '@mui/icons-material';

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
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '20ch',
        },
    },
}));

const notificationIcon = (level: NotificationLevel) => {
    switch (level) {
        case NotificationLevel.INFO:
            return <InfoTwoTone />;
        case NotificationLevel.WARNING:
            return <WarningTwoTone />;
        case NotificationLevel.ERROR:
            return <ErrorTwoTone />;
        default:
            return null;
    }
};

function GameFrameCounter() {
    const { stationProxy, useStationStore } = useStationContext();
    const isRunning = useStationStore((s) => s.isRunning);
    const playing = useMusicPlayerStore((s) => s.playing);
    const playMusic = useMusicPlayerStore((s) => s.play);

    const [display, setDisplay] = useState(() => {
        const s = useStationStore.getState();
        return { frame: s.frame, count: s.count, exponent: s.exponent };
    });

    useEffect(() => {
        const id = setInterval(() => {
            const { frame, count, exponent } = useStationStore.getState();
            setDisplay({ frame, count, exponent });
        }, 100);
        return () => clearInterval(id);
    }, [useStationStore]);

    const handleToggle = () => {
        stationProxy.os?.toggleGameLoop();
        if (!playing) {
            playMusic();
        }
    };
    return (
        <Typography
            variant="h6"
            noWrap
            component="div"
            className="gameFrameCounter"
            sx={{ display: { xs: 'none', sm: 'block' } }}
        >
            Frame: {display.frame.toFixed(3)} | Count: {display.count} | Exponent: {display.exponent}
            <IconButton
                size="large"
                aria-label="Start/Stop Game Timer"
                color="inherit"
                style={{ outline: 0 }}
                onClick={handleToggle}
            >
                {isRunning ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
        </Typography>
    );
}

export default function AppBarComponent() {
    const money = usePlayerStore((s) => s.player.money);
    const messages = usePlayerStore((s) => s.player.messages);
    const notifications = usePlayerStore((s) => s.player.notifications);
    const moneyLabel = usePlayerStore((s) => s.moneyLabel);
    const markAllNotificationsAsRead = usePlayerStore(
        (s) => s.markAllNotificationsAsRead,
    );
    const markMessageAsRead = usePlayerStore((s) => s.markMessageAsRead);
    const markNotificationAsRead = usePlayerStore(
        (s) => s.markNotificationAsRead,
    );
    const deleteNotification = usePlayerStore((s) => s.deleteNotification);
    const deleteAllNotifications = usePlayerStore(
        (s) => s.deleteAllNotifications,
    );

    const { moneyAnchorRef } = useAnchors();

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [mobileAnchorEl, setMobileAnchorEl] = useState<HTMLElement | null>(
        null,
    );
    const [notificationAnchorEl, setNotificationAnchorEl] =
        useState<HTMLElement | null>(null);
    const [messageAnchorEl, setMessageAnchorEl] = useState<HTMLElement | null>(
        null,
    );
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [aboutOpen, setAboutOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<
        { mode: 'one'; index: number } | { mode: 'all' } | null
    >(null);

    const isMenuOpen = Boolean(anchorEl);
    const isMobileMenuOpen = Boolean(mobileAnchorEl);
    const isNotificationMenuOpen = Boolean(notificationAnchorEl);
    const isMessageMenuOpen = Boolean(messageAnchorEl);

    const handleProfileMenuOpen = (event: ReactMouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMobileMenuOpen = (event: ReactMouseEvent<HTMLElement>) => {
        setMobileAnchorEl(event.currentTarget);
    };

    const handleNotificationMenuOpen = (
        event: ReactMouseEvent<HTMLElement>,
    ) => {
        setNotificationAnchorEl(event.currentTarget);
    };

    const handleMessageMenuOpen = (event: ReactMouseEvent<HTMLElement>) => {
        setMessageAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => setAnchorEl(null);
    const handleMobileMenuClose = () => setMobileAnchorEl(null);
    const handleNotificationMenuClose = () => setNotificationAnchorEl(null);
    const handleMessageMenuClose = () => setMessageAnchorEl(null);

    const handleSettingsOpen = () => {
        setAnchorEl(null);
        setMobileAnchorEl(null);
        setSettingsOpen(true);
    };
    const handleSettingsClose = () => setSettingsOpen(false);

    const handleAboutOpen = () => {
        setAnchorEl(null);
        setMobileAnchorEl(null);
        setAboutOpen(true);
    };
    const handleAboutClose = () => setAboutOpen(false);

    const handleLogout = () => {
        console.log('Handle Logout');
    };

    const menuId = 'primary-search-account-menu';
    const notificationId = 'primary-search-notification-menu';
    const messageId = 'primary-search-message-menu';
    const mobileMenuId = 'primary-search-account-menu-mobile';

    const unreadMessages = messages.filter((m) => m.unread).length;
    const unreadNotifications = notifications.filter(
        (n) => n.unread,
    ).length;

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar
                position="fixed"
                style={{ background: 'rgba(50, 50, 50, 0.75)' }}
            >
                <Toolbar>
                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                        sx={{ display: { xs: 'none', sm: 'block' } }}
                        style={{ width: '240px', textAlign: 'left' }}
                    >
                        <img
                            src={CodeBreakerLogo}
                            className="mainLogo"
                            alt="Code Breaker Logo"
                        />
                    </Typography>
                    <Search>
                        <SearchIconWrapper>
                            <SearchIcon />
                        </SearchIconWrapper>
                        <StyledInputBase
                            placeholder="Search..."
                            inputProps={{ 'aria-label': 'search' }}
                        />
                    </Search>
                    <Box sx={{ flexGrow: 1 }} className="centerContent">
                        <GameFrameCounter />
                    </Box>
                    <Box
                        ref={(el: HTMLElement | null) => {
                            moneyAnchorRef.current = el;
                        }}
                        sx={{ display: { xs: 'none', md: 'flex' } }}
                    >
                        {moneyLabel?.amount != null && (
                            <MoneyLabel
                                key={moneyLabel.id}
                                amount={moneyLabel.amount}
                            />
                        )}
                        <Typography variant="body2" className="moneyLabel">
                            ${formatMoney(money)}
                        </Typography>
                    </Box>
                    <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                        <IconButton
                            size="large"
                            color="inherit"
                            aria-controls={messageId}
                            onClick={handleMessageMenuOpen}
                            style={{ outline: 0 }}
                        >
                            <Badge
                                badgeContent={unreadMessages}
                                color="error"
                            >
                                <MailIcon />
                            </Badge>
                        </IconButton>
                        <IconButton
                            size="large"
                            color="inherit"
                            style={{ outline: 0 }}
                            aria-controls={notificationId}
                            onClick={handleNotificationMenuOpen}
                        >
                            <Badge
                                badgeContent={unreadNotifications}
                                color="error"
                            >
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>
                        <IconButton
                            size="large"
                            aria-label="Account of current user"
                            aria-controls={menuId}
                            aria-haspopup="true"
                            onClick={handleProfileMenuOpen}
                            color="inherit"
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

            <Menu
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                id={menuId}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={isMenuOpen}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
                <MenuItem onClick={handleMenuClose}>My Account</MenuItem>
                <MenuItem onClick={handleSettingsOpen}>
                    <ListItemIcon>
                        <SettingsIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Settings" />
                </MenuItem>
                <MenuItem onClick={handleAboutOpen}>
                    <ListItemIcon>
                        <InfoTwoTone fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="About" />
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                        <ExitToAppOutlined fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                </MenuItem>
            </Menu>

            <Settings open={settingsOpen} onClose={handleSettingsClose} />
            <About open={aboutOpen} onClose={handleAboutClose} />

            <Menu
                anchorEl={mobileAnchorEl}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                id={mobileMenuId}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={isMobileMenuOpen}
                onClose={handleMobileMenuClose}
            >
                <MenuItem>
                    <IconButton
                        size="large"
                        aria-label="show new mails"
                        color="inherit"
                        style={{ outline: 0 }}
                    >
                        <Badge badgeContent={unreadMessages} color="error">
                            <MailIcon />
                        </Badge>
                    </IconButton>
                    <p>Messages</p>
                </MenuItem>
                <MenuItem>
                    <IconButton
                        size="large"
                        aria-label="show new notifications"
                        color="inherit"
                        style={{ outline: 0 }}
                    >
                        <Badge
                            badgeContent={unreadNotifications}
                            color="error"
                        >
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

            <Menu
                anchorEl={notificationAnchorEl}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                id={notificationId}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={isNotificationMenuOpen}
                onClose={handleNotificationMenuClose}
            >
                {notifications.length > 0 ? (
                    [
                        ...notifications.map((notification, index) => (
                            <MenuItem key={index} disableRipple sx={{ gap: 1 }}>
                                <ListItemIcon>
                                    {notificationIcon(notification.level)}
                                </ListItemIcon>
                                <ListItemText
                                    primary={notification.message}
                                    sx={{
                                        mr: 1,
                                        '& .MuiListItemText-primary': {
                                            fontWeight: notification.unread ? 700 : 400,
                                        },
                                    }}
                                />
                                <Tooltip title="Mark as read">
                                    <span>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                markNotificationAsRead(index);
                                            }}
                                            disabled={!notification.unread}
                                            sx={{ outline: 0 }}
                                        >
                                            <CheckIcon fontSize="small" />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                                <Tooltip title="Delete">
                                    <IconButton
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteConfirm({ mode: 'one', index });
                                        }}
                                        sx={{ outline: 0 }}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </MenuItem>
                        )),
                        <Divider key="__divider" />,
                        <MenuItem
                            key="__actions"
                            disableRipple
                            sx={{
                                justifyContent: 'flex-end',
                                gap: 0.5,
                                py: 0.5,
                                '&:hover': { backgroundColor: 'transparent' },
                            }}
                        >
                            <Tooltip title="Mark all as read">
                                <span>
                                    <IconButton
                                        size="small"
                                        onClick={markAllNotificationsAsRead}
                                        disabled={notifications.every((n) => !n.unread)}
                                        sx={{ outline: 0 }}
                                    >
                                        <DoneAllIcon fontSize="small" />
                                    </IconButton>
                                </span>
                            </Tooltip>
                            <Tooltip title="Delete all">
                                <IconButton
                                    size="small"
                                    onClick={() => setDeleteConfirm({ mode: 'all' })}
                                    sx={{ outline: 0 }}
                                >
                                    <DeleteSweepIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </MenuItem>,
                    ]
                ) : (
                    <MenuItem onClick={handleNotificationMenuClose}>
                        <span style={{ fontWeight: 'bold' }}>
                            No notifications
                        </span>
                    </MenuItem>
                )}
            </Menu>

            <Dialog
                open={deleteConfirm !== null}
                onClose={() => setDeleteConfirm(null)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>Delete notification{deleteConfirm?.mode === 'all' ? 's' : ''}?</DialogTitle>
                <DialogContent>
                    {deleteConfirm?.mode === 'all'
                        ? 'This will permanently delete all notifications.'
                        : 'This will permanently delete this notification.'}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirm(null)} sx={{ outline: 0 }}>
                        Cancel
                    </Button>
                    <Button
                        color="error"
                        onClick={() => {
                            if (deleteConfirm?.mode === 'all') {
                                deleteAllNotifications();
                            } else if (deleteConfirm?.mode === 'one') {
                                deleteNotification(deleteConfirm.index);
                            }
                            setDeleteConfirm(null);
                        }}
                        sx={{ outline: 0 }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <Menu
                anchorEl={messageAnchorEl}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                id={messageId}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={isMessageMenuOpen}
                onClose={handleMessageMenuClose}
            >
                {messages.length > 0 ? (
                    messages.map((message, index) => (
                        <MenuItem
                            key={index}
                            onClick={() => markMessageAsRead(index)}
                        >
                            <span
                                style={{
                                    fontWeight: message.unread
                                        ? 'bold'
                                        : 'normal',
                                }}
                            >
                                {index} - {message.body}
                            </span>
                        </MenuItem>
                    ))
                ) : (
                    <MenuItem onClick={handleMessageMenuClose}>
                        <span style={{ fontWeight: 'bold' }}>No messages</span>
                    </MenuItem>
                )}
            </Menu>
        </Box>
    );
}
