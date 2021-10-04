import { IJobContainer } from './jobs';

export interface IDescribe {
    (): void;
}

export interface ITest {
    (): void;
}

export interface IHook {
    (): void;
}

export type Logger = {
    log: (...params: any) => any;
    error: (...params: any) => any;
    warn: (...params: any) => any;
    debug: (...params: any) => any;
    info: (...params: any) => any;
};

export type Globals = {
    filename: string | null,
    container: IJobContainer | null,
    describe: (description: string, block: IDescribe) => void,
    it: (description: string, block: ITest) => void,
    util: {
        mock: () => () => any;
        uncache: () => void;
        log: Logger;
        spy: (...params: any) => (...params: any) => any;
    }
};
