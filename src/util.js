function pluralise (count, singular, plural) {
    if (count === 1) return `${count} ${singular}`;
    if (plural) return `${count} ${plural}`;
    return `${count} ${singular}s`;
}

module.exports = { pluralise };
