import ImportantDevicesIcon from '@mui/icons-material/ImportantDevices';
import StorageIcon from '@mui/icons-material/Storage';
import ViewDayIcon from '@mui/icons-material/ViewDay';
import ApartmentIcon from '@mui/icons-material/Apartment';
import RouterIcon from '@mui/icons-material/Router';
import PublicIcon from '@mui/icons-material/Public';
import PublishIcon from '@mui/icons-material/Publish';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import ShareIcon from '@mui/icons-material/Share';
import PeopleTwoToneIcon from '@mui/icons-material/PeopleTwoTone';
import PestControlTwoToneIcon from '@mui/icons-material/PestControlTwoTone';
import AccountTreeTwoToneIcon from '@mui/icons-material/AccountTreeTwoTone';
import TerminalIcon from '@mui/icons-material/Terminal';
import AssignmentIcon from '@mui/icons-material/Assignment';
import type { OverridableComponent } from '@mui/material/OverridableComponent';
import type { SvgIconTypeMap } from '@mui/material/SvgIcon';

export interface INavigationItem {
    title: string;
    subtitle?: string;
    link: string;
    icon: OverridableComponent<SvgIconTypeMap<object, 'svg'>>;
    locked?: boolean;
    /** Right-aligned monospace hint shown after the label (e.g. "12 owned"). */
    hint?: string;
    /** Inline badge after the label (e.g. "NEW"). */
    badge?: string;
}

export const adminNavigation: INavigationItem[] = [
    {
        title: 'Players',
        link: '/admin/players',
        icon: PeopleTwoToneIcon,
    },
    {
        title: 'Vulnerabilities',
        link: '/admin/vulnerabilities',
        icon: PestControlTwoToneIcon,
    },
    {
        title: 'Scenario Builder',
        link: '/admin/scenarios',
        icon: AccountTreeTwoToneIcon,
    },
];

export const mainNavigation: INavigationItem[] = [
    {
        title: 'Terminal',
        link: '/terminal',
        icon: TerminalIcon,
        hint: 'shell · root',
    },
    {
        title: 'Station',
        link: '/station',
        icon: ImportantDevicesIcon,
        hint: 'home',
    },
    {
        title: 'Servers',
        link: '/servers',
        icon: StorageIcon,
        hint: 'owned',
    },
    {
        title: 'Server Racks',
        link: '/racks',
        icon: ViewDayIcon,
        hint: 'racks',
    },
    {
        title: 'Data Centers',
        link: '/dataCenters',
        icon: ApartmentIcon,
        hint: 'sites',
    },
    // NOTE: count-based hints (owned / racks / sites / perks) are filled in
    // dynamically from live state in <NavMenu>; the values here are fallbacks.
    {
        title: 'Networks',
        link: '/networks',
        icon: RouterIcon,
        hint: 'isp · botnets',
    },
    {
        title: 'Dark Web',
        link: '/darkWeb',
        icon: PublicIcon,
        hint: 'tor · markets',
    },
    {
        title: 'Neural Net',
        link: '/neuralNet',
        icon: ShareIcon,
        hint: 'training',
    },
];

export const secondaryNavigation: INavigationItem[] = [
    {
        title: 'Upgrades',
        link: '/upgrades',
        icon: PublishIcon,
        hint: 'perks',
    },
    {
        title: 'Prestige',
        link: '/prestige',
        icon: SettingsBackupRestoreIcon,
        hint: 'reset',
    },
    {
        title: 'Statistics',
        link: '/stats',
        icon: AssignmentIcon,
        hint: 'all-time',
    },
];
