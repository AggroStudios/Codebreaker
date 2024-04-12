import Process from '../includes/Process.interface';

const FPS = 60;

function validateProcess(process: any): process is Process {
    return 'id' in process && 'callback' in process;
}

// Exporting main game controller
export default class GameController {
    private pid: number = 10;
    private interval: null | number = null;
    private currentFrame: number = 0;
    private currentCount: number = 0;
    private currentExponent: number = 1;
    private processes: Array<Process> = [];

    public startGameLoop() {
        this.interval = setInterval(() => this.update(), 5000 / FPS);
    };

    public stopGameLoop() {
        clearInterval(this.interval);
        this.interval = null;
    };

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
        return this.processes;
    }

    addProcess(process: Process) {
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
        const processIndex = this.processes.findIndex(i => i?.['id'] === process?.['id']);
        // Make sure the process exists before trying to remove it.
        if (processIndex > -1) {
            this.processes = [
                ...this.processes.slice(0, processIndex),
                ...this.processes.slice(processIndex + 1)
            ];
        }
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
        console.debug('[GameController] - Update');
        this.currentFrame += 0.001;
        if (this.currentFrame > 1) {
            this.currentFrame = 0;
            this.currentCount++;
        }

        for (let process of this.processes) {
            process.callback(Number(this.currentFrame.toFixed(3)), this.currentCount, this.currentExponent);
        }
    };
}
