import {
    DeveloperBoardTwoTone,
    FunctionsTwoTone,
    LanTwoTone,
    VisibilityOffTwoTone,
} from '@mui/icons-material';

import { StatKeyDef } from '../includes/Character.interface';

export const STAT_KEYS: StatKeyDef[] = [
    { key: 'cryptography', label: 'CRYPTOGRAPHY', icon: FunctionsTwoTone },
    { key: 'hardware',     label: 'HARDWARE',     icon: DeveloperBoardTwoTone },
    { key: 'stealth',      label: 'STEALTH',      icon: VisibilityOffTwoTone },
    { key: 'networking',   label: 'NETWORKING',   icon: LanTwoTone },
];
