export type TestLog = {
    key: string;
    params: any[];
};

export type FakeConsole = {
    getLogs: () => TestLog[];
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
        console: Object.assign(Object.create(console), {
            log: capture('log'),
            error: capture('error'),
            warn: capture('warn'),
            debug: capture('debug'),
            info: capture('info'),
            dir: capture('dir'),
            dirxml: capture('dirxml'),
            table: capture('table'),
            trace: capture('trace')
        })
    };
}

export default CreateFakeConsole;
