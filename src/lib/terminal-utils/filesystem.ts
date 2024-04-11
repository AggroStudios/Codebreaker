import {
    lightBlue,
} from '@suid/material/colors';

import minimist from 'minimist';

import {
    filter,
    isEmpty,
    uniq
} from 'lodash';

import {
    colorizeString,
    decolorizeString,
} from './display';

import { path } from '../utils';

import { IApplication, TerminalApp } from '../../includes/Terminal.interface';

export interface IDirectory {
    path: string;
    absolutePath?: string;
    hidden?: boolean;
    owner: string;
    group: string;
    permissions: number;
    directory: boolean;
}

const stripLastSlash = (path: string) => path.replace(/\/$/, '');
function stripTrailingSlashes(path: string) {
    while (path.endsWith('/')) {
        path = stripLastSlash(path);
    }
    return path;
}

const directoryRegex = (path: string) => new RegExp(`^${stripLastSlash(path)}\/([a-zA-Z-_\s]+)$`);

const getSubDirectories = (path: string, apps: IApplication[]) =>
    uniq(apps.map(app => app.path))
        .filter((dir: string) => dir.match(directoryRegex(path)))
        .map((dir: string): IDirectory => ({
            path: dir.split('/').pop(),
            absolutePath: dir,
            owner: 'root',
            group: 'admin',
            permissions: 644,
            directory: true,
        })
);

export default class FileSystem {

    private _cwd:string = '/';
    private apps:IApplication[];

    constructor(apps: IApplication[]) {
        this.apps = apps;
    }

    get cwd() {
        return this._cwd;
    }

    changeDirectory([passedPath]:string[]) {
        if (isEmpty(passedPath)) {
            throw new Error('Path is empty.');
        }

        let destinationPath = stripTrailingSlashes(passedPath);
        switch(passedPath) {
            case '.':
                // Do nothing, it's a valid path, but doesn't go anywhere.
                break;
            case '..':
                destinationPath = this._cwd.split('/').slice(0, -1).join('/') || '/';
                break;
            default:
                // Create a new path to match the path you're going to.
                let newPath = passedPath;
                // This means we're resolving from a relative path
                if (!newPath.startsWith('/')) {
                    newPath = `${stripLastSlash(this._cwd)}/${passedPath}`;
                }
                // Find directories in the current working directory to find
                const directories = uniq(['/', ...this.apps.map(app => app.path)]);
                // If the new path is a directory and it's the list of directories inside the current working directory, go ahead and move to it.
                if (directories.includes(newPath)) {
                    destinationPath = newPath;
                }
                // If not, throw an error saying that there are no such directory.
                else {
                    throw new Error(`Directory not found: ${passedPath}`);
                }
                break;
        }

        // If the destination path is different than the current path, change it.
        if (destinationPath !== this._cwd) {
            this._cwd = destinationPath;
        }
    }

    resolvePath(command: string): typeof TerminalApp {
        if (isEmpty(command)) {
            throw new Error('Path is empty.');
        }

        let resolvedPath = command;

        // This means we're resolving from a relative path
        if (!command.startsWith('/')) {
            resolvedPath = `${stripLastSlash(this._cwd)}/${command}`;
        }

        const parsed = path.parse(resolvedPath);
        const foundApp = this.apps.find(o => o.path === parsed.dir && o.cmd === parsed.base);

        if (isEmpty(foundApp)) {
            throw new Error(`Command '${command}' not found.`);
        }

        return foundApp.app;
    }

    listDirectory(args: string[]) {

        const opts = {
            alias: {
                a: 'all',
                l: 'list',
            },
            boolean: ['all', 'list'],
        };

        const parsedArgs = minimist(args, opts);

        let resolvedPath = parsedArgs._[0] || this._cwd;
        
        if (!resolvedPath.startsWith('/')) {
            resolvedPath = `${stripLastSlash(this._cwd)}/${resolvedPath}`;
        }

        const parsed = path.parse(resolvedPath);

        const translatePermissions = (p: number) => p.toString().split('').map(v => `${parseInt(v) & 4 ? 'r' : '-'}${parseInt(v) & 2 ? 'w' : '-'}${parseInt(v) & 1 ? 'x' : '-'}`).join('');

        const listingOutput = (dir: IDirectory[]) => {
            if (!parsedArgs.list) {
                const entries = dir.map(entry => entry.directory ? `${colorizeString(entry.path, lightBlue['500'])}/` : entry.path);
                let maxWidth = 0;
                for (let entry of entries) {
                    maxWidth = Math.max(maxWidth, entry.length);
                }
                maxWidth = Math.max(maxWidth, 15);
                return [entries.map(entry => {
                    const extraSpace = entry.length - decolorizeString(entry).length;
                    return `${entry.padEnd(maxWidth + extraSpace, '\u00a0')}`;
                }).join('\u00a0\u00a0')];
            }

            let maxOwnerWidth = 0;
            let maxGroupWidth = 0;
            for (let entry of dir) {
                maxOwnerWidth = Math.max(maxOwnerWidth, entry.owner.length);
                maxGroupWidth = Math.max(maxGroupWidth, entry.group.length);
            }

            return dir.map(entry => {
                const permissions = translatePermissions(entry.permissions);
                const path = entry.directory ? `${colorizeString(entry.path, lightBlue['500'])}/` : entry.path;
                return `${entry.directory ? 'd' : '-'}${permissions}\u00a0\u00a0${entry.owner.padEnd(maxOwnerWidth, '\u00a0')}\u00a0\u00a0${entry.group.padEnd(maxGroupWidth, '\u00a0')}\u00a0\u00a0\u00a0${path}`;
            });
        }

        const defaultDir: IDirectory[] = [
            {
                path: '.',
                hidden: true,
                owner: 'root',
                group: 'admin',
                permissions: 644,
                directory: true,
            },
            {
                path: '..',
                hidden: true,
                owner: 'root',
                group: 'admin',
                permissions: 644,
                directory: true,
            },
        ];
        
        let dirToList = this._cwd;
        let searchPattern = null;

        const directory = path.format(parsed);
        const filteredDirs = getSubDirectories(directory, this.apps);
        const foundDir = uniq(['/', ...this.apps.map(app => app.path)]).find(o => o === directory);

        if (foundDir) {
            dirToList = directory;
        }
        else {
            const reserved = ['\\', '.', '+', '?', '[', '^', ']', '$', '(', ')', '{', '}', '=', '!', '<', '>', '|', ':', '-'];
            const escaped = reserved.reduce((acc, cur) => acc.replaceAll(cur, `\\${cur}`), parsed.base);
            searchPattern = new RegExp(`^${escaped.replaceAll('*', '(.*)')}$`);
            dirToList = parsed.dir;
        }

        defaultDir.push(...filteredDirs);

        const dir = this.apps.reduce((acc: IDirectory[], cur: IApplication) => {
            if (cur.path === dirToList) {
                acc.push({
                    path: cur.cmd,
                    owner: 'root',
                    group: 'admin',
                    permissions: 644,
                    directory: false,
                });
            }
            return acc;
        }, defaultDir).filter(entry => {
            if (searchPattern) {
                return searchPattern.test(entry.path);
            }
            return true;
        });

        if (!parsedArgs.all) {
            return listingOutput(filter(dir, d => !d.hidden));
        }

        return listingOutput(dir);
    }
}