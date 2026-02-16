import { create } from 'zustand';
import questionsData from '../data/questions.json';

// Helper to shuffle array (Fisher-Yates)
const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

// Extract unique chapters and types for filters
const allChapters = ['All', ...new Set(questionsData.map(q => q.chapter))];
const allTypes = ['All', ...new Set(questionsData.map(q => q.type))];

export const useQuiz = create((set, get) => ({
    // Data
    questions: questionsData,
    filteredQuestions: [],
    chapters: allChapters,
    types: allTypes,

    // Settings
    filters: { chapter: 'All', type: 'All' },

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
    setFilter: (key, value) => set((state) => ({
        filters: { ...state.filters, [key]: value },
        // Reset type if chapter changes to avoid invalid combinations
        ...(key === 'chapter' ? { filters: { ...state.filters, chapter: value, type: 'All' } } : {})
    })),

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
        if (!user) return; // Should not happen if enforced

        const newHistory = [result, ...history];
        set({ history: newHistory });
        localStorage.setItem(`quiz_history_${user}`, JSON.stringify(newHistory));
    },

    startQuiz: () => {
        const { questions, filters, questionCount, timerMode } = get();

        // 1. Filter Questions
        let filtered = questions.filter(q => {
            const chapterMatch = filters.chapter === 'All' || q.chapter === filters.chapter;
            const typeMatch = filters.type === 'All' || q.type === filters.type;
            return chapterMatch && typeMatch;
        });

        // 2. Logic for Attempts & Adaptive Time
        const attemptKey = `attempt-${filters.chapter}-${filters.type}`;
        const previousAttempts = parseInt(localStorage.getItem(attemptKey) || '0', 10);

        let timePerQ = 60; // Default 1st try
        if (previousAttempts === 1) timePerQ = 45; // 2nd try
        if (previousAttempts >= 2) timePerQ = 30; // 3rd+ try

        // 3. Handle Question Count Limit
        if (questionCount !== 'all') {
            filtered = shuffleArray(filtered).slice(0, typeof questionCount === 'string' ? filtered.length : questionCount);
        } else {
            // Optional: shuffle even for 'all' to keep it fresh?
            // filtered = shuffleArray(filtered);
        }

        // 4. Calculate Total Time (if Overall mode)
        const calculatedTotalTime = filtered.length * timePerQ;

        set({
            filteredQuestions: filtered,
            quizStatus: 'running',
            currentQuestionIndex: 0,
            answers: {},
            score: 0,
            timePerQuestion: timePerQ,
            totalTime: calculatedTotalTime
        });

        // Check for revision screen requirement (Chapter 1: Percentage)
        if (filters.chapter === 'Percentage') {
            set({ quizStatus: 'revision' });
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
        const accuracy = totalQ > 0 ? Math.round((correctCount / totalQ) * 100) : 0; // Usage based accuracy? Or Attempted? Usually Total.

        // Increment attempt counter locally for adaptive time
        const attemptKey = `attempt-${filters.chapter}-${filters.type}`;
        const currentAttempts = parseInt(localStorage.getItem(attemptKey) || '0', 10);
        localStorage.setItem(attemptKey, (currentAttempts + 1).toString());

        // Save to User History
        saveResult({
            date: new Date().toISOString(),
            chapter: filters.chapter,
            type: filters.type,
            score,
            totalQuestions: totalQ,
            accuracy,
            correct: correctCount,
            wrong: answeredCount - correctCount, // Approximation if we don't count skipped as wrong explicitly here
        });

        set({ quizStatus: 'completed' });
    },

    resetQuiz: () => set({
        quizStatus: 'idle',
        currentQuestionIndex: 0,
        answers: {},
        score: 0,
        // Keep filters and settings for UX
    })
}));
