import { pluralise, red } from './helpers';
import JobSuite from './jobs/job-suite';

type Score = {
    passed: number;
    failed: number;
    missing: number;
    catastrophic: number;
};

// output single line of info
function summary (suite: JobSuite) {
    const score: Score = suite.getScore();
    const text = render(score);

    if (score.failed > 0 || score.catastrophic > 0) {
        return red(text);
    } else {
        return text;
    }
}

export default summary;

function render (score: Score) {
    const parts: string[] = [];

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
