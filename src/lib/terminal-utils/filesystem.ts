import { lightBlue, lightGreen } from '@mui/material/colors';

import minimist from 'minimist';

import { filter, isEmpty, uniq, uniqBy } from 'lodash';

import { colorizeString, decolorizeString } from './display';

import { path, stripLastSlash, stripTrailingSlashes } from '../utils';

import { IApplication, TerminalApp } from '../../includes/Terminal.interface';
import OperatingSystem from '../OperatingSystem';

export interface IDirectory {
    path: string;
    absolutePath?: string;
    hidden?: boolean;
    owner: string;
    group: string;
    permissions: Permissions;
    directory: boolean;
}

export interface IMount {
    path: string;
    os: OperatingSystem;
}

class Permissions {
    private owner: IPermission = { read: false, write: false, execute: false };
    private group: IPermission = { read: false, write: false, execute: false };
    private all: IPermission = { read: false, write: false, execute: false };

    get isExecutable(): boolean {
        return this.owner.execute || this.group.execute || this.all.execute;
    }

    get isWritable(): boolean {
        return this.owner.write || this.group.write || this.all.write;
    }

    get isReadable(): boolean {
        return this.owner.read || this.group.read || this.all.read;
    }

    constructor(permission: number) {
        const perm = [this.owner, this.group, this.all];
        permission
            .toString()
            .split('')
            .forEach((v, k) => {
                if (parseInt(v) & 4) {
                    perm[k].read = true;
                } else {
                    perm[k].read = false;
                }
                if (parseInt(v) & 2) {
                    perm[k].write = true;
                } else {
                    perm[k].write = false;
                }
                if (parseInt(v) & 1) {
                    perm[k].execute = true;
                } else {
                    perm[k].execute = false;
                }
            });
    }

    private permissionToString(permission: IPermission) {
        return `${permission.read ? 'r' : '-'}${permission.write ? 'w' : '-'}${permission.execute ? 'x' : '-'}`;
    }

    toString(): string {
        return `${this.permissionToString(this.owner)}${this.permissionToString(this.group)}${this.permissionToString(this.all)}`;
    }
}
interface IPermission {
    read: boolean;
    write: boolean;
    execute: boolean;
}

const directoryRegex = (path: string) =>
    new RegExp(`^${stripLastSlash(path)}/([^/]+)$`);

const getSubDirectories = (path: string, apps: IApplication[]) =>
    uniqBy(apps, 'path')
        .filter((app: IApplication) => app.path.match(directoryRegex(path)))
        .map(
            (app: IApplication): IDirectory => ({
                path: app.path.split('/').pop(),
                absolutePath: path,
                owner: 'root',
                group: 'admin',
                permissions: new Permissions(644),
                directory: true,
            }),
        );

export default class FileSystem {
    private _cwd: string = '/';
    private _apps: IApplication[];
    private _mounts: IMount[] = [];

    constructor(apps: IApplication[]) {
        this._apps = apps;
    }

    private get apps(): IApplication[] {
        const mountedFiles = this._mounts.flatMap((mount) => (mount.os.storedFiles || []).map((file) => ({ ...file, path: stripTrailingSlashes(`${mount.path}/${file.path}`) })));
        return [...this._apps, ...mountedFiles];
    }

    get cwd() {
        return this._cwd;
    }

    mount(mountPath: string, os: OperatingSystem) {
        this._mounts.push({ path: mountPath, os });
    }

    cat([passedPath]: string[]) {
        if (isEmpty(passedPath)) {
            throw new Error('Path is empty.');
        }
        const file = this.apps.find(
            (app) => app.cmd === passedPath && app.contentType === 'text/plain',
        );
        if (isEmpty(file)) {
            throw new Error(`File not found: ${passedPath}`);
        }
        const outputArray = [];

        for (const line of file.content.split('\r\n')) {
            outputArray.push(line.replaceAll(' ', '\u00a0'));
        }
        return outputArray;
    }

    rm([passedPath]: string[]) {
        if (isEmpty(passedPath)) {
            throw new Error('Path is empty.');
        }

        let resolvedPath = passedPath;

        // This means we're resolving from a relative path
        if (!passedPath.startsWith('/')) {
            resolvedPath = `${stripLastSlash(this._cwd)}/${passedPath}`;
        }

        const parsed = path.parse(resolvedPath);

        const filesToDelete = [];

        if (parsed.base !== '*') {
            const foundApp = this.apps.find(
                (o) => o.path === parsed.dir && o.cmd === parsed.base,
            );

            if (isEmpty(foundApp)) {
                throw new Error(`File '${passedPath}' not found.`);
            }
            const permissions = new Permissions(foundApp.permissions);

            if (isEmpty(foundApp) || !permissions.isWritable) {
                throw new Error(`Command '${passedPath}' not found.`);
            }

            filesToDelete.push(foundApp);
        }
        else {
            const filesInDirectory = this.apps.filter((f) => f.path === parsed.dir);
            filesToDelete.push(...filesInDirectory);
        }

        const mount = this._mounts.find((mount) => parsed.dir.startsWith(mount.path))
        const foundFiles = mount?.os.storedFiles
            .map((f) => ({ ...f, path: stripTrailingSlashes(`${mount.path}/${f.path}`) }))
            .filter((f) => filesToDelete.some((file) => file.path === f.path && file.cmd === f.cmd));

        if (foundFiles.length > 0) {
            foundFiles.forEach((f) => {
                mount?.os.unlinkFile(f.path.replace(`${mount.path}/`, ''), f.cmd);
            });
        }
        else {
            throw new Error(`File '${passedPath}' not found.`);
        }
    }

    changeDirectory([passedPath]: string[]) {
        if (isEmpty(passedPath)) {
            throw new Error('Path is empty.');
        }

        let destinationPath = stripTrailingSlashes(passedPath);
        switch (passedPath) {
            case '.':
                // Do nothing, it's a valid path, but doesn't go anywhere.
                break;
            case '..':
                destinationPath =
                    this._cwd.split('/').slice(0, -1).join('/') || '/';
                break;
            default: {
                // Create a new path to match the path you're going to.
                let newPath = passedPath;
                // This means we're resolving from a relative path
                if (!newPath.startsWith('/')) {
                    newPath = `${stripLastSlash(this._cwd)}/${passedPath}`;
                }
                // Find directories in the current working directory to find
                const directories = uniq([
                    '/',
                    ...this.apps.map((app) => app.path),
                ]);
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
        const foundApp = this.apps.find(
            (o) => o.path === parsed.dir && o.cmd === parsed.base,
        );

        const permissions = new Permissions(foundApp.permissions);

        if (isEmpty(foundApp) || !permissions.isExecutable) {
            throw new Error(`Command '${command}' not found.`);
        }

        return foundApp.app;
    }

    resolveAbsoluteDir(rel: string): string {
        const resolved = rel.startsWith('/')
            ? rel
            : `${stripLastSlash(this._cwd)}/${rel}`;
        const normalized = path.normalize(resolved);
        if (!normalized) return '/';
        return stripTrailingSlashes(normalized) || '/';
    }

    listEntriesAt(absDir: string): { name: string; isDirectory: boolean }[] {
        const dir = stripTrailingSlashes(absDir) || '/';
        const childPrefix = dir === '/' ? '/' : `${dir}/`;
        const subdirNames = uniq(
            this.apps
                .map((a) => a.path)
                .filter((p) => p !== dir && p.startsWith(childPrefix))
                .map((p) => p.substring(childPrefix.length).split('/')[0])
                .filter((name) => name !== ''),
        );
        const subdirEntries = subdirNames.map((name) => ({ name, isDirectory: true }));
        const fileEntries = this.apps
            .filter((a) => a.path === dir && a.contentType !== 'inode/directory')
            .map((a) => ({ name: a.cmd, isDirectory: false }));
        return [...subdirEntries, ...fileEntries];
    }

    getExecutableCommandsAtCwd(): string[] {
        return this.apps
            .filter((a) => a.path === this._cwd && new Permissions(a.permissions).isExecutable)
            .map((a) => a.cmd);
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

        const colorizePathType = (entry: IDirectory) => {
            if (entry.directory) {
                return `${colorizeString(entry.path, lightBlue['500'])}/`;
            } else if (entry.permissions.isExecutable) {
                return `${colorizeString(entry.path, lightGreen['500'])}`;
            } else {
                return entry.path;
            }
        };

        const listingOutput = (dir: IDirectory[]) => {
            if (!parsedArgs.list) {
                const entries = dir.map(colorizePathType);
                let maxWidth = 0;
                for (const entry of entries) {
                    maxWidth = Math.max(maxWidth, entry.length);
                }
                maxWidth = Math.max(maxWidth, 15);
                return [
                    entries
                        .map((entry) => {
                            const extraSpace =
                                entry.length - decolorizeString(entry).length;
                            return `${entry.padEnd(maxWidth + extraSpace, '\u00a0')}`;
                        })
                        .join('\u00a0\u00a0'),
                ];
            }

            let maxOwnerWidth = 0;
            let maxGroupWidth = 0;
            for (const entry of dir) {
                maxOwnerWidth = Math.max(maxOwnerWidth, entry.owner.length);
                maxGroupWidth = Math.max(maxGroupWidth, entry.group.length);
            }

            return dir.map((entry) => {
                const permissions = entry.permissions.toString();
                const path = colorizePathType(entry);
                return `${entry.directory ? 'd' : '-'}${permissions}\u00a0\u00a0${entry.owner.padEnd(maxOwnerWidth, '\u00a0')}\u00a0\u00a0${entry.group.padEnd(maxGroupWidth, '\u00a0')}\u00a0\u00a0\u00a0${path}`;
            });
        };

        const defaultDir: IDirectory[] = [
            {
                path: '.',
                hidden: true,
                owner: 'root',
                group: 'admin',
                permissions: new Permissions(644),
                directory: true,
            },
            {
                path: '..',
                hidden: true,
                owner: 'root',
                group: 'admin',
                permissions: new Permissions(644),
                directory: true,
            },
        ];

        let dirToList = this._cwd;
        let searchPattern = null;

        const directory = path.format(parsed);
        const filteredDirs = getSubDirectories(directory, this.apps);
        const foundDir = uniq(['/', ...this.apps.map((app) => app.path)]).find(
            (o) => o === directory,
        );

        if (foundDir) {
            dirToList = directory;
        } else {
            const reserved = [
                '\\',
                '.',
                '+',
                '?',
                '[',
                '^',
                ']',
                '$',
                '(',
                ')',
                '{',
                '}',
                '=',
                '!',
                '<',
                '>',
                '|',
                ':',
                '-',
            ];
            const escaped = reserved.reduce(
                (acc, cur) => acc.replaceAll(cur, `\\${cur}`),
                parsed.base,
            );
            searchPattern = new RegExp(`^${escaped.replaceAll('*', '(.*)')}$`);
            dirToList = parsed.dir;
        }

        defaultDir.push(...filteredDirs);

        const dir = this.apps
            .reduce((acc: IDirectory[], cur: IApplication) => {
                if (cur.path === dirToList && cur.contentType !== 'inode/directory') {
                    acc.push({
                        path: cur.cmd,
                        owner: 'root',
                        group: 'admin',
                        permissions: new Permissions(cur.permissions),
                        directory: false,
                    });
                }
                return acc;
            }, defaultDir)
            .filter((entry) => {
                if (searchPattern) {
                    return searchPattern.test(entry.path);
                }
                return true;
            });

        if (isEmpty(dir)) {
            console.log(parsed);
            throw new Error(`Directory '${resolvedPath}' not found.`);
        }

        if (!parsedArgs.all) {
            return listingOutput(filter(dir, (d) => !d.hidden));
        }
        return listingOutput(dir);
    }
}
