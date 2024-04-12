import dig from './dig';
import http from './http';
import ping from './ping';
import scan from './scanVulnerabilities';
import processes from './processes';

import { IApplication } from '../../includes/Terminal.interface';

export default Array<IApplication>(
    {
        cmd : 'ps',
        path: '/',
        app : processes,
    },
    {
        cmd : 'dig',
        path: '/bin',
        app : dig,
    },
    {
        cmd : 'http',
        path: '/bin',
        app : http,
    },
    {
        cmd : 'ping',
        path: '/bin',
        app : ping,
    },
    {
        cmd : 'scan',
        path: '/bin',
        app : scan,
    },
    {
        cmd : 'sub',
        path: '/bin/sub',
        app: http,
    },
);