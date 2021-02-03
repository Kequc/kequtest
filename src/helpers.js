function pluralise (count, singular, plural = `${singular}s`) {
    return `${count} ${(count === 1 ? singular : plural)}`;
}

module.exports = { pluralise };
