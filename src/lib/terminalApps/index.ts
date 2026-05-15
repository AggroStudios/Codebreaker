import dig from './dig';
import http from './http';
import ping from './ping';
import scan from './scanVulnerabilities';
import processes from './processes';
import kill from './kill';
import FetchCipher from './fetchCipher';
import FetchPlayer from './player';

import { IApplication } from '../../includes/Terminal.interface';
import BootSequence from './bootSequence';
import Tutorial from './tutorial';
import Glow from './glow';
import ContractEdit from './contractEdit';
import DailyDeal from './dailyDeal';

export default Array<IApplication>(
    {
        cmd: 'ps',
        path: '/',
        app: processes,
        permissions: 555,
    },
    {
        cmd: 'readme.txt',
        path: '/',
        contentType: 'text/plain',
        permissions: 444,
        content: `--------- readme.txt ----------\r\n\r\n        LEAVE ME HERE\r\n\r\n-------------------------------`,
    },
    {
        cmd: 'contract',
        path: '/',
        app: ContractEdit,
        permissions: 555,
    },
    {
        cmd: 'dailyDeal',
        path: '/',
        app: DailyDeal,
        permissions: 555,
    },
    {
        cmd: 'player',
        path: '/',
        app: FetchPlayer,
        permissions: 555,
    },
    {
        cmd: 'fetchCipher',
        path: '/',
        app: FetchCipher,
        permissions: 555,
    },
    {
        cmd: 'boot',
        path: '/',
        app: BootSequence,
        permissions: 555,
    },
    {
        cmd: 'kill',
        path: '/',
        app: kill,
        permissions: 555,
    },
    {
        cmd: 'dig',
        path: '/bin',
        app: dig,
        permissions: 555,
    },
    {
        cmd: 'http',
        path: '/bin',
        app: http,
        permissions: 555,
    },
    {
        cmd: 'ping',
        path: '/bin',
        app: ping,
        permissions: 555,
    },
    {
        cmd: 'scan',
        path: '/bin',
        app: scan,
        permissions: 555,
    },
    {
        cmd: 'glow',
        path: '/',
        app: Glow,
        permissions: 555,
    },
    {
        cmd: 'tutorial',
        path: '/',
        app: Tutorial,
        permissions: 555,
    },
    {
        cmd: 'sub',
        path: '/bin/sub',
        app: http,
        permissions: 555,
    },
);
