import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OperatingSystemWorkerMessageType } from './OperatingSystem';

const postMessageMock = vi.fn();

// Dispatches a message to the worker's onmessage handler
const trigger = (type: OperatingSystemWorkerMessageType, data?: unknown) => {
    (globalThis as any).onmessage({ data: { type, data } });
};

describe('OperatingSystem Worker', () => {
    beforeEach(async () => {
        // Fresh module state for every test
        vi.resetModules();
        vi.stubGlobal('postMessage', postMessageMock);
        postMessageMock.mockReset();
        await import('./OperatingSystem');
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    describe('START_GAME_LOOP', () => {
        it('should post back with data: true', () => {
            trigger(OperatingSystemWorkerMessageType.START_GAME_LOOP);
            expect(postMessageMock).toHaveBeenCalledWith({
                type: OperatingSystemWorkerMessageType.START_GAME_LOOP,
                data: true,
            });
        });

        it('should start posting UPDATE_GAME_LOOP messages on each interval tick', () => {
            trigger(OperatingSystemWorkerMessageType.START_GAME_LOOP);
            postMessageMock.mockClear();
            vi.advanceTimersByTime(Math.ceil(500 / 60));
            expect(postMessageMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: OperatingSystemWorkerMessageType.UPDATE_GAME_LOOP,
                    data: expect.objectContaining({ frame: expect.any(Number), count: 0, exponent: 1 }),
                }),
            );
        });
    });

    describe('STOP_GAME_LOOP', () => {
        it('should post back with data: false', () => {
            trigger(OperatingSystemWorkerMessageType.START_GAME_LOOP);
            postMessageMock.mockClear();
            trigger(OperatingSystemWorkerMessageType.STOP_GAME_LOOP);
            expect(postMessageMock).toHaveBeenCalledWith({
                type: OperatingSystemWorkerMessageType.STOP_GAME_LOOP,
                data: false,
            });
        });

        it('should stop posting updates after being called', () => {
            trigger(OperatingSystemWorkerMessageType.START_GAME_LOOP);
            trigger(OperatingSystemWorkerMessageType.STOP_GAME_LOOP);
            postMessageMock.mockClear();
            vi.advanceTimersByTime(1000);
            expect(postMessageMock).not.toHaveBeenCalled();
        });
    });

    describe('SET_EXPONENT', () => {
        it('should reflect the new exponent in subsequent UPDATE_GAME_LOOP messages', () => {
            trigger(OperatingSystemWorkerMessageType.SET_EXPONENT, { exponent: 5 });
            trigger(OperatingSystemWorkerMessageType.START_GAME_LOOP);
            postMessageMock.mockClear();
            vi.advanceTimersByTime(Math.ceil(500 / 60));
            expect(postMessageMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: OperatingSystemWorkerMessageType.UPDATE_GAME_LOOP,
                    data: expect.objectContaining({ exponent: 5 }),
                }),
            );
        });
    });

    describe('update — frame rollover', () => {
        it('should reset frame to 0 and increment count when frame exceeds 1', () => {
            trigger(OperatingSystemWorkerMessageType.START_GAME_LOOP);
            postMessageMock.mockClear();

            // Each tick adds 0.001 to frame; rollover happens after 1001 ticks.
            // Advance enough time to guarantee it.
            vi.advanceTimersByTime(15000);

            const updateCalls = postMessageMock.mock.calls.filter(
                ([msg]) => msg.type === OperatingSystemWorkerMessageType.UPDATE_GAME_LOOP,
            );
            const lastUpdate = updateCalls[updateCalls.length - 1][0];
            expect(lastUpdate.data.count).toBeGreaterThanOrEqual(1);
            expect(lastUpdate.data.frame).toBeLessThan(1);
        });
    });
});
