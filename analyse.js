import fs from 'fs';

const surveysSeen = new Set();

const surveys = fs.readdirSync('./surveyAnswersRaw').filter(file => /.+\.json$/.test(file)).map(file => JSON.parse(fs.readFileSync(`./surveyAnswersRaw/${file}`))).filter(survey => {
    if (surveysSeen.has(survey.id)) {
        return false;
    }
    surveysSeen.add(survey.id)
    return true;
});

console.log(`${surveys.length} surveys loaded.`);

const neverActive = surveys.filter(survey => {
    return (survey.end_at && survey.published_at && new Date(survey.published_at) > new Date(survey.end_at));
})

console.log(`${neverActive.length} surveys were never active.`);

const notInitial = neverActive.filter(survey => {
    return survey.answers[0].votes !== 20;
})

console.log(`${notInitial.length} surveys with non-initial votes:`);

notInitial.forEach(survey => {
    console.log(survey.question)
})