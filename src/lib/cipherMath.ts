/**
 * Pure math helpers for the cipher break loop. Kept separate from
 * `Cipher.tsx` so the formula is easy to unit-test and tune without
 * touching the rest of the cipher state machine.
 */

/** Baseline work to solve one character at complexity = 1. Matches the legacy `10 × complexity` scale. */
export const WORK_CONSTANT = 10;

/**
 * Exponent applied to a cipher's `complexity`. >1 makes harder ciphers
 * disproportionately heavier; tuned mild so the progression curve stays
 * playable end-to-end (RSA-2048 ≈ 1.6× the legacy cost, not 10×).
 */
export const COMPLEXITY_EXP = 1.15;

/** Work units required to solve one character of a cipher at the given `complexity`. */
export const workPerChar = (complexity: number): number =>
    WORK_CONSTANT * Math.pow(Math.max(0, complexity), COMPLEXITY_EXP);

/**
 * Work units the station processes per OS callback tick. CPU speed
 * (gigaflops) and the neural-net training bonus combine multiplicatively:
 * a faster CPU and a well-trained net stack.
 */
export const tickRate = (gigaflops: number, neuralBonus: number): number =>
    Math.max(0, gigaflops) * Math.max(0, neuralBonus);

export interface AdvanceResult {
    /** Characters that should be solved this tick (≥ 0). */
    solved: number;
    /** Accumulator value to carry into the next tick. */
    accum: number;
}

/**
 * Defense-in-depth cap on how many characters can be solved in a single
 * tick. Even if a future change feeds a runaway rate downstream, the loop
 * can't burn CPU/RAM. Callers usually bound the result further (e.g. by
 * the cipher's remaining unsolved-index count).
 */
export const MAX_SOLVES_PER_TICK = 1_000;

/**
 * Add this tick's `rate` to `accum`, then drain as many full `work`-sized
 * characters as the accumulator covers. Handles sub-frame rates (rate <
 * work; accumulator carries between ticks) and multi-char-per-frame
 * rates (rate ≥ work × k for k > 1).
 *
 * Returns `{ solved: 0, accum }` if `rate` or `work` is non-finite or
 * non-positive — protects the cipher break loop from upstream Infinity /
 * NaN bugs that previously caused unbounded-loop hangs.
 *
 * Pure function — does not mutate inputs.
 */
export const advance = (accum: number, rate: number, work: number): AdvanceResult => {
    if (!Number.isFinite(work) || work <= 0) return { solved: 0, accum };
    if (!Number.isFinite(rate) || rate <= 0) return { solved: 0, accum };
    const safeAccum = Number.isFinite(accum) ? accum : 0;
    let next = safeAccum + rate;
    let solved = 0;
    while (next >= work && solved < MAX_SOLVES_PER_TICK) {
        next -= work;
        solved += 1;
    }
    return { solved, accum: next };
};
