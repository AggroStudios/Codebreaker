import { BusinessTwoTone, SchoolTwoTone, HomeWorkTwoTone } from '@mui/icons-material';

import { Origin } from '../includes/Character.interface';

export const ORIGINS: Origin[] = [
    {
        id: 'basement',
        name: 'Basement Prodigy',
        sub: 'Self-taught · age 14',
        bonus: { stat: 'stealth', amt: 5 },
        icon: HomeWorkTwoTone,
        blurb: 'Years on shared hosting and bootleg compilers. Knows how to keep quiet.',
    },
    {
        id: 'dropout',
        name: 'MIT Dropout',
        sub: 'Comp Sci · ABD',
        bonus: { stat: 'cryptography', amt: 5 },
        icon: SchoolTwoTone,
        blurb: 'Wrote a thesis the department refused to publish. Took the math with you.',
    },
    {
        id: 'sysadmin',
        name: 'Ex-Corporate Sysadmin',
        sub: '12y · F500 backend',
        bonus: { stat: 'networking', amt: 5 },
        icon: BusinessTwoTone,
        blurb: 'Spent a decade keeping VPNs alive. Now you know exactly where they leak.',
    },
];

export const ORIGIN_BY_ID: Record<string, Origin> = Object.fromEntries(
    ORIGINS.map((o) => [o.id, o]),
);
