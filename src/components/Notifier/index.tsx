import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import {
    Avatar,
    Card,
    CardContent,
    CardHeader,
    IconButton,
    LinearProgress,
    Snackbar,
} from '@mui/material';
import Close from '@mui/icons-material/Close';
import ErrorOutline from '@mui/icons-material/ErrorOutlined';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import WarningAmber from '@mui/icons-material/WarningAmber';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutlined';
import { red, blue, amber, green } from '@mui/material/colors';

export type NotificationLevel = 'error' | 'warning' | 'info' | 'success';

export type NotifyOptions = {
    level?: NotificationLevel;
    title?: string;
    message: string;
    duration?: number;
};

type ActiveNotification = Required<NotifyOptions> & { id: number };

type NotifierContextValue = {
    notify: (options: NotifyOptions) => number;
    dismiss: (id: number) => void;
};

const NotifierContext = createContext<NotifierContextValue | null>(null);

const levelMeta: Record<
    NotificationLevel,
    { title: string; color: string; Icon: React.ComponentType }
> = {
    error: { title: 'Error!', color: red[500], Icon: ErrorOutline },
    warning: { title: 'Warning', color: amber[600], Icon: WarningAmber },
    info: { title: 'Notice', color: blue[500], Icon: InfoOutlined },
    success: { title: 'Success', color: green[500], Icon: CheckCircleOutline },
};

function NotificationCard({
    notification,
    onDismiss,
}: {
    notification: ActiveNotification;
    onDismiss: (id: number) => void;
}) {
    const { id, level, title, message, duration } = notification;
    const [life, setLife] = useState(100);
    const [paused, setPaused] = useState(false);
    const startRef = useRef(Date.now());
    const pausedAtRef = useRef<number | null>(null);
    const pauseDurationRef = useRef(0);

    const { color, Icon } = levelMeta[level];

    useEffect(() => {
        if (paused) return;
        const interval = window.setInterval(() => {
            const elapsed =
                Date.now() - startRef.current - pauseDurationRef.current;
            const nextLife = 100 - (elapsed / duration) * 100;
            if (nextLife <= 0) {
                setLife(0);
                onDismiss(id);
            } else {
                setLife(nextLife);
            }
        }, 100);
        return () => window.clearInterval(interval);
    }, [paused, duration, id, onDismiss]);

    const handleMouseEnter = () => {
        if (!paused) {
            pausedAtRef.current = Date.now();
            setPaused(true);
        }
    };

    const handleMouseLeave = () => {
        if (paused && pausedAtRef.current !== null) {
            pauseDurationRef.current += Date.now() - pausedAtRef.current;
            pausedAtRef.current = null;
            setPaused(false);
        }
    };

    return (
        <Card
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            sx={{ minWidth: 320, maxWidth: 480 }}
        >
            <CardHeader
                title={title}
                subheader={message}
                action={
                    <IconButton onClick={() => onDismiss(id)} size="small">
                        <Close />
                    </IconButton>
                }
                avatar={
                    <Avatar sx={{ bgcolor: color }}>
                        <Icon />
                    </Avatar>
                }
                slotProps={{ title: { variant: 'h6' } }}
            />
            <CardContent sx={{ paddingTop: 0 }}>
                <LinearProgress
                    variant="determinate"
                    color={level}
                    value={life}
                    sx={{ width: '100%', marginTop: '10px' }}
                />
            </CardContent>
        </Card>
    );
}

export function NotifierProvider({ children }: { children: ReactNode }) {
    const [queue, setQueue] = useState<ActiveNotification[]>([]);
    const idRef = useRef(0);

    const dismiss = (id: number) => {
        setQueue((q) => q.filter((n) => n.id !== id));
    };

    const notify = (options: NotifyOptions) => {
        const id = ++idRef.current;
        const full: ActiveNotification = {
            id,
            level: options.level ?? 'info',
            title: options.title ?? levelMeta[options.level ?? 'info'].title,
            message: options.message,
            duration: options.duration ?? 6000,
        };
        setQueue((q) => [...q, full]);
        return id;
    };

    const value = { notify, dismiss };

    return (
        <NotifierContext.Provider value={value}>
            {children}
            {queue.map((notification, index) => (
                <Snackbar
                    key={notification.id}
                    open
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    sx={{ bottom: { xs: 24 + index * 120 } }}
                >
                    <div>
                        <NotificationCard
                            notification={notification}
                            onDismiss={dismiss}
                        />
                    </div>
                </Snackbar>
            ))}
        </NotifierContext.Provider>
    );
}

export function useNotifier() {
    const ctx = useContext(NotifierContext);
    if (!ctx) {
        throw new Error('useNotifier must be used within NotifierProvider');
    }
    return ctx;
}
