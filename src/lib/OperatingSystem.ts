import { PlayerState } from '../includes/Player.interface';
import Process from '../includes/Process.interface';
import CpuActivity from './CpuActivity';

import { NotificationLevel } from '../includes/OperatingSystem.interface';
import { StationStoreType } from '../includes/Process.interface';

const FPS = 60;

function validateProcess(process: any): process is Process {
    return 'id' in process && 'callback' in process;
}

export class OperatingSystemError extends Error {};

// Exporting main game controller
export default class OperatingSystem {
    private pid: number = 10;
    private interval: null | NodeJS.Timeout = null;
    private currentFrame: number = 0;
    private currentCount: number = 0;
    private currentExponent: number = 1;
    private processes: Array<Process> = [];
    private _player: PlayerState;
    private _cpuActivity: CpuActivity | null = null;
    private _station: StationStoreType | null = null;
    
    constructor(player: PlayerState) {
        this._player = player;
        this._cpuActivity = new CpuActivity(100, 50);
        this.addProcess(this._cpuActivity);
    }

    public startGameLoop() {
        this.interval = setInterval(() => this.update(), 500 / FPS);
    };

    public stopGameLoop() {
        clearInterval(this.interval);
        this.interval = null;
    };

    public set station(station: StationStoreType) {
        this._station = station;
        this._cpuActivity.state = station;
    }

    get player() {
        return this._player;
    }

    get isRunning() {
        return this.interval !== null;
    };

    get frame() {
        return this.currentFrame + this.currentCount;
    };

    get exponent() {
        return this.currentExponent;
    };

    public toggleGameLoop() {
        if (this.isRunning) {
            this.stopGameLoop();
        } else {
            this.startGameLoop();
        }
        return this.isRunning;
    };

    public listProcesses() {
        return this.processes.map(process => ({
            id: process.id,
            pid: process.pid,
            callback: process.callback
        }));
    }

    public sendNotification(message: string, level: NotificationLevel = NotificationLevel.INFO) {
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
        const processIndex = this.processes.findIndex(process => process.pid === pid);
        // Make sure the process exists before trying to remove it.
        if (processIndex > -1) {
            this.processes = [
                ...this.processes.slice(0, processIndex),
                ...this.processes.slice(processIndex + 1)
            ];
        }
        else {
            throw new OperatingSystemError(`Unable to find pid '${pid}'.`);
        }
    }

    addProcess(process: Process) {
        // console.log('Adding process!', process);
        // Make sure the process object is valid and you can't duplicate processes
        const processIndex = this.processes.findIndex(i => i?.['id'] === process?.['id']);
        process.pid = this.pid++;
        if (validateProcess(process) && processIndex === -1) {
            this.processes.push(process);
        }
        else {
            this.processes[processIndex] = process;
        }
        return processIndex !== -1;
    };

    removeProcess(process: Process) {
        this.processes = this.processes.filter(p => p?.['id'] !== process?.['id']);
    };

    resetProcesses() {
        this.processes = Array<Process>();
    };

    increaseExponent(amount: number = 1) {
        this.currentExponent += amount;
    };

    decreaseExponent(amount: number = 1) {
        this.currentExponent -= amount;
    };

    setExponent(amount: number) {
        this.currentExponent = amount;
    };

    // Main function
    update() {
        // console.debug('[OperatingSystem] - Update');
        this.currentFrame += 0.001;
        if (this.currentFrame > 1) {
            this.currentFrame = 0;
            this.currentCount++;
        }

        if (this._station && parseFloat((this.currentFrame / 0.1).toFixed(2)) % 1 === 0) {
            const coreUsage = this.processes.reduce((acc, process) => acc + (process.cores || 0), 0);
            const coreCount = this._station.cpu?.cores || 1;
            const cpuUsage = Math.round(coreUsage / coreCount * 100);
            this._cpuActivity.usage(cpuUsage);
        }

        for (const process of this.processes) {
            process.callback(Number(this.currentFrame.toFixed(3)), this.currentCount, this.currentExponent);
        }
    };
}
