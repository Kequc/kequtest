import { pluralize, red } from '../util/helpers';

import { FakeLogger, TestLog } from './fake-logger';
import { ContainerJob } from '../../types';

export type SummaryFailure = {
    description: string;
    logs: TestLog[]
    error: Error;
};

export type SummaryProblem = {
    filename: string;
    failures: SummaryFailure[];
};

export type Summary = {
    filename: string | null,
    container: ContainerJob | null,
    problems: SummaryProblem[];
    successCount: number;
    missingCount: number;
    addFailure: (description: string, error: Error) => void;
    clearConsole: () => void;
    info: () => string;
};

function CreateSummary (fakeLogger: FakeLogger): Summary {
    const problems: SummaryProblem[] = [];

    function findProblem (filename: string): SummaryProblem {
        const existing = problems.find(problem => problem.filename === filename);
        if (existing) return existing;
        const problem: SummaryProblem = { filename, failures: [] };
        problems.push(problem);
        return problem;
    }

    return {
        filename: null,
        container: null,
        problems,
        successCount: 0,
        missingCount: 0,
        addFailure (description, error) {
            if (this.filename) {
                const problem = findProblem(this.filename);
                const logs = fakeLogger.logs;
                problem.failures.push({ description, logs, error });
            }
        },
        clearConsole () {
            fakeLogger.clear();
        },
        info () {
            const parts: string[] = [];
            const failedCount = problems.reduce((acc, problem) => acc + problem.failures.length, 0);

            parts.push(`${this.successCount}/${this.successCount + failedCount} passing`);
            if (this.missingCount > 0) parts.push(`${this.missingCount} missing`);
            parts.push(pluralize(failedCount, 'failure'));

            if (failedCount > 0) {
                return red(parts.join(', '));
            } else {
                return parts.join(', ');
            }
        }
    };
}

export default CreateSummary;
