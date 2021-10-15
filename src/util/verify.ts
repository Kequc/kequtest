import { AsyncFunc } from '../../types';

export function verifyDescription (description?: string): void {
    if (typeof description !== 'string') {
        throw new Error(`Description must be a string got ${typeof description} instead.`);
    }
}

export function verifyBlock (block?: AsyncFunc): void {
    if (typeof block !== 'function') {
        throw new Error(`Block must be a function got ${typeof block} instead.`);
    }
}
