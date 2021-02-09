const JobContainer = require('./jobs/job-container.js');
const { pluralise, red } = require('./helpers.js');

function summary (log, suite) {
    const data = getData(suite);

    let result = `${data.passed}/${data.passed + data.failed} passing`;

    if (data.missing > 0) {
        result += `, ${data.missing} missing`;
    }

    result += `, ${pluralise(data.failed, 'failure')}`;

    if (data.catastrophic > 0) {
        result += `, ${pluralise(data.catastrophic, 'catastrophic failure')}`;
    }

    if (data.failed > 0 || data.catastrophic > 0) {
        log.info(red(result));
    } else {
        log.info(result);
    }
}

function getData (parent) {
    const result = {
        passed: 0,
        failed: 0,
        missing: 0,
        catastrophic: 0
    };

    for (const child of parent.buffer) {
        if (!(child instanceof JobContainer)) {
            if (child.error) {
                result.failed++;
            } else if (child.cb === undefined) {
                result.missing++;
            } else {
                result.passed++;
            }
        } else if (child.error) {
            result.catastrophic++;
        } else {
            const data = getData(child);
            result.passed += data.passed;
            result.failed += data.failed;
            result.missing += data.missing;
            result.catastrophic += data.catastrophic;
        }
    }

    return result;
}

module.exports = summary;
