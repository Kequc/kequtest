import { ContainerJob } from '../types';

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

export function calcDepth (container?: ContainerJob): number {
    let count = 0;
    while (container) {
        count++;
        container = container.getParent();
    }
    return count;
}

export async function withTimeout (promise: void | Promise<void>, ms: number): Promise<void> {
    let timeout: NodeJS.Timeout;

    await Promise.race([promise, new Promise((_, reject) => {
        timeout = setTimeout(() => {
            reject(new Error(`Timeout: ${ms}ms`));
        }, ms);
    })]).finally(() => {
        clearTimeout(timeout);
    });
}
