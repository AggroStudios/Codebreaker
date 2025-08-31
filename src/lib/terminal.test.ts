import { describe, it, expect, vi, beforeEach } from 'vitest';
import Terminal from './terminal';
import OperatingSystem from './OperatingSystem';

const mockStd = () => ({
  stdin: vi.fn(),
  stdout: vi.fn(),
  stderr: vi.fn(),
});

describe('Terminal', () => {
  let term: Terminal;
  let std: any;

  beforeEach(() => {
    std = mockStd();
    term = new Terminal({ historySize: 5 });
    term.attachTerminal(std);
  });

  it('should initialize with default prompt', () => {
    expect(term.prompt.endsWith('$ ')).toBe(true);
  });

  it('should attach operating system', () => {
    const os = new OperatingSystem({
      addNotification: vi.fn(),
      addMessage: vi.fn(),
      markMessageAsRead: vi.fn(),
      markNotificationAsRead: vi.fn(),
      player: {
        name: 'TestPlayer',
        money: 0,
        experience: 0,
        level: 1,
        nextLevel: 2,
        notifications: [],
        messages: [],
      },
      earnExperience: vi.fn(),
      addMoney: vi.fn(),
      removeMoney: vi.fn(),
    });
    term.attachOperatingSystem(os);
    expect(term.operatingSystem).toBe(os);
  });

  it('should add history and limit size', () => {
    for (let i = 0; i < 7; i++) {
      term.addHistory(`cmd${i}`, i);
    }
    expect(term.history.length).toBe(5);
    expect(term.history[0].command).toBe('cmd6');
  });

  it('should show and hide loader', () => {
    std.stdout.mockClear();
    term.showLoader(['|', '/']);
    // Loader should call stdout with loader characters
    expect(std.stdout).toHaveBeenCalled();
    term.hideLoader();
    // After hiding loader, stdout should be called again to clear
    expect(std.stdout).toHaveBeenCalled();
  });

  it('should log primitives and objects', () => {
    term.log('test');
    term.log(123);
    term.log(true);
    term.log(undefined);
    term.log(null);
    term.log([1, 2, 3]);
    term.log({ a: 1, b: [2, 3] });
    expect(std.stdout).toHaveBeenCalled();
  });

  it('should add to history after command', async () => {
    std.stdout.mockImplementation(() => {});
    std.stderr.mockImplementation(() => {});
    await term.command('ls');
    expect(term.history[0].command).toBe('ls');
  });

  it('should handle unknown command', async () => {
    std.stdout.mockImplementation(() => {});
    std.stderr.mockImplementation(() => {});
    await term.command('unknowncmd');
    expect(std.stderr).toHaveBeenCalled();
  });
});
