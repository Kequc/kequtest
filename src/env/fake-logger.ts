export type TestLog = {
    key: string;
    params: any[];
};

export type FakeLogger = {
    logs: TestLog[];
    clear: () => void;
    console: Console;
};

function CreateFakeLogger (): FakeLogger {
    let logs: TestLog[] = [];

    function capture (key: string) {
        return function (...params: any) {
            logs.push({ key, params });
        };
    }

    return {
        logs,
        clear () {
            logs = [];
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

export default CreateFakeLogger;
