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
        icon: <PeopleTwoToneIcon />,
        iconLarge: <PeopleTwoToneIcon class="logo" />
    },
    {
        title: 'Vulnerabilities',
        link: '/admin/vulnerabilities',
        icon: <PestControlTwoToneIcon />,
        iconLarge: <PestControlTwoToneIcon class="logo" />
    },
    {
        title: 'Scenario Builder',
        link: '/admin/scenarios',
        icon: <AccountTreeTwoToneIcon />,
        iconLarge: <AccountTreeTwoToneIcon class="logo" />
    }
];

export const mainNavigation = [
    {
        title: 'Station',
        link: '/',
        icon: <ImportantDevicesTwoToneIcon />,
        iconLarge: <ImportantDevicesTwoToneIcon class="Logo" />
    },
    {
        title: 'Servers',
        link: '/servers',
        icon: <StorageTwoToneIcon />,
        iconLarge: <StorageTwoToneIcon class="Logo" />
    },
    {
        title: 'Server Racks',
        link: '/racks',
        icon: <CalendarViewDayTwoToneIcon />,
        iconLarge: <CalendarViewDayTwoToneIcon class="Logo" />
    },
    {
        title: 'Data Centers',
        link: '/dataCenters',
        icon: <ApartmentTwoToneIcon />,
        iconLarge: <ApartmentTwoToneIcon class="Logo" />
    },
    {
        title: 'Networks',
        link: '/networks',
        icon: <RouterTwoToneIcon />,
        iconLarge: <RouterTwoToneIcon class="Logo" />
    },
    {
        title: 'Dark Web',
        link: '/darkWeb',
        icon: <PublicTwoToneIcon />,
        iconLarge: <PublicTwoToneIcon class="Logo" />
    },
    {
        title: 'Neural Net',
        link: '/neuralNet',
        icon: <ShareTwoToneIcon />,
        iconLarge: <ShareTwoToneIcon class="Logo" />
    },
    {
        title: 'Terminal',
        link: '/terminal',
        icon: <TerminalTwoTone />,
        iconLarge: <TerminalTwoTone class="Logo" />,
    },
];

export const secondaryNavigation = [
    {
        title: 'Forums',
        link: '/forums',
        icon: <ForumTwoToneIcon />,
        iconLarge: <ForumTwoToneIcon class="Logo" />
    },
    {
        title: 'Perm Upgrades',
        link: '/upgrades',
        icon: <PublishTwoToneIcon />,
        iconLarge: <PublishTwoToneIcon class="Logo" />
    },
    {
        title: 'Prestige',
        link: '/prestige',
        icon: <SettingsBackupRestoreTwoToneIcon />,
        iconLarge: <SettingsBackupRestoreTwoToneIcon class="Logo" />
    },
    {
        title: 'Statistics',
        link: '/stats',
        icon: <AssignmentIcon />,
        iconLarge: <AssignmentIcon class="Logo" />
    },
];