import { PlayerState } from '../includes/Player.interface';
import Process from '../includes/Process.interface';
import CpuActivity from './CpuActivity';

import { NotificationLevel } from '../includes/OperatingSystem.interface';
import { StationStoreType } from '../includes/Process.interface';

import WorkerOperatingSystem from './worker/OperatingSystem?worker';
import { OperatingSystemWorkerMessage, OperatingSystemWorkerMessageType, type OSUpdateGameLoopData } from './worker/OperatingSystem';
import { IApplication } from '../includes/Terminal.interface';
import { dataSizeFromSuffix } from './utils';
import { useStorageStore } from '../stores/storage';

function validateProcess(process: any): process is Process {
    return 'id' in process && 'callback' in process;
}

export class OperatingSystemError extends Error {}

// Exporting main game controller
export default class OperatingSystem {
    private pid: number = 10;
    private currentFrame: number = 0;
    private currentCount: number = 0;
    private currentExponent: number = 1;
    private processes: Array<Process> = [];
    private _player: PlayerState;
    private _cpuActivity: CpuActivity | null = null;
    private _station: StationStoreType | null = null;
    private _worker: Worker | null = null;
    private _isRunning: boolean = false;
    private _storagePath: string = '/storage';

    constructor(player: PlayerState) {
        this._player = player;
        this._cpuActivity = new CpuActivity(100, 50);

        // Default file in storage root (only if not already persisted)
        const { storedFiles, pushFile } = useStorageStore.getState();
        if (!storedFiles.some((f) => f.cmd === 'lost+found')) {
            pushFile({
                cmd: 'lost+found',
                path: '/',
                contentType: 'text/plain',
                permissions: 644,
                content: '',
            } as IApplication);
        }

        if (window.Worker) {
            this._worker = new WorkerOperatingSystem();

            this._worker.onmessage = (event: MessageEvent<OperatingSystemWorkerMessage>) => {  
                const { type, data } = event.data;
                switch (type) {
                    case OperatingSystemWorkerMessageType.START_GAME_LOOP:
                    case OperatingSystemWorkerMessageType.STOP_GAME_LOOP:
                        this._isRunning = data as boolean;
                        this._station?.setRunning(this._isRunning);
                        break;
                    case OperatingSystemWorkerMessageType.UPDATE_GAME_LOOP:
                        this.currentFrame = (data as OSUpdateGameLoopData).frame;
                        this.currentCount = (data as OSUpdateGameLoopData).count;
                        this.currentExponent = (data as OSUpdateGameLoopData).exponent;
                        this.update();
                        break;
                }
            }
        }
    }

    public startGameLoop() {
        this._worker?.postMessage({
            type: OperatingSystemWorkerMessageType.START_GAME_LOOP,
        });
    }

    public stopGameLoop() {
        this._worker?.postMessage({
            type: OperatingSystemWorkerMessageType.STOP_GAME_LOOP,
        });
    }

    public shutdown() {
        this.stopGameLoop();
        this._worker?.terminate();
        this._worker = null;
    }

    public get station(): StationStoreType | null {
        return this._station;
    }

    public set station(station: StationStoreType) {
        this._station = station;
        this._cpuActivity.state = station;
    }

    get storagePath() {
        return this._storagePath;
    }

    get storedFiles() {
        return useStorageStore.getState().storedFiles;
    }

    get player() {
        return this._player;
    }

    get isRunning() {
        return this._isRunning;
    }

    get frame() {
        return this.currentFrame + this.currentCount;
    }

    get exponent() {
        return this.currentExponent;
    }

    public toggleGameLoop() {
        if (this._isRunning) {
            this.stopGameLoop();
        } else {
            this.startGameLoop();
        }
        return this._isRunning;
    }

    public listProcesses() {
        return this.processes.map((process) => ({
            id: process.id,
            pid: process.pid,
            callback: process.callback,
        }));
    }

    public sendNotification(
        message: string,
        level: NotificationLevel = NotificationLevel.INFO,
    ) {
        this._player.addNotification({
            message,
            level,
            unread: true,
        });
    }

    public sendMessage(sender: string, body: string) {
        this._player.addMessage({
            sender,
            body,
            date: new Date(),
            unread: true,
        });
    }

    public markMessageRead(index: number) {
        this._player.markMessageAsRead(index);
    }

    public markNotificationRead(index: number) {
        this._player.markNotificationAsRead(index);
    }

    kill(pid: number) {
        const processIndex = this.processes.findIndex(
            (process) => process.pid === pid,
        );
        // Make sure the process exists before trying to remove it.
        if (processIndex > -1) {
            this.processes = [
                ...this.processes.slice(0, processIndex),
                ...this.processes.slice(processIndex + 1),
            ];
        } else {
            throw new OperatingSystemError(`Unable to find pid '${pid}'.`);
        }
    }

    addFile(file: IApplication) {
        const { storedFiles, pushFile } = useStorageStore.getState();
        const storageAvailable = this._station?.storage.reduce((acc, storage) => acc + dataSizeFromSuffix({ size: storage.capacity, unit: 'GB' }), 0);
        const storageUsed = storedFiles.reduce((acc, f) => acc + (f.size || 0), 0);
        if ((storageUsed + (file.size || 0)) > storageAvailable) {
            throw new OperatingSystemError(`Not enough storage available to add file '${file.path}'.`);
        }

        // Ensure an entry exists for every intermediate directory segment so
        // that getSubDirectories can discover them one level at a time.
        const parts = file.path.split('/').filter(Boolean);
        for (let i = 0; i < parts.length - 1; i++) {
            const dirPath = `${this._storagePath}/${parts.slice(0, i + 1).join('/')}`;
            if (!useStorageStore.getState().storedFiles.some((f) => f.path === dirPath)) {
                pushFile({
                    cmd: '',
                    path: dirPath,
                    permissions: 755,
                    contentType: 'inode/directory',
                } as IApplication);
            }
        }

        file.path = parts.join('/');
        pushFile(file);
    }

    unlinkFile(directory: string, filename: string) {
        const { storedFiles, removeFile } = useStorageStore.getState();
        if (!storedFiles.find((f) => f.path === directory && f.cmd === filename)) {
            throw new OperatingSystemError(`File '${directory}/${filename}' not found.`);
        }
        removeFile(directory, filename);
    }

    addProcess(process: Process) {
        const memoryAvailable = this._station?.memory?.capacity || 0;
        const memoryUsed = this.processes.reduce(
            (acc, process) => acc + (process.memoryRequired || 0),
            0,
        );
        
        if ((memoryUsed + (process.memoryRequired || 0)) > memoryAvailable) {
            throw new OperatingSystemError(`Not enough memory available to add process '${process.id}'.`);
        }

        // Make sure the process object is valid and you can't duplicate processes
        const coreUsage = this.processes.reduce(
            (acc, process) => acc + (process.cores || 0),
            0,
        );
        const coreCount = this._station?.cpu?.cores || 1;

        if (coreUsage + (process.cores || 0) > coreCount) {
            throw new OperatingSystemError(`Not enough cores available to add process '${process.id}'.`);
        }

        const isCipherProcess = typeof process?.id === 'string' && process.id.startsWith('cipher-');
        if (isCipherProcess) {
            const maxBreaks = this._station?.memory?.maxConcurrentBreaks ?? Infinity;
            const cipherProcesses = this.processes.filter(
                (p) => typeof p?.id === 'string' && p.id.startsWith('cipher-'),
            );
            const alreadyTracked = cipherProcesses.some((p) => p.id === process.id);
            if (!alreadyTracked && cipherProcesses.length + 1 > maxBreaks) {
                throw new OperatingSystemError(`No free cipher slots (${maxBreaks} max).`);
            }
        }

        const processIndex = this.processes.findIndex(
            (i) => i?.['id'] === process?.['id'],
        );
        process.pid = this.pid++;
        if (validateProcess(process) && processIndex === -1) {
            this.processes.push(process);
        } else {
            this.processes[processIndex] = process;
        }
        return processIndex !== -1;
    }

    removeProcess(process: Process) {
        this.processes = this.processes.filter(
            (p) => p?.['id'] !== process?.['id'],
        );
    }

    attachProcess(processId: string): Process | undefined {
        return this.processes.find(
            (p) => p?.['id'] === processId,
        );
    }

    resetProcesses() {
        this.processes = Array<Process>();
    }

    increaseExponent(amount: number = 1) {
        this.setExponent(this.currentExponent + amount);
    }

    decreaseExponent(amount: number = 1) {
        this.setExponent(this.currentExponent - amount);
    }

    setExponent(amount: number) {
        this.currentExponent = amount;
        this._worker?.postMessage({
            type: OperatingSystemWorkerMessageType.SET_EXPONENT,
            data: amount,
        });
    }

    // Main function
    update() {
        // console.debug('[OperatingSystem] - Update');
        if (
            this._station &&
            Math.round(this.currentFrame * 1000) % 100 === 0
        ) {
            const coreUsage = this.processes.filter((process: Process) => !process.paused).reduce(
                (acc, process) => acc + (process.cores * (process.percentUse || 0) || 0),
                0,
            );
            const coreCount = this._station?.cpu?.cores || 1;
            const cpuUsage = Math.round((coreUsage / coreCount) * 100);
            this._cpuActivity.usage(cpuUsage);
        }

        for (const process of this.processes.filter((process: Process) => !process.paused)) {
            process.callback(
                Number(this.currentFrame.toFixed(3)),
                this.currentCount,
                this.currentExponent,
            );
        }
    }
}
