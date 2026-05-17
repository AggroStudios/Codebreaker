import ImportantDevicesTwoToneIcon from '@mui/icons-material/ImportantDevicesTwoTone';
import StorageTwoToneIcon from '@mui/icons-material/StorageTwoTone';
import CalendarViewDayTwoToneIcon from '@mui/icons-material/CalendarViewDayTwoTone';
import ApartmentTwoToneIcon from '@mui/icons-material/ApartmentTwoTone';
import RouterTwoToneIcon from '@mui/icons-material/RouterTwoTone';
import PublicTwoToneIcon from '@mui/icons-material/PublicTwoTone';
import PublishTwoToneIcon from '@mui/icons-material/PublishTwoTone';
import SettingsBackupRestoreTwoToneIcon from '@mui/icons-material/SettingsBackupRestoreTwoTone';
import ShareTwoToneIcon from '@mui/icons-material/ShareTwoTone';
import PeopleTwoToneIcon from '@mui/icons-material/PeopleTwoTone';
import PestControlTwoToneIcon from '@mui/icons-material/PestControlTwoTone';
import AccountTreeTwoToneIcon from '@mui/icons-material/AccountTreeTwoTone';
import TerminalTwoTone from '@mui/icons-material/TerminalTwoTone';
import type { OverridableComponent } from '@mui/material/OverridableComponent';
import type { SvgIconTypeMap } from '@mui/material/SvgIcon';
import PollOutlinedIcon from '@mui/icons-material/PollOutlined';

export interface INavigationItem {
    title: string;
    link: string;
    icon: OverridableComponent<SvgIconTypeMap<object, 'svg'>>;
    locked?: boolean;
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
        icon: TerminalTwoTone,
    },
    {
        title: 'Station',
        link: '/station',
        icon: ImportantDevicesTwoToneIcon,
    },
    {
        title: 'Servers',
        link: '/servers',
        icon: StorageTwoToneIcon,
    },
    {
        title: 'Server Racks',
        link: '/racks',
        icon: CalendarViewDayTwoToneIcon,
    },
    {
        title: 'Data Centers',
        link: '/dataCenters',
        icon: ApartmentTwoToneIcon,
    },
    {
        title: 'Networks',
        link: '/networks',
        icon: RouterTwoToneIcon,
    },
    {
        title: 'Dark Web',
        link: '/darkWeb',
        icon: PublicTwoToneIcon,
    },
    {
        title: 'Neural Net',
        link: '/neuralNet',
        icon: ShareTwoToneIcon,
    },
];

export const secondaryNavigation: INavigationItem[] = [
    {
        title: 'Upgrades',
        link: '/upgrades',
        icon: PublishTwoToneIcon,
    },
    {
        title: 'Prestige',
        link: '/prestige',
        icon: SettingsBackupRestoreTwoToneIcon,
    },
    {
        title: 'Statistics',
        link: '/stats',
        icon: PollOutlinedIcon,
    },
];
