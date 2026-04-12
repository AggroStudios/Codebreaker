import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, waitFor } from "@solidjs/testing-library";
import Terminal from "./index";
import TerminalController from "../../lib/terminal";
import OperatingSystem from "../../lib/OperatingSystem";
import type { PlayerState } from "../../includes/Player.interface";

function createMockPlayerState(): PlayerState {
    return {
        player: {
            name: "TestPlayer",
            money: 0,
            experience: 0,
            level: 1,
            nextLevel: 2,
            notifications: [],
            messages: [],
        },
        moneyLabel: null,
        xpLabel: null,
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
    };
}

describe("Terminal Component", () => {
    it("renders without crashing", () => {
        const terminalController = new TerminalController();
        const operatingSystem = new OperatingSystem(createMockPlayerState());
        const { getByText } = render(() => (
            <Terminal
                terminalController={terminalController}
                operatingSystem={operatingSystem}
            />
        ));
        expect(getByText("Terminal")).toBeDefined();
    });

    it("renders input field and focuses it", () => {
        const terminalController = new TerminalController();
        const operatingSystem = new OperatingSystem(createMockPlayerState());
        const { container } = render(() => (
            <Terminal
                terminalController={terminalController}
                operatingSystem={operatingSystem}
            />
        ));
        const input = container.querySelector(
            "input.input",
        ) as HTMLInputElement;
        expect(input).toBeDefined();
        input.focus();
        expect(document.activeElement).toBe(input);
    });

    it("handles input and Enter key", async () => {
        const terminalController = new TerminalController();
        terminalController.command = async () => ({
            command: "",
            value: "output",
        });
        const operatingSystem = new OperatingSystem(createMockPlayerState());
        const { container } = render(() => (
            <Terminal
                terminalController={terminalController}
                operatingSystem={operatingSystem}
            />
        ));
        const input = container.querySelector(
            "input.input",
        ) as HTMLInputElement;
        await waitFor(() => {
            expect(container.textContent).toContain("/ $ ");
        });
        input.value = "test";
        fireEvent.input(input);
        fireEvent.keyUp(input, { key: "Enter" });
        await waitFor(() => {
            expect(container.textContent).toContain("test");
        });
    });
});
