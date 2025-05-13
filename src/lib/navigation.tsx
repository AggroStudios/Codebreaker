import ImportantDevicesTwoToneIcon from "@suid/icons-material/ImportantDevicesTwoTone";
import StorageTwoToneIcon from "@suid/icons-material/StorageTwoTone";
import CalendarViewDayTwoToneIcon from "@suid/icons-material/CalendarViewDayTwoTone";
import ApartmentTwoToneIcon from "@suid/icons-material/ApartmentTwoTone";
import RouterTwoToneIcon from "@suid/icons-material/RouterTwoTone";
import PublicTwoToneIcon from "@suid/icons-material/PublicTwoTone";
import PublishTwoToneIcon from "@suid/icons-material/PublishTwoTone";
import SettingsBackupRestoreTwoToneIcon from "@suid/icons-material/SettingsBackupRestoreTwoTone";
import AssignmentIcon from "@suid/icons-material/Assignment";
import ShareTwoToneIcon from "@suid/icons-material/ShareTwoTone";
import ForumTwoToneIcon from '@suid/icons-material/ForumTwoTone';
import PeopleTwoToneIcon from '@suid/icons-material/PeopleTwoTone';
import PestControlTwoToneIcon from '@suid/icons-material/PestControlTwoTone';
import AccountTreeTwoToneIcon from '@suid/icons-material/AccountTreeTwoTone';
import TerminalTwoTone from "@suid/icons-material/TerminalTwoTone";

export const adminNavigation = [
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
    }
];

export const mainNavigation = [
    {
        title: 'Terminal',
        link: '/',
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
        locked: true,
    },
    {
        title: 'Server Racks',
        link: '/racks',
        icon: CalendarViewDayTwoToneIcon,
        locked: true,
    },
    {
        title: 'Data Centers',
        link: '/dataCenters',
        icon: ApartmentTwoToneIcon,
        locked: true,
    },
    {
        title: 'Networks',
        link: '/networks',
        icon: RouterTwoToneIcon,
        locked: true,
    },
    {
        title: 'Dark Web',
        link: '/darkWeb',
        icon: PublicTwoToneIcon,
        locked: true,
    },
    {
        title: 'Neural Net',
        link: '/neuralNet',
        icon: ShareTwoToneIcon,
        locked: true,
    },
];

export const secondaryNavigation = [
    {
        title: 'Forums',
        link: '/forums',
        icon: ForumTwoToneIcon,
    },
    {
        title: 'Talents',
        link: '/talents',
        icon: AccountTreeTwoToneIcon,
    },
    {
        title: 'Perm Upgrades',
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
        icon: AssignmentIcon,
    },
];