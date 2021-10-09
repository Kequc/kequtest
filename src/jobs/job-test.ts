import Job from './job';
import { red, green } from '../helpers';

import { Logger, TreeHooks } from '../../types';

class JobTest extends Job {
    async run (log: Logger, parentHooks: TreeHooks) {
        // sequence
        for (const beforeEach of parentHooks.beforeEach) await beforeEach();
        // block
        await this.runClientCode(log);
        // sequence
        for (const afterEach of parentHooks.afterEach) await afterEach();
    }

    // tests prefix with a dot and postfix with a result
    message () {
        const padding = this.description.length + (this.depth) * 2;
        return ('\u00B7 ' + this.description).padStart(padding) + this.postfix();
    }

    // red x missing tag or green checkmark
    postfix () {
        if (this.error) return red(' \u2717');
        if (this.block === undefined) return green(' -- missing --');
        return green(' \u2713');
    }

    getScore () {
        const result = super.getScore();

        if (this.error) {
            result.failed++;
        } else if (this.block === undefined) {
            result.missing++;
        } else {
            result.passed++;
        }

        return result;
    }
}

export default JobTest;
