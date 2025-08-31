import { describe, it, expect, vi, beforeEach } from 'vitest';
import OperatingSystem, { OperatingSystemError } from './OperatingSystem';
import { NotificationLevel } from '../includes/OperatingSystem.interface';

const mockPlayer = () => ({
  addNotification: vi.fn(),
  addMessage: vi.fn(),
  markMessageAsRead: vi.fn(),
  markNotificationAsRead: vi.fn(),
});

const mockProcess = {
  id: 'proc1',
  callback: vi.fn(),
};

describe('OperatingSystem', () => {
  let os: OperatingSystem;
  let player: any;

  beforeEach(() => {
    player = mockPlayer();
    os = new OperatingSystem(player);
  });

  it('should start and stop the game loop', () => {
    expect(os.isRunning).toBe(false);
    os.startGameLoop();
    expect(os.isRunning).toBe(true);
    os.stopGameLoop();
    expect(os.isRunning).toBe(false);
  });

  it('should toggle the game loop', () => {
    expect(os.toggleGameLoop()).toBe(true);
    expect(os.toggleGameLoop()).toBe(false);
  });

  it('should add, list, and remove processes', () => {
    os.addProcess({ ...mockProcess });
    expect(os.listProcesses()).toHaveLength(1);
    os.removeProcess(mockProcess);
    expect(os.listProcesses()).toHaveLength(0);
  });

  it('should kill a process by pid', () => {
    os.addProcess({ ...mockProcess });
    const proc = os.listProcesses()[0];
    os.kill(proc.pid);
    expect(os.listProcesses()).toHaveLength(0);
  });

  it('should throw error when killing non-existent pid', () => {
    expect(() => os.kill(999)).toThrow(OperatingSystemError);
  });

  it('should reset processes', () => {
    os.addProcess({ ...mockProcess });
    os.resetProcesses();
    expect(os.listProcesses()).toHaveLength(0);
  });

  it('should send notifications and messages', () => {
    os.sendNotification('test', NotificationLevel.INFO);
    expect(player.addNotification).toHaveBeenCalledWith({ message: 'test', level: NotificationLevel.INFO, unread: true });
    os.sendMessage('sender', 'body');
    expect(player.addMessage).toHaveBeenCalled();
  });

  it('should mark messages and notifications as read', () => {
    os.markMessageRead(0);
    expect(player.markMessageAsRead).toHaveBeenCalledWith(0);
    os.markNotificationRead(1);
    expect(player.markNotificationAsRead).toHaveBeenCalledWith(1);
  });

  it('should increase, decrease, and set exponent', () => {
    os.setExponent(5);
    expect(os.exponent).toBe(5);
    os.increaseExponent(2);
    expect(os.exponent).toBe(7);
    os.decreaseExponent(3);
    expect(os.exponent).toBe(4);
  });

  it('should update processes in update()', () => {
    os.addProcess({ ...mockProcess });
    os.update();
    expect(mockProcess.callback).toHaveBeenCalled();
  });
});
