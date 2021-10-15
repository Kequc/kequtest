import Module from 'module';
import path from 'path';

import { Summary } from './summary';

export type Mocker = {
    mock: IMock;
    uncache: (request: string) => void;
};

export interface IMock {
    (request: string, override: any): void;
    stop: (mock: string) => void;
    stopAll: () => void;
}

function CreateMocker (summary: Summary): Mocker {
    const _load = (Module as any)._load;
    const overrides: { [key: string]: any } = {};

    // overridden node internal
    (Module as any)._load = function (request: string, parent: { filename: string }) {
        if (parent && summary) {
            const { container } = summary;
            const absolute = calcAbsolute(request, parent.filename);

            // if we're mocking this request
            if (overrides[absolute]) {
                return overrides[absolute];
            }

            // node will cache the requested resource
            // we track it so that it can be uncached later
            if (container && !require.cache[absolute]) {
                container.addCache(absolute);
            }
        }

        // hand over to node
        // eslint-disable-next-line prefer-rest-params
        return _load.apply(this, arguments);
    };

    // track specified overload
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    function mock (request: string, override: any): void {
        const { filename, container } = summary;
        const absolute = calcAbsolute(request, filename!);
        container!.addMock(absolute);
        overrides[absolute] = override;
    }

    // untrack specified overload
    function stop (request: string): void {
        const { filename } = summary;
        const absolute = calcAbsolute(request, filename!);
        delete overrides[absolute];
    }

    // untrack all overloads
    function stopAll (): void {
        for (const absolute of Object.keys(overrides)) {
            delete overrides[absolute];
        }
    }

    // remove from node internal cache
    function uncache (request: string): void {
        const { filename } = summary;
        const absolute = calcAbsolute(request, filename!);
        delete require.cache[absolute];
    }

    mock.stop = stop;
    mock.stopAll = stopAll;

    return { mock, uncache };
}

export default CreateMocker;

// convert request to absolute path
function calcAbsolute (request: string, filename: string) {
    if (typeof request !== 'string') {
        throw new Error(`Target must be a string got ${typeof request} instead.`);
    }

    if (/^\.{1,2}[/\\]?/.test(request)) {
        const absolute = path.join(path.dirname(filename), request);
        return require.resolve(absolute);
    }

    return require.resolve(request);
}
