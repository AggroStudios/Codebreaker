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
        permissions: 755,
    },
    {
        cmd : 'dig',
        path: '/bin',
        app : dig,
        permissions: 755,
    },
    {
        cmd : 'http',
        path: '/bin',
        app : http,
        permissions: 755,
    },
    {
        cmd : 'ping',
        path: '/bin',
        app : ping,
        permissions: 755,
    },
    {
        cmd : 'scan',
        path: '/bin',
        app : scan,
        permissions: 755,
    },
    {
        cmd : 'sub',
        path: '/bin/sub',
        app: http,
        permissions: 755,
    },
);