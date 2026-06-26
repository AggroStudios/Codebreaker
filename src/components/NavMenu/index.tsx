import { useMemo } from 'react';
import { Link, useLocation } from 'react-router';

import LockTwoToneIcon from '@mui/icons-material/LockTwoTone';

import {
    mainNavigation,
    secondaryNavigation,
    type INavigationItem,
} from '../../data/navigation';
import { usePlayerStore } from '../../stores/player';
import { useServersStore } from '../../stores/servers';
import { useRacksStore } from '../../stores/racks';
import { useDataCentersStore } from '../../stores/dataCenters';

import CodeBreakerLogo from '../../assets/logos/codebreaker-logo.png';
import AggroStudios from '../../assets/logos/AggroStudios.png';
import './styles.scss';

// const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? '';

/**
 * Resolves the right-aligned hint for a nav item, binding to live game state
 * where it exists and falling back to the static descriptor from the data.
 */
function useNavHints(): Record<string, string> {
    const level = usePlayerStore((s) => s.player.level);
    const perks = usePlayerStore((s) => s.purchasedUpgrades.length);
    const owned = useServersStore((s) => s.purchasedServers.length);
    const racks = useRacksStore((s) => s.racks.length);
    const sites = useDataCentersStore((s) => Object.keys(s.contracts).length);

    return useMemo(
        () => ({
            '/station': `lvl ${level} · home`,
            '/servers': `${owned} owned`,
            '/racks': `${racks} racks`,
            '/dataCenters': `${sites} sites`,
            '/upgrades': `${perks} perks`,
        }),
        [level, perks, owned, racks, sites],
    );
}

interface TitleItemProps {
    item: INavigationItem;
    active: boolean;
    hint?: string;
}

/** Single nav row — caret · icon · LABEL · hint, matching the Title Screen menu. */
function TitleItem({ item, active, hint }: TitleItemProps) {
    const Icon = item.icon;
    const locked = item.locked ?? false;
    const className = ['titleItem', active ? 'active' : '', locked ? 'disabled' : '']
        .filter(Boolean)
        .join(' ');

    const content = (
        <>
            <span className="caret">▸</span>
            <span className="icon">{locked ? <LockTwoToneIcon /> : <Icon />}</span>
            <span className="label">
                <span>{locked ? 'Locked' : item.title}</span>
                {item.badge && !locked && <span className="badge">{item.badge}</span>}
            </span>
            <span className="hint">{hint ?? item.hint}</span>
        </>
    );

    const id = `main-nav-item-${item.title.replaceAll(' ', '-').toLowerCase()}`;

    if (locked) {
        return (
            <li className={className} id={id} aria-disabled="true">
                {content}
            </li>
        );
    }

    return (
        <li>
            <Link
                to={item.link}
                id={id}
                className={className}
                aria-current={active ? 'page' : undefined}
            >
                {content}
            </Link>
        </li>
    );
}

export default function NavMenu() {
    const location = useLocation();
    const hints = useNavHints();

    const isActive = (link: string) => location.pathname === link;

    return (
        <aside className="titleSide">
            {/* Brand */}
            <div className="titleBrand">
                {/*
                  width/height are the PNG's true intrinsic pixels so the
                  browser knows the aspect ratio before it decodes; the inline
                  height pins the rendered size on the first paint (before the
                  stylesheet is injected) so the logo never flashes full-size.
                */}
                <img
                    src={CodeBreakerLogo}
                    className="brandLogo"
                    alt="Codebreaker"
                />
            </div>

            {/* Menu */}
            <ul className="titleMenu">
                <li className="titleMenuGroupLabel">Operations</li>
                {mainNavigation.map((item) => (
                    <TitleItem
                        key={item.link}
                        item={item}
                        active={isActive(item.link)}
                        hint={hints[item.link]}
                    />
                ))}
                <li className="titleMenuGroupLabel">Meta</li>
                {secondaryNavigation.map((item) => (
                    <TitleItem
                        key={item.link}
                        item={item}
                        active={isActive(item.link)}
                        hint={hints[item.link]}
                    />
                ))}
            </ul>

            {/* AGGRO Studios badge */}
            <div className="titleAggro">
                <img src={AggroStudios} alt="AGGRO Studios" />
                <div className="copy">© 2026 · Aggro Studios</div>
            </div>
        </aside>
    );
}
