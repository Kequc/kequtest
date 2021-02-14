const { pluralise, red } = require('./helpers.js');

function summary (log, suite) {
    const score = suite.getScore();
    const result = render(score);

    if (score.failed > 0 || score.catastrophic > 0) {
        log.info(red(result));
    } else {
        log.info(result);
    }
}

module.exports = summary;

function render (score) {
    const parts = [];

    parts.push(`${score.passed}/${score.passed + score.failed} passing`);

    if (score.missing > 0) {
        parts.push(`${score.missing} missing`);
    }

    parts.push(pluralise(score.failed, 'failure'));

    if (score.catastrophic > 0) {
        parts.push(pluralise(score.catastrophic, 'catastrophic failure'));
    }

    return parts.join(', ');
}
