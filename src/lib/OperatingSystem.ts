import { PlayerState } from "../includes/Player.interface";
import Process from "../includes/Process.interface";
import CpuActivity from "./CpuActivity";

import { NotificationLevel } from "../includes/OperatingSystem.interface";
import { StationStoreType } from "../includes/Process.interface";

import WorkerOperatingSystem from './worker/OperatingSystem?worker';
import { OperatingSystemWorkerMessage, OperatingSystemWorkerMessageType, type OSUpdateGameLoopData } from "./worker/OperatingSystem";

function validateProcess(process: any): process is Process {
    return "id" in process && "callback" in process;
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

    constructor(player: PlayerState) {
        this._player = player;
        this._cpuActivity = new CpuActivity(100, 50);
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

    public set station(station: StationStoreType) {
        this._station = station;
        this._cpuActivity.state = station;
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

    addProcess(process: Process) {
        // console.log('Adding process!', process);
        // Make sure the process object is valid and you can't duplicate processes
        const coreUsage = this.processes.reduce(
            (acc, process) => acc + (process.cores || 0),
            0,
        );
        const coreCount = this._station?.cpu?.cores || 1;

        console.log('coreUsage', coreUsage);
        console.log('coreCount', coreCount);

        if (coreUsage + (process.cores || 0) > coreCount) {
            throw new OperatingSystemError(`Not enough cores available to add process '${process.id}'.`);
        }
        
        const processIndex = this.processes.findIndex(
            (i) => i?.["id"] === process?.["id"],
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
            (p) => p?.["id"] !== process?.["id"],
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
            parseFloat((this.currentFrame / 0.1).toFixed(2)) % 1 === 0
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
