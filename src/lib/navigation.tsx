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
import ForumTwoToneIcon from "@suid/icons-material/ForumTwoTone";
import PeopleTwoToneIcon from "@suid/icons-material/PeopleTwoTone";
import PestControlTwoToneIcon from "@suid/icons-material/PestControlTwoTone";
import AccountTreeTwoToneIcon from "@suid/icons-material/AccountTreeTwoTone";
import TerminalTwoTone from "@suid/icons-material/TerminalTwoTone";
import { OverridableComponent } from "@suid/material/OverridableComponent";
import { SvgIconTypeMap } from "@suid/material/SvgIcon";

export const adminNavigation: INavigationItem[] = [
    {
        title: "Players",
        link: "/admin/players",
        icon: PeopleTwoToneIcon,
    },
    {
        title: "Vulnerabilities",
        link: "/admin/vulnerabilities",
        icon: PestControlTwoToneIcon,
    },
    {
        title: "Scenario Builder",
        link: "/admin/scenarios",
        icon: AccountTreeTwoToneIcon,
    },
];

export interface INavigationItem {
    title: string;
    link: string;
    icon: OverridableComponent<SvgIconTypeMap<object, "svg">>;
    locked?: boolean;
}

export const mainNavigation: INavigationItem[] = [
    {
        title: "Terminal",
        link: "/",
        icon: TerminalTwoTone,
    },
    {
        title: "Station",
        link: "/station",
        icon: ImportantDevicesTwoToneIcon,
    },
    {
        title: "Servers",
        link: "/servers",
        icon: StorageTwoToneIcon,
    },
    {
        title: "Server Racks",
        link: "/racks",
        icon: CalendarViewDayTwoToneIcon,
    },
    {
        title: "Data Centers",
        link: "/dataCenters",
        icon: ApartmentTwoToneIcon,
    },
    {
        title: "Networks",
        link: "/networks",
        icon: RouterTwoToneIcon,
    },
    {
        title: "Dark Web",
        link: "/darkWeb",
        icon: PublicTwoToneIcon,
    },
    {
        title: "Neural Net",
        link: "/neuralNet",
        icon: ShareTwoToneIcon,
    },
];

export const secondaryNavigation: INavigationItem[] = [
    {
        title: "Forums",
        link: "/forums",
        icon: ForumTwoToneIcon,
    },
    {
        title: "Perm Upgrades",
        link: "/upgrades",
        icon: PublishTwoToneIcon,
    },
    {
        title: "Prestige",
        link: "/prestige",
        icon: SettingsBackupRestoreTwoToneIcon,
    },
    {
        title: "Statistics",
        link: "/stats",
        icon: AssignmentIcon,
    },
];
