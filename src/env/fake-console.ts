export type TestLog = {
    key: string;
    params: any[];
};

export type FakeConsole = {
    getLogs: () => TestLog[];
    clear: () => void;
    console: Console;
};

function CreateFakeConsole (): FakeConsole {
    const logs: TestLog[] = [];

    function capture (key: string) {
        return function (...params: any) {
            logs.push({ key, params });
        };
    }

    return {
        getLogs () {
            return [...logs];
        },
        clear () {
            logs.length = 0;
        },
        console: Object.assign(Object.create(console), {
            logger: capture('logger'),
            error: capture('error'),
            warn: capture('warn'),
            debug: capture('debug'),
            info: capture('info')
        })
    };
}

export default CreateFakeConsole;
