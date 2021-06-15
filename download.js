import fetch from 'node-fetch';
import fs from 'fs';

const concurrency = 16;

async function vote(answerId) {
    const response = await fetch(`https://api.nau.ch/survey-answers/${answerId}/vote`, {
        method: 'POST',
        json: {}
    })
    return await response.json();
}

let id = 1;
async function download(answerIdOverride) {
    const answerId = answerIdOverride || id++;
    const res = await vote(answerId);
    console.log(res)
    if (!res.id) {
        return;
    }
    fs.writeFile(`./surveyAnswersRaw/${answerId}.json`, JSON.stringify(res, null, 4), () => { })
}

async function main() {
    while (1) {
        await download()
    }
}

for (let i = 0; i < concurrency; i++) {
    main();
}