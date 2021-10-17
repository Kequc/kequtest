import { AbstractJob, ContainerJob } from '../../types';
import { pluralize, red } from '../util/helpers';

import CreateFakeConsole, { TestLog } from './fake-console';

export type SummaryFailure = {
    tree: AbstractJob[];
    logs: TestLog[];
    error: Error;
};

export type Summary = {
    filename: string | null,
    container: ContainerJob | null,
    failures: SummaryFailure[];
    failCount: number;
    successCount: number;
    missingCount: number;
    getFakeConsole: () => Console;
    addFailure: (job: AbstractJob, error: Error) => void;
    clearFakeConsole: () => void;
    info: () => string;
};

function CreateSummary (): Summary {
    const fakeConsole = CreateFakeConsole();
    const failures: SummaryFailure[] = [];

    return {
        filename: null,
        container: null,
        failures,
        failCount: 0,
        successCount: 0,
        missingCount: 0,
        getFakeConsole () {
            return fakeConsole.console;
        },
        addFailure (job, error) {
            const tree = failureTree(job);
            const logs = fakeConsole.getLogs();
            failures.push({ tree, logs, error });
        },
        clearFakeConsole () {
            fakeConsole.clear();
        },
        info () {
            const parts: string[] = [];

            parts.push(`${this.successCount}/${this.successCount + this.failCount} passing`);
            if (this.missingCount > 0) parts.push(`${this.missingCount} missing`);
            parts.push(pluralize(this.failures.length, 'failure'));

            if (this.failures.length > 0) {
                return red(parts.join(', '));
            } else {
                return parts.join(', ');
            }
        }
    };
}

export default CreateSummary;

function failureTree (job?: AbstractJob): AbstractJob[] {
    const parts: AbstractJob[] = [];
    while (job) {
        parts.unshift(job);
        job = job.getParent();
    }
    return parts;
}
