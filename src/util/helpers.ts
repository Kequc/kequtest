import { AsyncFunc, Logger } from '../../types';

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
