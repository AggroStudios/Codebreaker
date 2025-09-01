import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@solidjs/testing-library';
import Terminal from './index';
import TerminalController from '../../lib/terminal';
import OperatingSystem from '../../lib/OperatingSystem';

function createMockPlayerState() {
  return {
    player: {
      name: 'TestPlayer',
      money: 0,
      experience: 0,
      level: 1,
      nextLevel: 2,
      notifications: [],
      messages: [],
    },
    earnExperience: () => {},
    addMoney: () => {},
    removeMoney: () => {},
    addNotification: () => {},
    addMessage: () => {},
    markMessageAsRead: () => {},
    markNotificationAsRead: () => {},
  };
}

describe('Terminal Component', () => {
  it('renders without crashing', () => {
    const terminalController = new TerminalController();
    const operatingSystem = new OperatingSystem(createMockPlayerState());
    const { getByText } = render(() => <Terminal terminalController={terminalController} operatingSystem={operatingSystem} />);
    expect(getByText('Terminal')).toBeDefined();
  });

  it('renders input field and focuses it', () => {
    const terminalController = new TerminalController();
    const operatingSystem = new OperatingSystem(createMockPlayerState());
    const { container } = render(() => <Terminal terminalController={terminalController} operatingSystem={operatingSystem} />);
    const input = container.querySelector('input.input') as HTMLInputElement;
    expect(input).toBeDefined();
    input.focus();
    expect(document.activeElement).toBe(input);
  });

  it('handles input and Enter key', async () => {
    const terminalController = new TerminalController();
    terminalController.command = async () => ({ command: '', value: 'output' });
    const operatingSystem = new OperatingSystem(createMockPlayerState());
    const { container } = render(() => <Terminal terminalController={terminalController} operatingSystem={operatingSystem} />);
    const input = container.querySelector('input.input') as HTMLInputElement;
    input.value = 'test';
    fireEvent.input(input);
    fireEvent.keyUp(input, { key: 'Enter' });
    expect(container.textContent).toContain('test');
  });
});
