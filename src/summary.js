const JobTest = require('./jobs/job-test.js');
const { pluralise } = require('./util.js');

function summary (suite) {
    const data = getData(suite);
    const passed = `${data.passed}/${data.passed + data.failed} passing, ${pluralise(data.failed, 'failure')}`;

    if (data.failed > 0) {
        console.log(`\x1b[31m${passed}\x1b[0m`);
    } else {
        console.log(passed);
    }

    if (data.catastrophic > 0) {
        console.log(`\x1b[31m${pluralise(data.catastrophic, 'catastrophic error')}\x1b[0m`);
    }
}

function getData (parent) {
    const result = {
        passed: 0,
        failed: 0,
        catastrophic: 0
    };

    for (const child of parent.buffer) {
        if (child instanceof JobTest) {
            if (child.error) {
                result.failed++;
            } else {
                result.passed++;
            }
        } else if (child.error) {
            result.catastrophic++;
        } else {
            const data = getData(child);
            result.passed += data.passed;
            result.failed += data.failed;
            result.catastrophic += data.catastrophic;
        }
    }

    return result;
}

module.exports = summary;
