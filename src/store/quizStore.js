import { create } from 'zustand';

// Helper to shuffle array (Fisher-Yates)
const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

export const useQuiz = create((set, get) => ({
    // App Initialization State
    isAppReady: false,
    quizLoading: false,
    metadata: null,
    timerConfig: null,

    // Data
    filteredQuestions: [],
    currentNotes: null,

    // Static mappings based on original logic
    englishTopics: ['Idioms', 'One Word Substitution', 'Synonyms', 'Antonyms'],
    gkgsSubjects: ['Static GK', 'Polity', 'History', 'Geography', 'Economics', 'Physics', 'Chemistry', 'Biology', 'Current Affairs'],

    // Settings
    filters: {
        subject: 'Maths', // 'Maths' | 'English' | 'GK/GS'
        mathsVersion: 'Maths 2', // 'Maths 1' | 'Maths 2'
        chapter: 'All',   // For Maths
        type: 'All',      // For Maths
        gkgsSubject: 'Static GK', // Default GK/GS Subject
        gkgsTopics: [],    // Array of selected topics for GK/GS
        historyCategory: 'Ancient',
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

    // UI State
    appLanguage: 'English', // 'English' | 'Hindi'
    zoomLevel: 100, // percentage baseline

    // Quiz State
    quizStatus: 'idle', // 'idle' | 'running' | 'completed' | 'revision'
    currentQuestionIndex: 0,
    answers: {}, // { questionId: selectedOption }
    score: 0,

    // --- Actions ---

    initApp: async () => {
        try {
            const [metaRes, timerRes] = await Promise.all([
                fetch('/data/metadata.json'),
                fetch('/config/timerConfig.json')
            ]);
            const metadata = await metaRes.json();
            const timerConfig = await timerRes.json();
            set({ metadata, timerConfig, isAppReady: true });
        } catch (error) {
            console.error("Failed to initialize app metadata:", error);
            set({ isAppReady: true }); // Still proceed even if config fails
        }
    },

    setAppLanguage: (lang) => set({ appLanguage: lang }),
    increaseZoom: () => set(state => ({ zoomLevel: Math.min(state.zoomLevel + 10, 200) })),
    decreaseZoom: () => set(state => ({ zoomLevel: Math.max(state.zoomLevel - 10, 80) })),

    setFilter: (key, value) => set((state) => {
        const newFilters = { ...state.filters, [key]: value };

        // Reset dependent filters
        if (key === 'subject') {
            newFilters.chapter = 'All';
            newFilters.type = 'All';
            if (value === 'Maths') {
                newFilters.mathsVersion = 'Maths 2'; // Default
            } else if (value === 'GK/GS') {
                newFilters.gkgsSubject = 'Static GK';
                newFilters.gkgsTopics = [];
            } else if (value === 'English') {
                newFilters.topic = 'Idioms';
            }
        }
        if (key === 'mathsVersion') {
            newFilters.chapter = 'All';
            newFilters.type = 'All';
        }
        if (key === 'chapter') {
            newFilters.type = 'All';
        }
        if (key === 'gkgsSubject') {
            newFilters.gkgsTopics = [];
            if (value === 'History') {
                newFilters.historyCategory = 'Ancient';
            }
        }
        if (key === 'historyCategory') {
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

    startQuiz: async () => {
        const { filters, questionCount, timerMode, timerConfig } = get();
        set({ quizLoading: true });

        try {
            let filtered = [];
            let timePerQ = timerConfig?.default || 30;
            let attemptKey = '';
            let notesData = null;

            if (filters.subject === 'Maths') {
                const targetFile = filters.mathsVersion === 'Maths 1' ? 'math1.json' : 'math2.json';
                const notesFile = filters.mathsVersion === 'Maths 1' ? 'math1Notes.json' : 'math2Notes.json';
                
                const [dataRes, notesRes] = await Promise.all([
                    fetch(`/data/${targetFile}`),
                    fetch(`/data/${notesFile}`).catch(() => null)
                ]);

                if (!dataRes.ok) throw new Error("Failed to load Math data");
                const sourceData = await dataRes.json();
                try { if(notesRes && notesRes.ok) notesData = await notesRes.json(); } catch(e) {}

                filtered = sourceData.filter(q => {
                    const chapterMatch = filters.chapter === 'All' || q.chapter === filters.chapter;
                    const typeMatch = filters.type === 'All' || q.type === filters.type;
                    return chapterMatch && typeMatch;
                });

                attemptKey = `attempt-${filters.mathsVersion}-${filters.chapter}-${filters.type}`;
                const previousAttempts = parseInt(localStorage.getItem(attemptKey) || '0', 10);

                // Math dynamic timer from config
                const mathTiers = timerConfig?.maths?.penaltyTiers || [];
                for(const tier of mathTiers) {
                   if(previousAttempts <= tier.maxAttempts) {
                       timePerQ = tier.time;
                       break;
                   }
                }

            } else if (filters.subject === 'English') {
                let targetFile = '';
                if (filters.topic === 'Idioms') targetFile = 'idioms.json';
                else if (filters.topic === 'One Word Substitution') targetFile = 'oneWordSubs.json';
                else if (filters.topic === 'Synonyms' || filters.topic === 'Antonyms') targetFile = 'synoAnto.json';

                const res = await fetch(`/data/${targetFile}`);
                if (!res.ok) throw new Error("Failed to load English data");
                let sourceData = await res.json();

                if (filters.topic === 'Synonyms' || filters.topic === 'Antonyms') {
                    sourceData = sourceData.filter(q => filters.topic === 'Synonyms' ? q.type === 'Synonyms' : q.type === 'Antonyms');
                }
                
                filtered = sourceData;
                timePerQ = 30; // Fixed for english
                attemptKey = `attempt-English-${filters.topic}`;

            } else if (filters.subject === 'GK/GS') {
                // Guard: skip notes fetch for math notes (known empty)
                let selectedTopicsData = [];

                if (filters.gkgsSubject === 'Static GK') {
                    // Load only selected topics from per-topic files
                    const { metadata } = get();
                    const topicSlugs = metadata?.staticGk?.topicSlugs || {};
                    const topicsToLoad = (filters.gkgsTopics.length === 0 || filters.gkgsTopics.includes('All'))
                        ? metadata?.staticGk?.topics || []
                        : filters.gkgsTopics;

                    const fetchPromises = topicsToLoad.map(topic => {
                        const slug = topicSlugs[topic];
                        if (!slug) return Promise.resolve(null);
                        return fetch(`/data/gk-topics/${slug}.json`).then(r => r.ok ? r.json() : null).catch(() => null);
                    });
                    const results = await Promise.all(fetchPromises);
                    selectedTopicsData = results.filter(Boolean);

                } else if (filters.gkgsSubject === 'History') {
                    // Load only the selected category file
                    const { metadata } = get();
                    const categorySlug = filters.historyCategory.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').toLowerCase();
                    const res = await fetch(`/data/history-categories/${categorySlug}.json`);
                    if (!res.ok) throw new Error('Failed to load History category');
                    let categoryData = await res.json();

                    if (filters.gkgsTopics.length > 0 && !filters.gkgsTopics.includes('All')) {
                        categoryData = categoryData.filter(t => filters.gkgsTopics.includes(t.topic));
                    }
                    selectedTopicsData = categoryData;

                } else {
                    // Regular subject (Polity, Geography etc.)
                    const map = {
                        'Polity': 'polity', 'Geography': 'geography', 'Economics': 'economics',
                        'Physics': 'physics', 'Chemistry': 'chemistry', 'Biology': 'biology', 'Current Affairs': 'currentAffairs'
                    };
                    const prefix = map[filters.gkgsSubject];
                    const dataRes = await fetch(`/data/${prefix}.json`);
                    if (!dataRes.ok) throw new Error(`Failed to load ${filters.gkgsSubject} data`);
                    let sourceData = await dataRes.json();

                    if (filters.gkgsTopics.length > 0 && !filters.gkgsTopics.includes('All')) {
                        selectedTopicsData = sourceData.filter(p => filters.gkgsTopics.includes(p.topic));
                    } else {
                        selectedTopicsData = sourceData;
                    }

                    // Try to load subject notes (only for subjects that have them)
                    const notesRes = await fetch(`/data/${prefix}Notes.json`).catch(() => null);
                    if (notesRes && notesRes.ok) {
                        try { notesData = await notesRes.json(); } catch(e) {}
                    }
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
                            id: q.id !== undefined ? q.id : `gkgs-${topicIndex}-${qIndex}-${globalIndex++}`,
                            chapter: 'GK/GS',
                            type: topicObj.topic,
                            correct_option: mappedOption,
                            options: optionsObj
                        };
                    });
                    filtered = [...filtered, ...mappedQuestions];
                });

                timePerQ = 30;
                attemptKey = `attempt-GKGS-${filters.gkgsSubject}`;
            }

            // Slice limit & Shuffle
            if (questionCount !== 'all') {
                filtered = shuffleArray(filtered).slice(0, parseInt(questionCount, 10));
            } else if (filters.subject === 'English' || filters.subject === 'GK/GS') {
                filtered = shuffleArray(filtered);
            }

            const calculatedTotalTime = filtered.length * timePerQ;

            // Check if revision screen is needed based on notes network response
            let nextStatus = 'running';
            if (filters.subject === 'Maths') {
                 const hasNotes = notesData?.some(n => n.topic === filters.chapter || n.chapter === filters.chapter);
                 if (hasNotes || filters.chapter === 'Percentage') nextStatus = 'revision';
            } else if (filters.subject === 'GK/GS') {
                 nextStatus = 'revision';
            }

            set({
                filteredQuestions: filtered,
                currentNotes: notesData,
                quizStatus: nextStatus,
                currentQuestionIndex: 0,
                answers: {},
                score: 0,
                timePerQuestion: timePerQ,
                totalTime: calculatedTotalTime,
                timerMode: (filters.subject === 'English' || filters.subject === 'GK/GS') ? 'question' : timerMode,
                quizLoading: false
            });

        } catch (error) {
            console.error("Quiz Start Error:", error);
            set({ quizLoading: false });
            alert("Failed to load test data. Please check your network.");
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

        const totalQ = filteredQuestions.length;
        const answeredCount = Object.keys(answers).length;
        const correctCount = filteredQuestions.filter(q => answers[q.id] === q.correct_option).length;
        const accuracy = totalQ > 0 ? Math.round((correctCount / totalQ) * 100) : 0;

        let attemptKey = '';
        if (filters.subject === 'Maths') {
            attemptKey = `attempt-${filters.mathsVersion}-${filters.chapter}-${filters.type}`;
        } else if (filters.subject === 'English') {
            attemptKey = `attempt-English-${filters.topic}`;
        } else if (filters.subject === 'GK/GS') {
            attemptKey = `attempt-GKGS-${filters.gkgsSubject}`;
        }

        const currentAttempts = parseInt(localStorage.getItem(attemptKey) || '0', 10);
        localStorage.setItem(attemptKey, (currentAttempts + 1).toString());

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
        currentNotes: null
    })
}));
