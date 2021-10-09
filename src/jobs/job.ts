export const BASE_SCORE = {
    passed: 0,
    failed: 0,
    missing: 0,
    catastrophic: 0
};

// abstract
class Job {
    description: string;
    block: kequtest.Block;
    depth: number;
    buffer: Job[] = [];
    error: Error | null;

    constructor (description: string, block: kequtest.Block, depth: number) {
        if (typeof description !== 'string') {
            throw new Error(`Description must be a string got ${typeof description} instead.`);
        }
        if (block !== undefined && typeof block !== 'function') {
            throw new Error(`Block must be a function got ${typeof block} instead.`);
        }

        this.description = description;
        this.block = block;
        this.depth = depth;
        this.error = null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async run (_log: kequtest.Logger, _parentHooks: kequtest.TreeHooks): Promise<void> {
    }

    // attempt to run client code
    async runClientCode (log: kequtest.Logger): Promise<void> {
        try {
            if (this.block !== undefined) await this.block();
            log.info(this.message());
        } catch (error) {
            this.error = error as Error;
            log.info(this.message());
            log.info('');
            log.error(error);
            log.info('');
        }
    }

    // basic output
    message (): string {
        const padding = this.description.length + (this.depth) * 2;
        return this.description.padStart(padding);
    }

    // default score
    getScore (): kequtest.Score {
        return Object.assign({}, BASE_SCORE);
    }
}

export default Job;
