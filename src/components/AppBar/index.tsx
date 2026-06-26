import {
    useEffect,
    useMemo,
    useState,
    type MouseEvent as ReactMouseEvent,
    type ReactNode,
    type CSSProperties,
} from 'react';
import { useNavigate } from 'react-router';

import {
    Box,
    IconButton,
    Badge,
    Menu,
    MenuItem,
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

import MailIcon from '@mui/icons-material/Mail';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import InfoTwoTone from '@mui/icons-material/InfoTwoTone';
import WarningTwoTone from '@mui/icons-material/WarningTwoTone';
import ErrorTwoTone from '@mui/icons-material/ErrorTwoTone';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import { ExitToAppOutlined } from '@mui/icons-material';

import './styles.scss';
import { NotificationLevel } from '../../includes/OperatingSystem.interface';
import MoneyLabel from '../MoneyLabel';
import XpLabel from '../XpLabel';
import { usePlayerStore } from '../../stores/player';
import { useUIStore } from '../../stores/ui';
import { useCharacterStore } from '../../stores/character';
import { useStationContext } from '../../stores/stationContext';
import { useAnchors } from '../AnchorsContext';
import { useMusicPlayerStore } from '../../stores/musicPlayer';
import { formatMoney } from '../../lib/utils';
import MessagesModal from '../MessagesModal';

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

/** Clamp a comms count for badge display. */
const clampBadge = (n: number) => (n > 99 ? '99+' : n);

/** Derive 2-character avatar initials from a callsign (e.g. "cipher_07" → "C7"). */
function deriveInitials(callsign: string): string {
    const cleaned = callsign.replace(/[^a-z0-9]/gi, '');
    if (!cleaned) return '??';
    const first = cleaned[0].toUpperCase();
    const last = cleaned[cleaned.length - 1].toUpperCase();
    return cleaned.length === 1 ? first : `${first}${last}`;
}

/** Deterministic operator id stamp derived from the callsign (e.g. "0xA3-91F4-CB07"). */
function deriveOperatorId(callsign: string): string {
    let hash = 0x811c9dc5;
    for (let i = 0; i < callsign.length; i++) {
        hash ^= callsign.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }
    const hex = (hash >>> 0).toString(16).toUpperCase().padStart(8, '0');
    return `0x${hex.slice(0, 2)}-${hex.slice(2, 6)}-${hex.slice(6, 8)}07`;
}

/** Bracket-cornered chrome panel shared by the header read-outs. */
function ChromePanel({
    children,
    className,
    style,
    panelRef,
}: {
    children: ReactNode;
    className?: string;
    style?: CSSProperties;
    panelRef?: (el: HTMLDivElement | null) => void;
}) {
    return (
        <div
            ref={panelRef}
            className={`bracketFrame chrPanel ${className ?? ''}`}
            style={style}
        >
            <span className="brC brTl" />
            <span className="brC brTr" />
            <span className="brC brBl" />
            <span className="brC brBr" />
            {children}
        </div>
    );
}

/** Live game-loop telemetry read-out (frame / count / exponent). */
function FrameReadout() {
    const { useStationStore } = useStationContext();

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

    return (
        <ChromePanel>
            <span className="chrLabel">Frame</span>
            <span className="chrValue chrValueSm">{display.frame.toFixed(3)}</span>
            <span className="chrSep" />
            <span className="chrLabel">Cnt</span>
            <span className="chrValue chrValueSm">{display.count}</span>
            <span className="chrSep" />
            <span className="chrLabel">Exp</span>
            <span className="chrValue chrValueSm">×{display.exponent}</span>
        </ChromePanel>
    );
}

/** Pause / resume the game loop (and kick off music on first start). */
function PauseButton() {
    const { stationProxy, useStationStore } = useStationContext();
    const isRunning = useStationStore((s) => s.isRunning);
    const playing = useMusicPlayerStore((s) => s.playing);
    const playMusic = useMusicPlayerStore((s) => s.play);

    const handleToggle = () => {
        stationProxy.os?.toggleGameLoop();
        if (!playing) {
            playMusic();
        }
    };

    return (
        <Tooltip title={isRunning ? 'Pause' : 'Resume'}>
            <IconButton
                className="chrIconBtn"
                aria-label="Start/Stop Game Timer"
                onClick={handleToggle}
            >
                {isRunning ? (
                    <PauseCircleIcon sx={{ fontSize: 20 }} />
                ) : (
                    <PlayCircleIcon sx={{ fontSize: 20 }} />
                )}
            </IconButton>
        </Tooltip>
    );
}

export default function AppBarComponent() {
    const money = usePlayerStore((s) => s.player.money);
    const level = usePlayerStore((s) => s.player.level);
    const experience = usePlayerStore((s) => s.player.experience);
    const nextLevel = usePlayerStore((s) => s.player.nextLevel);
    const playerName = usePlayerStore((s) => s.player.name);
    const messages = usePlayerStore((s) => s.player.messages);
    const notifications = usePlayerStore((s) => s.player.notifications);
    const moneyLabel = usePlayerStore((s) => s.moneyLabel);
    const xpLabel = usePlayerStore((s) => s.xpLabel);
    const classId = usePlayerStore((s) => s.player.classId);
    console.log('Player class:', classId);
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

    const callsign =
        useCharacterStore((s) => s.identity?.callsign) || playerName || 'operator';

    const { stationProxy } = useStationContext();
    const { moneyAnchorRef, xpAnchorRef } = useAnchors();
    const navigate = useNavigate();
    const openSettings = useUIStore((s) => s.openSettings);
    const openAbout = useUIStore((s) => s.openAbout);

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [notificationAnchorEl, setNotificationAnchorEl] =
        useState<HTMLElement | null>(null);
    const [messagesOpen, setMessagesOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<
        { mode: 'one'; index: number } | { mode: 'all' } | null
    >(null);

    const isMenuOpen = Boolean(anchorEl);
    const isNotificationMenuOpen = Boolean(notificationAnchorEl);

    const handleProfileMenuOpen = (event: ReactMouseEvent<HTMLElement>) =>
        setAnchorEl(event.currentTarget);
    const handleNotificationMenuOpen = (event: ReactMouseEvent<HTMLElement>) =>
        setNotificationAnchorEl(event.currentTarget);

    const handleMenuClose = () => setAnchorEl(null);
    const handleNotificationMenuClose = () => setNotificationAnchorEl(null);

    const handleSettingsOpen = () => {
        setAnchorEl(null);
        openSettings();
    };

    const handleAboutOpen = () => {
        setAnchorEl(null);
        openAbout();
    };

    const handleLogout = () => {
        setAnchorEl(null);
        navigate('/');
    };

    const menuId = 'primary-search-account-menu';
    const notificationId = 'primary-search-notification-menu';

    const unreadMessages = messages.filter((m) => m.unread).length;
    const unreadNotifications = notifications.filter((n) => n.unread).length;

    const xpPct = nextLevel > 0 ? Math.min(experience / nextLevel, 1) : 0;
    const initials = useMemo(() => deriveInitials(callsign), [callsign]);
    const operatorId = useMemo(() => deriveOperatorId(callsign), [callsign]);

    return (
        <header className="titleTop">
            {/* System Online */}
            <ChromePanel>
                <span className="navLiveDot" />
                <span className="chrLabel">System Online</span>
                <span className="chrDot">·</span>
                <span className="chrChannel">secure channel</span>
            </ChromePanel>

            {/* Frame counter */}
            <FrameReadout />

            {/* Wallet (emphasized) — money label anchor */}
            <ChromePanel
                className="chrWallet"
                style={{
                    borderColor: 'rgba(var(--accent-rgb),0.4)',
                    background: 'rgba(var(--accent-rgb),0.05)',
                }}
                panelRef={(el) => {
                    moneyAnchorRef.current = el;
                }}
            >
                <AccountBalanceWalletIcon
                    sx={{ fontSize: 16, color: 'var(--accent)' }}
                />
                <div className="chrWalletStack">
                    <span className="chrLabel">Available Balance</span>
                    <span className="chrValue money">${formatMoney(money)}</span>
                </div>
                {moneyLabel?.amount != null && (
                    <MoneyLabel key={moneyLabel.id} amount={moneyLabel.amount} />
                )}
            </ChromePanel>

            {/* Operator level + XP — xp label anchor */}
            <ChromePanel
                panelRef={(el) => {
                    xpAnchorRef.current = el;
                }}
            >
                <div className="chrLevelStack">
                    <div className="chrLevelTop">
                        <span className="chrLabel">Operator Lvl</span>
                        <span className="chrLevelNum">{level}</span>
                    </div>
                    <div className="chrXpRow">
                        <div className="chrXpTrack">
                            <div
                                className="chrXpFill"
                                style={{ width: `${xpPct * 100}%` }}
                            />
                        </div>
                        <span className="chrXpReadout">
                            {experience}/{nextLevel}
                        </span>
                    </div>
                </div>
                {xpLabel?.data?.amount != null && (
                    <XpLabel
                        key={xpLabel.id}
                        amount={xpLabel.data.amount}
                        levelUp={xpLabel.data.levelUp}
                    />
                )}
            </ChromePanel>

            <Box sx={{ flexGrow: 1 }} />

            {/* Pause */}
            <PauseButton />

            {/* Comms */}
            <Tooltip title="Messages">
                <IconButton
                    className="chrIconBtn"
                    aria-label="Open messages"
                    onClick={() => setMessagesOpen(true)}
                >
                    <Badge badgeContent={clampBadge(unreadMessages)} color="error">
                        <MailIcon sx={{ fontSize: 18 }} />
                    </Badge>
                </IconButton>
            </Tooltip>
            <Tooltip title="Notifications">
                <IconButton
                    className="chrIconBtn"
                    aria-controls={notificationId}
                    onClick={handleNotificationMenuOpen}
                >
                    <Badge
                        badgeContent={clampBadge(unreadNotifications)}
                        color="error"
                    >
                        <NotificationsIcon sx={{ fontSize: 18 }} />
                    </Badge>
                </IconButton>
            </Tooltip>

            {/* Operator stamp */}
            <div
                className="chrOperator"
                role="button"
                tabIndex={0}
                aria-controls={menuId}
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setAnchorEl(e.currentTarget);
                    }
                }}
            >
                <div className="chrAvatar">{initials}</div>
                <div className="chrOperatorMeta">
                    <div className="h">{callsign}</div>
                    <div className="r">{operatorId}</div>
                </div>
            </div>

            {/* ── Account menu ──────────────────────────────────────────── */}
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

            {/* ── Notifications menu ────────────────────────────────────── */}
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
                        <span style={{ fontWeight: 'bold' }}>No notifications</span>
                    </MenuItem>
                )}
            </Menu>

            <Dialog
                open={deleteConfirm !== null}
                onClose={() => setDeleteConfirm(null)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>
                    Delete notification{deleteConfirm?.mode === 'all' ? 's' : ''}?
                </DialogTitle>
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

            {/* ── Secure-comms messages modal ───────────────────────────── */}
            <MessagesModal
                open={messagesOpen}
                onClose={() => setMessagesOpen(false)}
                onSelectMessage={markMessageAsRead}
                onTransmit={(recipient, body) =>
                    stationProxy.os?.sendMessage(recipient, body)
                }
            />
        </header>
    );
}
