import CreateFakeConsole, { FakeConsole, TestLog } from './fake-console';
import { AbstractJob, ContainerJob } from '../types';
import { pluralize, red } from '../util/helpers';

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
    captureConsole: (block: (fakeConsole: FakeConsole) => void | Promise<void>) => Promise<void>;
    addFailure: (job: AbstractJob, logs: TestLog[], error: Error) => void;
    info: () => string;
};

function CreateSummary (): Summary {
    const failures: SummaryFailure[] = [];

    return {
        filename: null,
        container: null,
        failures,
        failCount: 0,
        successCount: 0,
        missingCount: 0,
        async captureConsole (block) {
            // take over console
            const fakeConsole = CreateFakeConsole();
            const originalConsole = global.console;
            global.console = fakeConsole.console;

            await block(fakeConsole);

            // restore console
            global.console = originalConsole;
        },
        addFailure (job, logs, error) {
            const tree = failureTree(job);
            failures.push({ tree, logs, error });
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
