function pluralise (count, singular, plural = `${singular}s`) {
    const text = (count === 1 ? singular : plural);
    return `${count} ${text}`;
}

function red (text) {
    return `\x1b[31m${text}\x1b[0m`;
}

function green (text) {
    return `\x1b[32m${text}\x1b[0m`;
}

module.exports = { pluralise, red, green };
