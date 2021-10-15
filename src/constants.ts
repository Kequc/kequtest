export const BASE_SCORE = {
    passed: 0,
    failed: 0,
    missing: 0,
    catastrophic: 0
};

export const CHARS = {
    container: '\u21E2',
    success: '\u2713',
    fail: '\u2717'
};

export enum HookType {
    BEFORE,
    BEFORE_EACH,
    AFTER_EACH,
    AFTER
}
