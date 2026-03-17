import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DATA_DIR = path.join(__dirname, '../src/data');
const PUBLIC_DATA_DIR = path.join(__dirname, '../public/data');
const PUBLIC_CONFIG_DIR = path.join(__dirname, '../public/config');
const GK_TOPICS_DIR = path.join(PUBLIC_DATA_DIR, 'gk-topics');
const GK_TOPIC_NOTES_DIR = path.join(PUBLIC_DATA_DIR, 'gk-topic-notes');
const HISTORY_CAT_DIR = path.join(PUBLIC_DATA_DIR, 'history-categories');

// Ensure output directories exist
[PUBLIC_DATA_DIR, PUBLIC_CONFIG_DIR, GK_TOPICS_DIR, GK_TOPIC_NOTES_DIR, HISTORY_CAT_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Helpers
const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};
const cleanWord = (text) => text ? text.split('(')[0].trim() : '';
const getDistractors = (correctAnswer, allPossibleAnswers, count = 3) => {
    const distractors = [];
    const available = allPossibleAnswers.filter(a => a !== correctAnswer);
    const shuffled = shuffleArray(available);
    while (distractors.length < count && shuffled.length > distractors.length) {
        distractors.push(shuffled[distractors.length]);
    }
    return distractors;
};

// Slug helper for safe filenames
const toSlug = (str) => str.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').toLowerCase();

// Read from src/data
const readSrc = (filename) => {
    const filePath = path.join(SRC_DATA_DIR, filename);
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};
// Read from public/data (data already migrated there)
const readPublic = (filename) => {
    const filePath = path.join(PUBLIC_DATA_DIR, filename);
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};
const writePublicJSON = (filename, data) => {
    fs.writeFileSync(path.join(PUBLIC_DATA_DIR, filename), JSON.stringify(data));
};
const writeConfigJSON = (filename, data) => {
    fs.writeFileSync(path.join(PUBLIC_CONFIG_DIR, filename), JSON.stringify(data));
};
const writeGkTopic = (slug, data) => {
    fs.writeFileSync(path.join(GK_TOPICS_DIR, `${slug}.json`), JSON.stringify(data));
};
const writeGkTopicNote = (slug, data) => {
    fs.writeFileSync(path.join(GK_TOPIC_NOTES_DIR, `${slug}.json`), JSON.stringify(data));
};
const writeHistoryCat = (slug, data) => {
    fs.writeFileSync(path.join(HISTORY_CAT_DIR, `${slug}.json`), JSON.stringify(data));
};

console.log('=== SSC Quiz Data Build Pipeline ===');

let warnings = 0;
const metadata = {
    math1: { chapters: [], types: [] },
    math2: { chapters: [], types: [] },
    history: { categories: [], categoryTopics: {} },
    polity: { topics: [] },
    staticGk: { topics: [], topicSlugs: {}, noteSlugs: {} },
    geography: { topics: [] },
    economics: { topics: [] },
    physics: { topics: [] },
    chemistry: { topics: [] },
    biology: { topics: [] },
    currentAffairs: { topics: [] },
};

// --- MATH ---
const processMath = (name, key) => {
    const data = readPublic(`${name}.json`);
    if (!data) { console.warn(`⚠ SKIP: ${name}.json not found`); warnings++; return; }
    metadata[key].chapters = ['All', ...new Set(data.map(q => q.chapter))];
    metadata[key].types = ['All', ...new Set(data.map(q => q.type))];
    // Validation
    const missing = data.filter(q => !q.chapter || !q.correct_option || !q.options);
    if (missing.length > 0) {
        console.warn(`⚠ WARN: ${name}.json has ${missing.length} questions with missing fields`);
        warnings++;
    }
    console.log(`✓ ${name}: ${data.length} questions, ${metadata[key].chapters.length - 1} chapters`);
};
processMath('math1', 'math1');
processMath('math2', 'math2');

// --- STATIC GK (split into per-topic files) ---
console.log('\nProcessing StaticGK (splitting into per-topic files)...');
const staticGkData = readPublic('staticGk.json') || readSrc('staticGk.json');
if (staticGkData) {
    const topicMap = {};
    staticGkData.forEach(topicObj => {
        const slug = toSlug(topicObj.topic);
        topicMap[topicObj.topic] = slug;
        writeGkTopic(slug, topicObj);
    });
    metadata.staticGk.topics = staticGkData.map(t => t.topic);
    metadata.staticGk.topicSlugs = topicMap;
    console.log(`✓ staticGk: split into ${staticGkData.length} topic files`);
} else {
    console.warn('⚠ WARN: staticGk.json not found, skipping');
    warnings++;
}

// --- STATIC GK NOTES (split into per-topic note files, was 945KB) ---
console.log('\nProcessing StaticGK Notes (splitting 945KB into per-topic note files)...');
const staticGkNotesData = readPublic('staticGkNotes.json') || readSrc('staticGkNotes.json');
if (staticGkNotesData) {
    const noteSlugMap = {};
    let skipped = 0;
    staticGkNotesData.forEach(topicObj => {
        // Skip topics with no actual notes content
        if (!topicObj.notes || topicObj.notes.length === 0) { skipped++; return; }
        const slug = toSlug(topicObj.topic);
        noteSlugMap[topicObj.topic] = slug;
        writeGkTopicNote(slug, topicObj);
    });
    metadata.staticGk.noteSlugs = noteSlugMap;
    console.log(`✓ staticGkNotes: split into ${Object.keys(noteSlugMap).length} note files (${skipped} empty topics skipped)`);
} else {
    console.warn('⚠ WARN: staticGkNotes.json not found, skipping');
    warnings++;
}

// --- HISTORY (split into per-category files) ---
console.log('\nProcessing History (splitting into per-category files)...');
const historyData = readPublic('history.json') || readSrc('history.json');
if (historyData) {
    const byCategory = {};
    historyData.forEach(topicObj => {
        if (!byCategory[topicObj.category]) byCategory[topicObj.category] = [];
        byCategory[topicObj.category].push(topicObj);
    });
    metadata.history.categories = Object.keys(byCategory);
    metadata.history.categoryTopics = {};
    Object.entries(byCategory).forEach(([cat, topics]) => {
        const slug = toSlug(cat);
        writeHistoryCat(slug, topics);
        metadata.history.categoryTopics[cat] = topics.map(t => t.topic);
        console.log(`  ✓ History ${cat}: ${topics.length} topics → history-categories/${slug}.json`);
    });
}  else {
    console.warn('⚠ WARN: history.json not found, skipping');
    warnings++;
}

// --- OTHER GK SUBJECTS ---
const processGkSubject = (name, metaKey) => {
    const data = readPublic(`${name}.json`) || readSrc(`${name}.json`);
    if (!data) { console.warn(`⚠ SKIP: ${name}.json not found`); warnings++; return; }
    metadata[metaKey].topics = data.map(p => p.topic);
    writePublicJSON(`${name}.json`, data);
    const notes = readSrc(`${name}Notes.json`);
    if (notes && JSON.stringify(notes).length > 10) writePublicJSON(`${name}Notes.json`, notes);
    console.log(`✓ ${name}: ${data.length} topics`);
};

processGkSubject('polity', 'polity');
processGkSubject('geography', 'geography');
processGkSubject('economics', 'economics');
processGkSubject('physics', 'physics');
processGkSubject('chemistry', 'chemistry');
processGkSubject('biology', 'biology');
processGkSubject('currentAffairs', 'currentAffairs');

// --- ENGLISH (Pre-compute distractors) ---
console.log('\nPre-computing English questions...');
const idioms = readSrc('idioms.json');
if (idioms) {
    const allMeanings = idioms.map(item => item.meaning);
    const precomputed = idioms.map((item, index) => {
        const distractors = getDistractors(item.meaning, allMeanings);
        const options = shuffleArray([item.meaning, ...distractors]);
        return {
            id: `IDIOM-${index}`, chapter: 'English', type: 'Idioms',
            question: `What is the meaning of the idiom: "${item.idiom}"?`,
            options: { A: options[0], B: options[1], C: options[2], D: options[3] },
            correct_option: ['A','B','C','D'][options.indexOf(item.meaning)],
            answer: item.meaning, explanation: `Hindi Meaning: ${item.hindi}`
        };
    });
    writePublicJSON('idioms.json', precomputed);
    console.log(`✓ idioms: ${precomputed.length} questions pre-computed`);
}

const ows = readSrc('oneWordSubs.json');
if (ows) {
    const allWords = ows.map(item => cleanWord(item.one_word));
    const precomputed = ows.map((item, index) => {
        const correctWord = cleanWord(item.one_word);
        const distractors = getDistractors(correctWord, allWords);
        const options = shuffleArray([correctWord, ...distractors]);
        return {
            id: `OWS-${index}`, chapter: 'English', type: 'One Word Substitution',
            question: `Substitute one word for: "${item.phrases}"`,
            options: { A: options[0], B: options[1], C: options[2], D: options[3] },
            correct_option: ['A','B','C','D'][options.indexOf(correctWord)],
            answer: correctWord, explanation: `Hindi: ${item.hindi}`
        };
    });
    writePublicJSON('oneWordSubs.json', precomputed);
    console.log(`✓ oneWordSubs: ${precomputed.length} questions pre-computed`);
}

const synoAnto = readSrc('synoAnto.json');
if (synoAnto) {
    const precomputed = [];
    const allWords = [];
    synoAnto.forEach(item => {
        if (item.synonyms) item.synonyms.split(',').forEach(w => allWords.push(cleanWord(w)));
        if (item.antonyms) item.antonyms.split(',').forEach(w => allWords.push(cleanWord(w)));
    });
    synoAnto.forEach((item, index) => {
        const word = cleanWord(item.word);
        if (item.synonyms) {
            const synonymsList = item.synonyms.split(',').map(cleanWord);
            if (synonymsList.length > 0) {
                const correctSynonym = synonymsList[0];
                const distractors = getDistractors(correctSynonym, allWords);
                const options = shuffleArray([correctSynonym, ...distractors]);
                precomputed.push({
                    id: `SYNO-${index}`, chapter: 'English', type: 'Synonyms',
                    question: `What is a synonym for "${word}"?`,
                    options: { A: options[0], B: options[1], C: options[2], D: options[3] },
                    correct_option: ['A','B','C','D'][options.indexOf(correctSynonym)],
                    answer: correctSynonym, explanation: `Hindi: ${item.hindi}`
                });
            }
        }
        if (item.antonyms && item.antonyms.trim() !== '') {
            const antonymsList = item.antonyms.split(',').map(cleanWord);
            if (antonymsList.length > 0) {
                const correctAntonym = antonymsList[0];
                const distractors = getDistractors(correctAntonym, allWords);
                const options = shuffleArray([correctAntonym, ...distractors]);
                precomputed.push({
                    id: `ANTO-${index}`, chapter: 'English', type: 'Antonyms',
                    question: `What is an antonym for "${word}"?`,
                    options: { A: options[0], B: options[1], C: options[2], D: options[3] },
                    correct_option: ['A','B','C','D'][options.indexOf(correctAntonym)],
                    answer: correctAntonym, explanation: `Hindi: ${item.hindi}`
                });
            }
        }
    });
    writePublicJSON('synoAnto.json', precomputed);
    console.log(`✓ synoAnto: ${precomputed.length} questions pre-computed`);
}

// --- TIMER CONFIG (moved to /public/config) ---
const timerConfig = {
    maths: {
        baseTime: 60,
        penaltyTiers: [
            { maxAttempts: 0, time: 60 },
            { maxAttempts: 1, time: 45 },
            { maxAttempts: Infinity, time: 30 }
        ]
    },
    english: { time: 30 },
    gkgs: { time: 30 }
};
writeConfigJSON('timerConfig.json', timerConfig);

// --- METADATA ---
writePublicJSON('metadata.json', metadata);
console.log('\n✓ metadata.json written');

// --- INTEGRITY VALIDATION ---
console.log('\n=== Integrity Validation ===');
let valid = true;

// Validate math chapters match metadata
['math1', 'math2'].forEach(name => {
    const data = readPublic(`${name}.json`);
    if (!data) return;
    const actualChapters = new Set(data.map(q => q.chapter));
    const metaChapters = new Set(metadata[name].chapters.filter(c => c !== 'All'));
    const missing = [...actualChapters].filter(c => !metaChapters.has(c));
    if (missing.length > 0) {
        console.warn(`⚠ MISMATCH: ${name} data has chapters not in metadata: ${missing.join(', ')}`);
        valid = false; warnings++;
    }
});

// Validate staticGk topic slugs exist on disk
const gkTopicFiles = fs.readdirSync(GK_TOPICS_DIR);
const expectedGkSlugs = Object.values(metadata.staticGk.topicSlugs).map(s => `${s}.json`);
const missingGkFiles = expectedGkSlugs.filter(f => !gkTopicFiles.includes(f));
if (missingGkFiles.length > 0) {
    console.warn(`⚠ MISMATCH: Missing GK topic files: ${missingGkFiles.join(', ')}`);
    valid = false; warnings++;
}

// Validate history category files exist on disk
const histCatFiles = fs.readdirSync(HISTORY_CAT_DIR);
if (historyData) {
    const expectedCats = [...new Set(historyData.map(t => t.category))].map(c => `${toSlug(c)}.json`);
    const missingCats = expectedCats.filter(f => !histCatFiles.includes(f));
    if (missingCats.length > 0) {
        console.warn(`⚠ MISMATCH: Missing history category files: ${missingCats.join(', ')}`);
        valid = false; warnings++;
    }
}

if (valid) {
    console.log('✓ All integrity checks passed!');
} else {
    console.warn(`\n⚠ Build completed with ${warnings} warnings. Review above before deploying.`);
}

console.log('\n=== Build pipeline complete! ===');
