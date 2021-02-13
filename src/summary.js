const { pluralise, red } = require('./helpers.js');

function summary (log, suite) {
    const data = suite.getData();
    const result = getParts(data).join(', ');

    if (data.failed > 0 || data.catastrophic > 0) {
        log.info(red(result));
    } else {
        log.info(result);
    }
}

module.exports = summary;

function getParts (data) {
    const result = [];

    result.push(`${data.passed}/${data.passed + data.failed} passing`);

    if (data.missing > 0) {
        result.push(`${data.missing} missing`);
    }

    result.push(pluralise(data.failed, 'failure'));

    if (data.catastrophic > 0) {
        result.push(pluralise(data.catastrophic, 'catastrophic failure'));
    }

    return result;
}
