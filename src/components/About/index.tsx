import {
    Box,
    Button,
    Dialog,
    IconButton,
    Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import TerminalOutlinedIcon from '@mui/icons-material/TerminalOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import AlbumOutlinedIcon from '@mui/icons-material/AlbumOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';

import AggroStudiosLogo from '../../assets/logos/AggroStudios.png';
import CodebreakerLogo from '../../assets/logos/codebreaker-logo.png';
import pkg from '../../../package.json';

import './about.scss';
import { usePlayerStore } from '../../stores/player';
import { formatDuration } from '../../lib/utils';

export interface AboutProps {
    open: boolean;
    onClose: () => void;
}

const BUILD_HASH =
    (import.meta.env.VITE_GIT_SHA as string | undefined)?.slice(0, 7) ??
    (import.meta.env.VITE_BUILD_HASH as string | undefined) ??
    'localdev';

const BUILD_DATE =
    (import.meta.env.VITE_BUILD_DATE as string | undefined) ??
    new Date().toISOString().slice(0, 10);

const APP_VERSION = (import.meta.env.VITE_APP_VERSION as string | undefined) ?? pkg.version;

const REACT_MAJOR = (() => {
    const m = /^(\d+)/.exec(pkg.dependencies?.react ?? '');
    return m ? m[1] : '19';
})();

const VITE_MAJOR = (() => {
    const m = /^(\d+)/.exec(pkg.devDependencies?.vite ?? '');
    return m ? m[1] : '8';
})();

interface CreditRow {
    icon: typeof LightbulbOutlinedIcon;
    label: string;
    names: string;
    tag?: string;
}

const CREDITS: CreditRow[] = [
    {
        icon: LightbulbOutlinedIcon,
        label: 'ORIGINAL CONCEPT',
        names: 'Simon Germain · Carmen Galante',
    },
    {
        icon: TerminalOutlinedIcon,
        label: 'ENGINEERING',
        names: 'Simon Germain',
        tag: 'LEAD',
    },
    {
        icon: PaletteOutlinedIcon,
        label: 'VISUAL DESIGN',
        names: 'Carmen Galante',
        tag: 'LEAD',
    },
    {
        icon: TerminalOutlinedIcon,
        label: 'FRONT-END',
        names: 'Melanie Germain',
    },
    {
        icon: AlbumOutlinedIcon,
        label: 'MUSIC',
        names: 'Mathieu Lalonde — Funebrae',
        tag: 'FUNEBRAE',
    },
    {
        icon: FavoriteBorderOutlinedIcon,
        label: 'SPECIAL THANKS',
        names: 'Everyone who helped test, play, breaks ciphers, and shares feedback.',
    },
];

export default function About({ open, onClose }: AboutProps) {

    const totalPlayTime = usePlayerStore((state) => state.player.statistics.totalPlayedTime);
    
    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            aria-labelledby="about-dialog-heading"
            slotProps={{
                paper: {
                    className: 'about-modal-paper',
                    elevation: 0,
                },
            }}
        >
            <Box className="about-modal">
                <Box className="about-modal__header" component="header">
                    <h2 id="about-dialog-heading" className="about-modal__heading">
                        About Codebreaker
                    </h2>
                    <IconButton
                        className="about-modal__close"
                        aria-label="Close about"
                        onClick={onClose}
                        size="small"
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>

                <Box className="about-modal__body">
                    <Box className="about-modal__frame">
                        <Box className="about-modal__frame-content">
                        <span className="about-modal__frame-border" aria-hidden />
                        <span
                            className="about-modal__frame-corner about-modal__frame-corner--tl"
                            aria-hidden
                        />
                        <span
                            className="about-modal__frame-corner about-modal__frame-corner--tr"
                            aria-hidden
                        />
                        <span
                            className="about-modal__frame-corner about-modal__frame-corner--bl"
                            aria-hidden
                        />
                        <span
                            className="about-modal__frame-corner about-modal__frame-corner--br"
                            aria-hidden
                        />

                        <Box className="about-modal__hero-brand">
                            <img
                                className="about-modal__hero-logo"
                                src={AggroStudiosLogo}
                                alt=""
                            />
                            <Typography className="about-modal__hero-studio" component="div">
                                A GAME BY AGGRO STUDIOS
                            </Typography>
                            <img
                                className="about-modal__hero-logo"
                                src={CodebreakerLogo}
                                alt=""
                            />
                            <Box className="about-modal__pills">
                                <span className="about-modal__pill">
                                    VERSION <span className="about-modal__pill-val">{APP_VERSION}</span>
                                </span>
                                <span className="about-modal__pill">
                                    BUILD <span className="about-modal__pill-val">{BUILD_HASH}</span>
                                </span>
                                <span className="about-modal__pill">
                                    ENGINE{' '}
                                    <span className="about-modal__pill-val">
                                        React {REACT_MAJOR} · Vite {VITE_MAJOR}
                                    </span>
                                </span>
                            </Box>
                            </Box>
                        </Box>

                        <Typography className="about-modal__intro" component="p">
                            Thanks for playing. <strong>Codebreaker</strong> is the product of late nights,
                            strong coffee, and the people below.
                        </Typography>

                        <Box component="section" className="about-modal__section" aria-label="Credits">
                            <Box className="about-modal__section-head">
                                <span className="about-modal__section-label">01 // <span className="about-modal__section-label-accent">CREDITS</span></span>
                                <span className="about-modal__section-meta">contributors · roles</span>
                            </Box>
                            <Box className="about-modal__credits">
                                {CREDITS.map((row) => {
                                    const Icon = row.icon;
                                    return (
                                        <Box key={row.label} className="about-modal__credit">
                                            <Box className="about-modal__credit-icon" aria-hidden>
                                                <Icon fontSize="small" />
                                            </Box>
                                            <Box className="about-modal__credit-body">
                                                <Box className="about-modal__credit-label-row">
                                                    <span className="about-modal__credit-label">
                                                        {row.label}
                                                    </span>
                                                    {row.tag ? (
                                                        <span className="about-modal__credit-tag">
                                                            {row.tag}
                                                        </span>
                                                    ) : null}
                                                </Box>
                                                <Typography
                                                    className="about-modal__credit-names"
                                                    component="div"
                                                >
                                                    {row.names}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Box>

                        <Box component="section" className="about-modal__section" aria-label="System">
                            <Box className="about-modal__section-head">
                                <span className="about-modal__section-label">02 // <span className="about-modal__section-label-accent">SYSTEM</span></span>
                                <span className="about-modal__section-meta">runtime</span>
                            </Box>
                            <Box className="about-modal__terminal" role="region" aria-label="Build info">
                                <div>
                                    <span className="about-modal__terminal-prompt">$</span>
                                    <span>codebreaker --info</span>
                                </div>
                                <div className="about-modal__terminal-dim">
                                    → commit {BUILD_HASH} · {BUILD_DATE}
                                </div>
                                <div className="about-modal__terminal-dim">
                                    → uptime {formatDuration(totalPlayTime / 1000)}
                                </div>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                <Box className="about-modal__footer">
                    <Typography className="about-modal__footer-note" component="span">
                        Codebreaker © {new Date().getFullYear()} AGGRO Studios
                    </Typography>
                    <Button className="about-modal__btn-done" onClick={onClose} variant="text">
                        CLOSE
                    </Button>
                </Box>
            </Box>
        </Dialog>
    );
}
