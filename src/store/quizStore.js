import { create } from 'zustand';
import idiomsData from '../data/idioms.json';
import oneWordData from '../data/oneWordSubs.json';
import synoAntoData from '../data/synoAnto.json';
import polityData from '../data/polity.json';
import polityNotesData from '../data/polityNotes.json';
import staticGkData from '../data/staticGk.json';
import staticGkNotesData from '../data/staticGkNotes.json';

// Helper to shuffle array (Fisher-Yates)
const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

// Helper to clean word from Hindi meaning (e.g., "Desert (छोड़ देना)" -> "Desert")
const cleanWord = (text) => {
    if (!text) return '';
    return text.split('(')[0].trim();
};

// Helper to generate distractors
const getDistractors = (correctAnswer, allPossibleAnswers, count = 3) => {
    const distractors = [];
    const available = allPossibleAnswers.filter(a => a !== correctAnswer);

    while (distractors.length < count && available.length > 0) {
        const randomIndex = Math.floor(Math.random() * available.length);
        const randomDistractor = available[randomIndex];
        if (!distractors.includes(randomDistractor)) {
            distractors.push(randomDistractor);
        }
    }
    return distractors;
};

// Generators for English Questions
const generateIdiomQuestions = () => {
    const allMeanings = idiomsData.map(item => item.meaning);
    return idiomsData.map((item, index) => {
        const distractors = getDistractors(item.meaning, allMeanings);
        const options = shuffleArray([item.meaning, ...distractors]);
        const correctOptionIndex = options.indexOf(item.meaning);
        const optionKeys = ['A', 'B', 'C', 'D'];

        return {
            id: `IDIOM-${index}`,
            chapter: 'English',
            type: 'Idioms',
            question: `What is the meaning of the idiom: "${item.idiom}"?`,
            options: {
                A: options[0],
                B: options[1],
                C: options[2],
                D: options[3]
            },
            correct_option: optionKeys[correctOptionIndex],
            answer: item.meaning,
            explanation: `Hindi Meaning: ${item.hindi}`
        };
    });
};

const generateOneWordQuestions = () => {
    const allWords = oneWordData.map(item => cleanWord(item.one_word));
    return oneWordData.map((item, index) => {
        const correctWord = cleanWord(item.one_word);
        const distractors = getDistractors(correctWord, allWords);
        const options = shuffleArray([correctWord, ...distractors]);
        const correctOptionIndex = options.indexOf(correctWord);
        const optionKeys = ['A', 'B', 'C', 'D'];

        return {
            id: `OWS-${index}`,
            chapter: 'English',
            type: 'One Word Substitution',
            question: `Substitute one word for: "${item.phrases}"`,
            options: {
                A: options[0],
                B: options[1],
                C: options[2],
                D: options[3]
            },
            correct_option: optionKeys[correctOptionIndex],
            answer: correctWord,
            explanation: `Hindi: ${item.hindi}`
        };
    });
};

const generateSynoAntoQuestions = () => {
    const questions = [];
    const allWords = [];

    // Collect all unique words for distractors
    synoAntoData.forEach(item => {
        if (item.synonyms) item.synonyms.split(',').forEach(w => allWords.push(cleanWord(w)));
        if (item.antonyms) item.antonyms.split(',').forEach(w => allWords.push(cleanWord(w)));
    });

    synoAntoData.forEach((item, index) => {
        const word = cleanWord(item.word);

        // 1. Synonym Question (if available)
        if (item.synonyms) {
            const synonymsList = item.synonyms.split(',').map(cleanWord);
            if (synonymsList.length > 0) {
                const correctSynonym = synonymsList[0]; // Take first for simplicity, or random
                const distractors = getDistractors(correctSynonym, allWords);
                const options = shuffleArray([correctSynonym, ...distractors]);
                const correctOptionIndex = options.indexOf(correctSynonym);
                const optionKeys = ['A', 'B', 'C', 'D'];

                questions.push({
                    id: `SYNO-${index}`,
                    chapter: 'English',
                    type: 'Synonyms',
                    question: `What is a synonym for "${word}"?`,
                    options: { A: options[0], B: options[1], C: options[2], D: options[3] },
                    correct_option: optionKeys[correctOptionIndex],
                    answer: correctSynonym,
                    explanation: `Hindi: ${item.hindi}`
                });
            }
        }

        // 2. Antonym Question (if available)
        if (item.antonyms && item.antonyms.trim() !== '') {
            const antonymsList = item.antonyms.split(',').map(cleanWord);
            if (antonymsList.length > 0) {
                const correctAntonym = antonymsList[0];
                const distractors = getDistractors(correctAntonym, allWords);
                const options = shuffleArray([correctAntonym, ...distractors]);
                const correctOptionIndex = options.indexOf(correctAntonym);
                const optionKeys = ['A', 'B', 'C', 'D'];

                questions.push({
                    id: `ANTO-${index}`,
                    chapter: 'English',
                    type: 'Antonyms',
                    question: `What is an antonym for "${word}"?`,
                    options: { A: options[0], B: options[1], C: options[2], D: options[3] },
                    correct_option: optionKeys[correctOptionIndex],
                    answer: correctAntonym,
                    explanation: `Hindi: ${item.hindi}`
                });
            }
        }
    });

    return questions;
};


// Extract unique chapters and types for Maths filters
const mathsChapters = ['All'];
const mathsTypes = ['All'];

export const useQuiz = create((set, get) => ({
    // Data
    questions: [],
    filteredQuestions: [],

    // Filter Options
    mathsChapters: mathsChapters,
    mathsTypes: mathsTypes,
    englishTopics: ['Idioms', 'One Word Substitution', 'Synonyms', 'Antonyms'], // Broken out Syno/Anto for clarity
    gkgsSubjects: ['Static GK', 'Polity'],
    polityTopics: polityData.map(p => p.topic),
    staticGkTopics: staticGkData.map(p => p.topic),

    // Notes mapping
    polityNotes: polityNotesData,
    staticGkNotes: staticGkNotesData,

    // Settings
    filters: {
        subject: 'Maths', // 'Maths' | 'English' | 'GK/GS'
        chapter: 'All',   // For Maths
        type: 'All',      // For Maths
        gkgsSubject: 'Static GK', // Default GK/GS Subject
        gkgsTopics: [],    // Array of selected topics for GK/GS
        topic: 'Idioms'   // For English
    },

    // New V2 Settings
    timerMode: 'question', // 'question' | 'overall'
    questionCount: 'all', // 10 | 20 | 30 | 'all'
    timePerQuestion: 60, // Calculated based on attempts
    totalTime: 0, // For overall mode

    // User State
    user: null, // username
    history: [], // Array of past results
    currentView: 'dashboard', // 'dashboard' | 'start'

    // Quiz State
    quizStatus: 'idle', // 'idle' | 'running' | 'completed'
    currentQuestionIndex: 0,
    answers: {}, // { questionId: selectedOption }
    score: 0,

    // Actions
    setFilter: (key, value) => set((state) => {
        const newFilters = { ...state.filters, [key]: value };

        // Reset dependent filters
        if (key === 'subject') {
            newFilters.chapter = 'All';
            newFilters.type = 'All';
            if (value === 'GK/GS') {
                newFilters.gkgsSubject = 'Static GK';
                newFilters.gkgsTopics = []; // Default: Select none (or handle 'All' in UI)
            } else {
                newFilters.topic = 'Idioms'; // Default topic for English
            }
        }
        if (key === 'chapter') {
            newFilters.type = 'All';
        }
        if (key === 'gkgsSubject') {
            newFilters.gkgsTopics = [];
        }

        return { filters: newFilters };
    }),

    setTimerMode: (mode) => set({ timerMode: mode }),
    setQuestionCount: (count) => set({ questionCount: count }),
    setCurrentView: (view) => set({ currentView: view }),

    // User Actions
    login: (username) => {
        const history = JSON.parse(localStorage.getItem(`quiz_history_${username}`) || '[]');
        set({ user: username, history, currentView: 'dashboard' });
    },

    logout: () => set({ user: null, history: [], quizStatus: 'idle', currentView: 'dashboard' }),

    saveResult: (result) => {
        const { user, history } = get();
        if (!user) return;

        const newHistory = [result, ...history];
        set({ history: newHistory });
        localStorage.setItem(`quiz_history_${user}`, JSON.stringify(newHistory));
    },

    startQuiz: () => {
        const { questions, filters, questionCount, timerMode } = get();
        let filtered = [];
        let timePerQ = 60;
        let attemptKey = '';

        if (filters.subject === 'Maths') {
            // MATHS LOGIC
            filtered = questions.filter(q => {
                const chapterMatch = filters.chapter === 'All' || q.chapter === filters.chapter;
                const typeMatch = filters.type === 'All' || q.type === filters.type;
                return chapterMatch && typeMatch;
            });

            attemptKey = `attempt-${filters.chapter}-${filters.type}`;
            const previousAttempts = parseInt(localStorage.getItem(attemptKey) || '0', 10);

            // Adaptive time for Maths
            if (previousAttempts === 1) timePerQ = 45;
            if (previousAttempts >= 2) timePerQ = 30;

        } else if (filters.subject === 'English') {
            // ENGLISH LOGIC
            if (filters.topic === 'Idioms') {
                filtered = generateIdiomQuestions();
            } else if (filters.topic === 'One Word Substitution') {
                filtered = generateOneWordQuestions();
            } else if (filters.topic === 'Synonyms' || filters.topic === 'Antonyms') {
                // For now, let's mix them or filter if we want specific
                const allSynoAnto = generateSynoAntoQuestions();
                filtered = allSynoAnto.filter(q => filters.topic === 'Synonyms' ? q.type === 'Synonyms' : q.type === 'Antonyms');
            }

            // Fixed time for English
            timePerQ = 30;
            attemptKey = `attempt-English-${filters.topic}`; // Just for tracking, not adaptive time yet
        } else if (filters.subject === 'GK/GS') {
            // GK/GS LOGIC
            let selectedTopicsData = [];
            let sourceData = filters.gkgsSubject === 'Polity' ? polityData : staticGkData;

            if (!filters.gkgsTopics || filters.gkgsTopics.length === 0 || filters.gkgsTopics.includes('All')) {
                selectedTopicsData = sourceData;
            } else {
                selectedTopicsData = sourceData.filter(p => filters.gkgsTopics.includes(p.topic));
            }

            let globalIndex = 0;
            selectedTopicsData.forEach((topicObj, topicIndex) => {
                const mappedQuestions = topicObj.questions.map((q, qIndex) => {
                    const mappedOption = q.answer.toUpperCase();

                    const optionsObj = Array.isArray(q.options)
                        ? { A: q.options[0], B: q.options[1], C: q.options[2], D: q.options[3] }
                        : { A: q.options.a, B: q.options.b, C: q.options.c, D: q.options.d };

                    return {
                        ...q,
                        question: `Q.${q.id}. ${q.question}`,
                        // Fix for missing question IDs applying selected option to all
                        id: q.id !== undefined ? q.id : `gkgs-${topicIndex}-${qIndex}-${globalIndex++}`,
                        chapter: 'GK/GS',
                        type: topicObj.topic,
                        correct_option: mappedOption,
                        options: optionsObj
                    };
                });
                filtered = [...filtered, ...mappedQuestions];
            });

            // Fixed time for GK/GS
            timePerQ = 30;
            attemptKey = `attempt-GKGS-${filters.gkgsSubject}`;
        }

        // 3. Handle Question Count Limit
        if (questionCount !== 'all') {
            filtered = shuffleArray(filtered).slice(0, typeof questionCount === 'string' ? filtered.length : questionCount);
        } else {
            // Always shuffle for English and GK/GS since it's generated from a list
            if (filters.subject === 'English' || filters.subject === 'GK/GS') {
                filtered = shuffleArray(filtered);
            }
        }

        // 4. Calculate Total Time (if Overall mode)
        const calculatedTotalTime = filtered.length * timePerQ;

        set({
            filteredQuestions: filtered,
            quizStatus: 'running',
            currentQuestionIndex: 0,
            answers: {},
            score: 0,
            timePerQuestion: timePerQ, // Will be ignored if timerMode is 'overall' but good to have
            totalTime: calculatedTotalTime,
            // Force question timer for English and GK/GS if requested? Plan said "Enforce 30s timer per question"
            timerMode: (filters.subject === 'English' || filters.subject === 'GK/GS') ? 'question' : timerMode
        });

        // Check for revision screen requirement
        if (filters.subject === 'Maths' && filters.chapter === 'Percentage') {
            set({ quizStatus: 'revision' });
        } else if (filters.subject === 'GK/GS') {
            set({ quizStatus: 'revision' }); // Always show revision for GK/GS topics
        }
    },

    startRealQuiz: () => {
        set({ quizStatus: 'running' });
    },

    submitAnswer: (questionId, selectedOption) => {
        const state = get();
        const question = state.filteredQuestions.find(q => q.id === questionId);
        if (!question) return;

        const isCorrect = question.correct_option === selectedOption;
        const points = isCorrect ? 2 : -0.5;

        set((state) => ({
            answers: { ...state.answers, [questionId]: selectedOption },
            score: state.score + points
        }));
    },

    nextQuestion: () => {
        const state = get();
        if (state.currentQuestionIndex < state.filteredQuestions.length - 1) {
            set({ currentQuestionIndex: state.currentQuestionIndex + 1 });
        } else {
            get().finishQuiz();
        }
    },

    goToQuestion: (index) => {
        set({ currentQuestionIndex: index });
    },

    finishQuiz: () => {
        const { filters, score, filteredQuestions, answers, saveResult } = get();

        // Calculate Stats
        const totalQ = filteredQuestions.length;
        const answeredCount = Object.keys(answers).length;
        const correctCount = filteredQuestions.filter(q => answers[q.id] === q.correct_option).length;
        const accuracy = totalQ > 0 ? Math.round((correctCount / totalQ) * 100) : 0;

        // Increment attempt counter
        let attemptKey = '';
        if (filters.subject === 'Maths') {
            attemptKey = `attempt-${filters.chapter}-${filters.type}`;
        } else if (filters.subject === 'English') {
            attemptKey = `attempt-English-${filters.topic}`;
        } else if (filters.subject === 'GK/GS') {
            attemptKey = `attempt-GKGS-${filters.gkgsSubject}`;
        }

        const currentAttempts = parseInt(localStorage.getItem(attemptKey) || '0', 10);
        localStorage.setItem(attemptKey, (currentAttempts + 1).toString());

        // Save to User History
        saveResult({
            date: new Date().toISOString(),
            subject: filters.subject,
            chapter: filters.subject === 'Maths' ? filters.chapter : (filters.subject === 'GK/GS' ? filters.gkgsSubject : filters.topic),
            type: filters.subject === 'Maths' ? filters.type : (filters.subject === 'GK/GS' ? filters.gkgsTopics.join(', ') || 'All' : 'N/A'),
            score,
            totalQuestions: totalQ,
            accuracy,
            correct: correctCount,
            wrong: answeredCount - correctCount,
        });

        set({ quizStatus: 'completed' });
    },

    resetQuiz: () => set({
        quizStatus: 'idle',
        currentQuestionIndex: 0,
        answers: {},
        score: 0,
    })
}));

