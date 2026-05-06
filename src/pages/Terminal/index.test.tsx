import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Terminal from './index';
import TerminalController from '../../lib/terminal';
import OperatingSystem from '../../lib/OperatingSystem';
import type { PlayerState } from '../../includes/Player.interface';
import { useTerminalStore } from '../../stores/terminal';

function createMockPlayerState(): PlayerState {
    return {
        player: {
            name: 'TestPlayer',
            money: 0,
            experience: 0,
            level: 1,
            nextLevel: 2,
            notifications: [],
            messages: [],
            statistics: {
                startTime: 0,
                totalPlayedTime: 0,
                totalCiphers: {},
                totalMoneyEarned: 0,
                totalMoneySpent: 0,
                totalBytesDownloaded: 0,
                incomeHistory: [],
            },
        },
        moneyLabel: null,
        xpLabel: null,
        hasSeenTutorial: [],
        tutorialDisabled: false,
        tutorialStage: '',
        showTutorial: vi.fn(),
        setHasSeenTutorial: vi.fn(),
        markTutorialAsSeen: vi.fn(),
        resetTutorial: vi.fn(),
        setTutorialDisabled: vi.fn(),
        setMoneyLabel: vi.fn(),
        setXpLabel: vi.fn(),
        earnExperience: vi.fn(),
        addMoney: vi.fn(),
        removeMoney: vi.fn(),
        addNotification: vi.fn(),
        addMessage: vi.fn(),
        markMessageAsRead: vi.fn(),
        markNotificationAsRead: vi.fn(),
        markAllNotificationsAsRead: vi.fn(),
        deleteNotification: vi.fn(),
        deleteAllNotifications: vi.fn(),
        purchasedUpgrades: [],
        purchaseUpgrade: vi.fn(),
        successCipher: vi.fn(),
        failedCipher: vi.fn(),
        updateTotalPlayedTime: vi.fn(),
        pushIncomeRate: vi.fn(),
    };
}

describe('Terminal Component', () => {
    beforeEach(() => {
        useTerminalStore.setState({ terminalLines: [] });
    });

    it('renders without crashing', async () => {
        const terminalController = new TerminalController();
        const operatingSystem = new OperatingSystem(createMockPlayerState());
        const { getByText, container } = render(
            <Terminal
                terminalController={terminalController}
                operatingSystem={operatingSystem}
            />,
        );
        expect(getByText('Terminal')).toBeDefined();
        await waitFor(() => {
            expect(container.textContent).toContain('/ $ ');
        }, { timeout: 5000 });
    });

    it('renders input field and focuses it', async () => {
        const terminalController = new TerminalController();
        const operatingSystem = new OperatingSystem(createMockPlayerState());
        const { container } = render(
            <Terminal
                terminalController={terminalController}
                operatingSystem={operatingSystem}
            />,
        );
        const input = container.querySelector(
            'input.input',
        ) as HTMLInputElement;
        expect(input).toBeDefined();
        input.focus();
        expect(document.activeElement).toBe(input);
        await waitFor(() => {
            expect(container.textContent).toContain('/ $ ');
        }, { timeout: 5000 });
    });

    it('handles input and Enter key', async () => {
        const terminalController = new TerminalController();
        terminalController.command = async () => ({
            command: '',
            value: 'output',
        });
        const operatingSystem = new OperatingSystem(createMockPlayerState());
        const { container } = render(
            <Terminal
                terminalController={terminalController}
                operatingSystem={operatingSystem}
            />,
        );
        const input = container.querySelector(
            'input.input',
        ) as HTMLInputElement;
        await waitFor(
            () => {
                expect(container.textContent).toContain('/ $ ');
            },
            { timeout: 5000 },
        );
        const user = userEvent.setup();
        await user.click(input);
        await user.type(input, 'test');
        await user.keyboard('{Enter}');
        // Wait for the command to complete and a new prompt line to appear,
        // confirming all post-Enter state updates (setCommandLoaded, newLine) have settled
        await waitFor(() => {
            const promptMatches = container.textContent?.match(/\/ \$ /g);
            expect(promptMatches?.length).toBeGreaterThanOrEqual(2);
        }, { timeout: 5000 });
    });
});
