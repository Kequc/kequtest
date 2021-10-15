import { AsyncFunc, Logger } from '../types';

export function pluralize (count: number, singular: string, plural = `${singular}s`): string {
    const text = (count === 1 ? singular : plural);
    return `${count} ${text}`;
}

export function red (text: string): string {
    return `\x1b[31m${text}\x1b[0m`;
}

export function green (text: string): string {
    return `\x1b[32m${text}\x1b[0m`;
}

export function renderError (log: Logger, error: Error | null): void {
    if (error) {
        log.info('');
        log.error(error);
        log.info('');
    }
}

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
