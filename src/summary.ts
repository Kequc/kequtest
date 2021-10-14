import { pluralize, red } from './helpers';

import { ContainerJob, Score } from '../types';

// output single line of info
function summary (suite: ContainerJob): string {
    const score = suite.getScore();
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

    parts.push(pluralize(score.failed, 'failure'));

    if (score.catastrophic > 0) {
        parts.push(pluralize(score.catastrophic, 'catastrophic failure'));
    }

    return parts.join(', ');
}
