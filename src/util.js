function pluralise (count, singular, plural) {
    if (count === 1) return `${count} ${singular}`;
    if (plural) return `${count} ${plural}`;
    return `${count} ${singular}s`;
}

async function sequence (promises) {
    await promises.reduce((acc, curr) => acc.then(curr), Promise.resolve());
}

module.exports = { pluralise, sequence };
