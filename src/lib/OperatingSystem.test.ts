import { describe, it, expect, vi, beforeEach } from "vitest";
import OperatingSystem, { OperatingSystemError } from "./OperatingSystem";
import { NotificationLevel } from "../includes/OperatingSystem.interface";
import { StationStoreType } from "../includes/Process.interface";
import { PlayerState } from "../includes/Player.interface";

const mockPlayer = (): Partial<PlayerState> => ({
    addNotification: vi.fn(),
    addMessage: vi.fn(),
    markMessageAsRead: vi.fn(),
    markNotificationAsRead: vi.fn(),
});

const mockStation = (cores: number | null) =>
    ({
        cpu: cores !== null ? { cores } : null,
        cpuActivity: [],
        setCpuActivity: vi.fn(),
    }) as unknown as StationStoreType;

const mockProcess = {
    id: "proc1",
    callback: vi.fn(),
};

describe("OperatingSystem", () => {
    let os: OperatingSystem;
    let player: any;

    beforeEach(() => {
        player = mockPlayer();
        os = new OperatingSystem(player);
    });

    it("should start and stop the game loop", () => {
        expect(os.isRunning).toBe(false);
        os.startGameLoop();
        expect(os.isRunning).toBe(true);
        os.stopGameLoop();
        expect(os.isRunning).toBe(false);
    });

    it("should toggle the game loop", () => {
        expect(os.toggleGameLoop()).toBe(true);
        expect(os.toggleGameLoop()).toBe(false);
    });

    it("should add, list, and remove processes", () => {
        os.addProcess({ ...mockProcess });
        expect(os.listProcesses()).toHaveLength(1);
        os.removeProcess(mockProcess);
        expect(os.listProcesses()).toHaveLength(0);
    });

    it("should kill a process by pid", () => {
        os.addProcess({ ...mockProcess });
        const proc = os.listProcesses().find((p) => p.id === "proc1");
        expect(proc).toBeDefined();
        os.kill(proc!.pid);
        expect(os.listProcesses().some((p) => p.id === "proc1")).toBe(false);
    });

    it("should throw error when killing non-existent pid", () => {
        expect(() => os.kill(999)).toThrow(OperatingSystemError);
    });

    it("should reset processes", () => {
        os.addProcess({ ...mockProcess });
        os.resetProcesses();
        expect(os.listProcesses()).toHaveLength(0);
    });

    it("should send notifications and messages", () => {
        os.sendNotification("test", NotificationLevel.INFO);
        expect(player.addNotification).toHaveBeenCalledWith({
            message: "test",
            level: NotificationLevel.INFO,
            unread: true,
        });
        os.sendMessage("sender", "body");
        expect(player.addMessage).toHaveBeenCalled();
    });

    it("should mark messages and notifications as read", () => {
        os.markMessageRead(0);
        expect(player.markMessageAsRead).toHaveBeenCalledWith(0);
        os.markNotificationRead(1);
        expect(player.markNotificationAsRead).toHaveBeenCalledWith(1);
    });

    it("should increase, decrease, and set exponent", () => {
        os.setExponent(5);
        expect(os.exponent).toBe(5);
        os.increaseExponent(2);
        expect(os.exponent).toBe(7);
        os.decreaseExponent(3);
        expect(os.exponent).toBe(4);
    });

    it("should update processes in update()", () => {
        os.addProcess({ ...mockProcess });
        os.update();
        expect(mockProcess.callback).toHaveBeenCalled();
    });
});

describe("OperatingSystem CPU core logic", () => {
    let os: OperatingSystem;

    beforeEach(() => {
        os = new OperatingSystem(mockPlayer() as PlayerState);
    });

    it("should allow a process that fills the default 1-core limit", () => {
        os.addProcess({ id: "p1", callback: vi.fn(), cores: 1 });
        expect(os.listProcesses()).toHaveLength(1);
    });

    it("should throw when exceeding the default 1-core limit", () => {
        os.addProcess({ id: "p1", callback: vi.fn(), cores: 1 });
        expect(() =>
            os.addProcess({ id: "p2", callback: vi.fn(), cores: 1 }),
        ).toThrow(OperatingSystemError);
    });

    it("should allow processes to fill all cores on a multi-core station", () => {
        os.station = mockStation(2);
        os.addProcess({ id: "p1", callback: vi.fn(), cores: 1 });
        os.addProcess({ id: "p2", callback: vi.fn(), cores: 1 });
        expect(os.listProcesses()).toHaveLength(2);
    });

    it("should throw when exceeding the station core count", () => {
        os.station = mockStation(2);
        os.addProcess({ id: "p1", callback: vi.fn(), cores: 1 });
        os.addProcess({ id: "p2", callback: vi.fn(), cores: 1 });
        expect(() =>
            os.addProcess({ id: "p3", callback: vi.fn(), cores: 1 }),
        ).toThrow(OperatingSystemError);
    });

    it("should allow coreless processes regardless of core count", () => {
        os.station = mockStation(1);
        for (let i = 0; i < 5; i++) {
            os.addProcess({ id: `p${i}`, callback: vi.fn() });
        }
        expect(os.listProcesses()).toHaveLength(5);
    });

    it("should default to 1-core limit when station has null cpu", () => {
        os.station = mockStation(null);
        os.addProcess({ id: "p1", callback: vi.fn(), cores: 1 });
        expect(() =>
            os.addProcess({ id: "p2", callback: vi.fn(), cores: 1 }),
        ).toThrow(OperatingSystemError);
    });
});
