import { describe, expect, it } from 'vitest';

import {
    COMPLEXITY_EXP,
    WORK_CONSTANT,
    advance,
    tickRate,
    workPerChar,
} from './cipherMath';

describe('cipherMath', () => {
    describe('workPerChar', () => {
        it('returns WORK_CONSTANT at complexity = 1 (baseline preserved)', () => {
            expect(workPerChar(1)).toBeCloseTo(WORK_CONSTANT);
        });

        it('is monotone increasing in complexity', () => {
            const c1 = workPerChar(1);
            const c4 = workPerChar(4);
            const c8 = workPerChar(8);
            const c24 = workPerChar(24);
            expect(c4).toBeGreaterThan(c1);
            expect(c8).toBeGreaterThan(c4);
            expect(c24).toBeGreaterThan(c8);
        });

        it('is superlinear in complexity (4× is more than 4×)', () => {
            const c1 = workPerChar(1);
            const c4 = workPerChar(4);
            expect(c4).toBeGreaterThan(4 * c1);
        });

        it('is only mildly superlinear (4× costs < 5× the baseline)', () => {
            const c1 = workPerChar(1);
            const c4 = workPerChar(4);
            expect(c4).toBeLessThan(5 * c1);
        });

        it('clamps negative complexity to zero work', () => {
            expect(workPerChar(-3)).toBe(0);
        });

        it('uses the exported exponent', () => {
            // Sanity: complexity² ^ EXP should equal complexity^(2·EXP)
            expect(workPerChar(2)).toBeCloseTo(WORK_CONSTANT * Math.pow(2, COMPLEXITY_EXP));
        });
    });

    describe('tickRate', () => {
        it('multiplies gigaflops by the neural bonus', () => {
            expect(tickRate(2, 1.5)).toBe(3);
        });

        it('returns 0 when either input is non-positive', () => {
            expect(tickRate(0, 1.2)).toBe(0);
            expect(tickRate(2, 0)).toBe(0);
            expect(tickRate(-1, 2)).toBe(0);
            expect(tickRate(3, -1)).toBe(0);
        });

        it('returns plain gigaflops when neural bonus is exactly 1', () => {
            expect(tickRate(4.2, 1)).toBeCloseTo(4.2);
        });

        it('compounds CPU and neural bonus multiplicatively', () => {
            // A 2× CPU upgrade and a +50% neural bonus should stack to 3×.
            const baseline = tickRate(1, 1);
            const both = tickRate(2, 1.5);
            expect(both / baseline).toBeCloseTo(3);
        });
    });

    describe('advance', () => {
        it('solves zero chars when rate is below work', () => {
            const out = advance(0, 5, 10);
            expect(out.solved).toBe(0);
            expect(out.accum).toBe(5);
        });

        it('solves exactly one char when accum + rate equals work', () => {
            const out = advance(0, 10, 10);
            expect(out.solved).toBe(1);
            expect(out.accum).toBe(0);
        });

        it('carries leftover accumulator across ticks', () => {
            // 7 from a previous tick + 5 this tick = 12 → 1 char solved, 2 left over.
            const out = advance(7, 5, 10);
            expect(out.solved).toBe(1);
            expect(out.accum).toBe(2);
        });

        it('solves multiple chars in one tick when rate ≥ k × work', () => {
            // 25 work in one tick at work=10 → 2 chars, 5 left over.
            const out = advance(0, 25, 10);
            expect(out.solved).toBe(2);
            expect(out.accum).toBe(5);
        });

        it('handles work = 0 safely (no infinite loop)', () => {
            const out = advance(0, 5, 0);
            expect(out.solved).toBe(0);
            expect(out.accum).toBe(0);
        });

        it('treats negative rate as zero', () => {
            const out = advance(3, -2, 10);
            expect(out.solved).toBe(0);
            expect(out.accum).toBe(3);
        });

        it('returns 0 and bails when rate is Infinity (regression: legacy pointsAt could overflow)', () => {
            const out = advance(0, Number.POSITIVE_INFINITY, 10);
            expect(out.solved).toBe(0);
            expect(out.accum).toBe(0);
        });

        it('returns 0 and bails when rate is NaN', () => {
            const out = advance(0, Number.NaN, 10);
            expect(out.solved).toBe(0);
            expect(out.accum).toBe(0);
        });

        it('bails when work is non-finite', () => {
            const out = advance(0, 5, Number.POSITIVE_INFINITY);
            expect(out.solved).toBe(0);
            expect(out.accum).toBe(0);
        });

        it('caps solved count at MAX_SOLVES_PER_TICK to prevent runaway loops', () => {
            // Rate vastly exceeds work — without the cap this would solve millions.
            const out = advance(0, 1_000_000_000, 1);
            expect(out.solved).toBeLessThanOrEqual(1_000);
        });
    });

    describe('end-to-end: CPU and neural bonus compound', () => {
        it('faster CPU + same training reduces frames to solve proportionally', () => {
            const work = workPerChar(8); // SHA-256 complexity tier
            const slow = tickRate(1, 1);
            const fast = tickRate(4, 1);
            // Drain time to solve one char from a cold start.
            const stepsTo = (rate: number) => Math.ceil(work / rate);
            expect(stepsTo(fast)).toBeLessThan(stepsTo(slow));
            // 4× faster CPU should mean ~4× fewer ticks.
            expect(stepsTo(slow) / stepsTo(fast)).toBeCloseTo(4, 0);
        });

        it('neural bonus on top of CPU stacks multiplicatively', () => {
            const work = workPerChar(8);
            const baseline = Math.ceil(work / tickRate(2, 1));
            const trained = Math.ceil(work / tickRate(2, 1.5));
            // +50% training → ~33% fewer ticks (≈ 1/1.5 of baseline).
            expect(trained).toBeLessThan(baseline);
            expect(trained / baseline).toBeCloseTo(1 / 1.5, 1);
        });
    });
});
