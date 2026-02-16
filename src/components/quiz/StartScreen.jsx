import React from 'react';
import { useQuiz } from '../../store/quizStore';
import { motion } from 'framer-motion';
import { Play, Clock, BookOpen, Filter, Settings, History, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function StartScreen() {
    const {
        chapters,
        types, // Global types list - we need to derived filtered types
        questions,
        filters,
        setFilter,
        timerMode,
        setTimerMode,
        questionCount,
        setQuestionCount,
        startQuiz,
        setCurrentView
    } = useQuiz();

    // Derived state for Linked Filters
    const availableTypes = ['All', ...new Set(questions
        .filter(q => filters.chapter === 'All' || q.chapter === filters.chapter)
        .map(q => q.type)
    )];

    // Derived state for Attempt Info
    const attemptKey = `attempt-${filters.chapter}-${filters.type}`;
    const previousAttempts = parseInt(localStorage.getItem(attemptKey) || '0', 10);
    let timePerQ = 60;
    if (previousAttempts === 1) timePerQ = 45;
    if (previousAttempts >= 2) timePerQ = 30;

    const handleStart = () => {
        startQuiz();
    };

    const getQuestionCount = () => {
        const filteredCount = questions.filter(q =>
            (filters.chapter === 'All' || q.chapter === filters.chapter) &&
            (filters.type === 'All' || q.type === filters.type)
        ).length;

        if (questionCount === 'all') return filteredCount;
        return Math.min(filteredCount, questionCount);
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-8 relative">
            <button
                onClick={() => setCurrentView('dashboard')}
                className="absolute left-0 -top-16 lg:-left-20 lg:top-0 p-2 text-slate-400 hover:text-white transition-colors bg-white/5 rounded-full border border-white/5 hover:bg-white/10"
                title="Back to Dashboard"
            >
                <ArrowLeft size={24} />
            </button>

            <div className="text-center space-y-4">
                <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    Mastery Quiz
                </h1>
                <p className="text-slate-400 text-lg">
                    Adaptive Difficulty & Precision Testing
                </p>
            </div>

            <motion.div
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-8 shadow-2xl"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
            >
                {/* Filters Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                            <BookOpen size={16} className="text-blue-400" />
                            Chapter
                        </label>
                        <select
                            value={filters.chapter}
                            onChange={(e) => setFilter('chapter', e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        >
                            {chapters.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                            <Filter size={16} className="text-purple-400" />
                            Type
                        </label>
                        <select
                            value={filters.type}
                            onChange={(e) => setFilter('type', e.target.value)}
                            disabled={filters.chapter === 'All'}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <option value="All">All Types</option>
                            {availableTypes.filter(t => t !== 'All').map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                        {filters.chapter === 'All' && (
                            <p className="text-xs text-slate-500">Select a chapter first</p>
                        )}
                    </div>
                </div>

                {/* Info & Settings Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-900/40 rounded-2xl border border-white/5">
                    {/* Attempt Info */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                            <History size={16} className="text-orange-400" />
                            Attempt History
                        </div>
                        <div className="text-sm text-slate-400">
                            Attempt: <span className="text-white font-bold">#{previousAttempts + 1}</span>
                        </div>
                        <div className="text-sm text-slate-400">
                            Time per Question: <span className="text-green-400 font-bold">{timePerQ}s</span>
                        </div>
                    </div>

                    {/* Quiz Settings */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                            <Settings size={16} className="text-slate-400" />
                            Settings
                        </div>

                        {/* Timer Mode */}
                        <div className="flex bg-slate-800/50 rounded-lg p-1">
                            <button
                                onClick={() => setTimerMode('question')}
                                className={cn(
                                    "flex-1 py-1.5 text-xs font-medium rounded-md transition-all",
                                    timerMode === 'question' ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
                                )}
                            >
                                Per Question
                            </button>
                            <button
                                onClick={() => setTimerMode('overall')}
                                className={cn(
                                    "flex-1 py-1.5 text-xs font-medium rounded-md transition-all",
                                    timerMode === 'overall' ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
                                )}
                            >
                                Overall Time
                            </button>
                        </div>

                        {/* Question Count */}
                        {timerMode === 'overall' && (
                            <div className="flex gap-2">
                                {[10, 20, 30, 'all'].map(count => (
                                    <button
                                        key={count}
                                        onClick={() => setQuestionCount(count)}
                                        className={cn(
                                            "flex-1 py-1.5 text-xs font-medium rounded-md border transition-all",
                                            questionCount === count
                                                ? "bg-purple-600/20 border-purple-500/50 text-purple-300"
                                                : "bg-transparent border-slate-700 text-slate-500 hover:border-slate-500"
                                        )}
                                    >
                                        {count === 'all' ? 'All' : count}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Start Button */}
                <div className="pt-4">
                    <button
                        onClick={handleStart}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Play fill="currentColor" size={20} />
                        Start Quiz ({getQuestionCount()} Qs • {timerMode === 'overall' ? Math.floor((getQuestionCount() * timePerQ) / 60) + ' min' : timePerQ + 's/Q'})
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
