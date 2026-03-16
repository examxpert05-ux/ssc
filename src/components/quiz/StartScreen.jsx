import React from 'react';
import { useQuiz } from '../../store/quizStore';
import { motion } from 'framer-motion';
import { Play, Clock, BookOpen, Filter, Settings, RotateCcw, ArrowLeft, BrainCircuit, SlidersHorizontal, Hash } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function StartScreen() {
    const {
        filters, setFilter,
        timerMode, setTimerMode,
        questionCount, setQuestionCount,
        startQuiz, setCurrentView,
        math1Data, math2Data,
        math1Chapters, math1Types,
        math2Chapters, math2Types,
        englishTopics, gkgsSubjects,
        polityTopics, staticGkTopics,
        geographyTopics, economicsTopics,
        physicsTopics, chemistryTopics,
        biologyTopics, currentAffairsTopics,
        historyCategories, historyData,
    } = useQuiz();

    const isMaths = filters.subject === 'Maths';
    const isEnglish = filters.subject === 'English';
    const isGkGs = filters.subject === 'GK/GS';

    const currentMathsData = filters.mathsVersion === 'Maths 1' ? math1Data : math2Data;
    const currentMathsChapters = filters.mathsVersion === 'Maths 1' ? math1Chapters : math2Chapters;

    const availableTypes = ['All', ...new Set(
        currentMathsData.filter(q => filters.chapter === 'All' || q.chapter === filters.chapter).map(q => q.type)
    )];

    const currentGkgsTopics = filters.gkgsSubject === 'History' && historyData
        ? [...new Set(historyData.filter(d => d.category === filters.historyCategory).map(d => d.topic))]
        : filters.gkgsSubject === 'Polity' ? polityTopics
        : filters.gkgsSubject === 'Geography' ? geographyTopics
        : filters.gkgsSubject === 'Economics' ? economicsTopics
        : filters.gkgsSubject === 'Physics' ? physicsTopics
        : filters.gkgsSubject === 'Chemistry' ? chemistryTopics
        : filters.gkgsSubject === 'Biology' ? biologyTopics
        : filters.gkgsSubject === 'Current Affairs' ? currentAffairsTopics
        : staticGkTopics;

    let attemptKey = isMaths
        ? `attempt-${filters.mathsVersion}-${filters.chapter}-${filters.type}`
        : `attempt-English-${filters.topic}`;
    const previousAttempts = parseInt(localStorage.getItem(attemptKey) || '0', 10);
    let timePerQ = isMaths ? (previousAttempts >= 2 ? 30 : previousAttempts === 1 ? 45 : 60) : 30;

    const getCount = () => {
        if (isMaths) {
            const n = currentMathsData.filter(q =>
                (filters.chapter === 'All' || q.chapter === filters.chapter) &&
                (filters.type === 'All' || q.type === filters.type)
            ).length;
            return questionCount === 'all' ? n : Math.min(n, questionCount);
        }
        return questionCount === 'all' ? 'All' : questionCount;
    };

    const handleStart = () => {
        const el = document.documentElement;
        if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
        startQuiz();
    };

    const SectionLabel = ({ icon: Icon, color, children }) => (
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-2">
            <Icon size={15} className={color} />
            {children}
        </div>
    );

    const TabBar = ({ options, value, onChange, getLabel }) => (
        <div className="flex bg-slate-800 rounded-xl p-1 gap-1">
            {options.map(opt => (
                <button
                    key={opt}
                    onClick={() => onChange(opt)}
                    className={cn(
                        "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
                        value === opt
                            ? "bg-slate-600 text-white shadow"
                            : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
                    )}
                >
                    {getLabel ? getLabel(opt) : opt}
                </button>
            ))}
        </div>
    );

    return (
        <div className="w-full max-w-2xl mx-auto pb-16 pt-4 relative">

            {/* Back to Dashboard */}
            <button
                onClick={() => setCurrentView('dashboard')}
                className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium mb-6 transition-colors group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                Back to Dashboard
            </button>

            {/* Title */}
            <div className="mb-6">
                <h1 className="text-3xl font-black text-white">Configure Test</h1>
                <p className="text-slate-400 mt-1 text-sm">Select your subject, topic, and timer settings.</p>
            </div>

            <div className="space-y-4">

                {/* Subject Selection */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900/70 border border-slate-700 rounded-2xl p-5"
                >
                    <SectionLabel icon={BrainCircuit} color="text-green-400">Subject</SectionLabel>
                    <TabBar
                        options={['Maths', 'English', 'GK/GS']}
                        value={filters.subject}
                        onChange={v => setFilter('subject', v)}
                    />
                </motion.div>

                {/* Maths Filters */}
                {isMaths && (
                    <motion.div
                        key="maths"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-900/70 border border-slate-700 rounded-2xl p-5 space-y-5"
                    >
                        <div>
                            <SectionLabel icon={BookOpen} color="text-blue-400">Version</SectionLabel>
                            <TabBar
                                options={['Maths 1', 'Maths 2']}
                                value={filters.mathsVersion}
                                onChange={v => setFilter('mathsVersion', v)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <SectionLabel icon={BookOpen} color="text-purple-400">Chapter</SectionLabel>
                                <select
                                    value={filters.chapter}
                                    onChange={e => setFilter('chapter', e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                                >
                                    {currentMathsChapters.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <SectionLabel icon={Filter} color="text-pink-400">Type</SectionLabel>
                                <select
                                    value={filters.type}
                                    onChange={e => setFilter('type', e.target.value)}
                                    disabled={filters.chapter === 'All'}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {availableTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                {filters.chapter === 'All' && <p className="text-xs text-slate-600 mt-1">Select a chapter first</p>}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* English Filters */}
                {isEnglish && (
                    <motion.div
                        key="english"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-900/70 border border-slate-700 rounded-2xl p-5"
                    >
                        <SectionLabel icon={BookOpen} color="text-blue-400">Topic</SectionLabel>
                        <div className="grid grid-cols-2 gap-2">
                            {englishTopics.map(t => (
                                <button
                                    key={t}
                                    onClick={() => setFilter('topic', t)}
                                    className={cn(
                                        "py-2.5 px-3 rounded-xl text-sm font-semibold border transition-all text-left",
                                        filters.topic === t
                                            ? "bg-blue-600/20 border-blue-500/50 text-blue-300"
                                            : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                                    )}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* GK/GS Filters */}
                {isGkGs && (
                    <motion.div
                        key="gkgs"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-900/70 border border-slate-700 rounded-2xl p-5 space-y-4"
                    >
                        <div>
                            <SectionLabel icon={BookOpen} color="text-blue-400">Subject</SectionLabel>
                            <div className="grid grid-cols-3 gap-2">
                                {gkgsSubjects.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setFilter('gkgsSubject', s)}
                                        className={cn(
                                            "py-2 px-2 rounded-xl text-xs font-semibold border transition-all",
                                            filters.gkgsSubject === s
                                                ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-300"
                                                : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                                        )}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {filters.gkgsSubject === 'History' && (
                            <div>
                                <SectionLabel icon={BookOpen} color="text-orange-400">Category</SectionLabel>
                                <TabBar
                                    options={historyCategories}
                                    value={filters.historyCategory}
                                    onChange={v => setFilter('historyCategory', v)}
                                />
                            </div>
                        )}

                        <div>
                            <SectionLabel icon={Filter} color="text-purple-400">Topics</SectionLabel>
                            <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 max-h-44 overflow-y-auto space-y-1 custom-scrollbar">
                                <label className="flex items-center gap-3 px-2 py-1.5 hover:bg-white/5 rounded-lg cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={!filters.gkgsTopics.length || filters.gkgsTopics.includes('All')}
                                        onChange={() => setFilter('gkgsTopics', ['All'])}
                                        className="w-4 h-4 accent-blue-500"
                                    />
                                    <span className="text-sm text-slate-200 font-semibold">All Topics</span>
                                </label>
                                {currentGkgsTopics.map(t => (
                                    <label key={t} className="flex items-center gap-3 px-2 py-1.5 hover:bg-white/5 rounded-lg cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={!filters.gkgsTopics.includes('All') && filters.gkgsTopics.includes(t)}
                                            onChange={e => {
                                                let next = filters.gkgsTopics.filter(x => x !== 'All');
                                                if (e.target.checked) next.push(t); else next = next.filter(x => x !== t);
                                                setFilter('gkgsTopics', next.length ? next : ['All']);
                                            }}
                                            className="w-4 h-4 accent-blue-500"
                                        />
                                        <span className="text-sm text-slate-300">{t}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Settings — Timer + Count */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900/70 border border-slate-700 rounded-2xl p-5 space-y-5"
                >
                    <div>
                        <SectionLabel icon={Clock} color="text-yellow-400">Timer Mode</SectionLabel>
                        <TabBar
                            options={['question', 'overall']}
                            value={isMaths ? timerMode : 'question'}
                            onChange={v => setTimerMode(v)}
                            getLabel={v => v === 'question' ? 'Per Question' : 'Overall Time'}
                        />
                        {!isMaths && <p className="text-xs text-slate-600 mt-1.5">Timer mode is fixed for English & GK/GS</p>}
                    </div>
                    <div>
                        <SectionLabel icon={Hash} color="text-cyan-400">Number of Questions</SectionLabel>
                        <div className="flex gap-2">
                            {[10, 20, 30, 'all'].map(c => (
                                <button
                                    key={c}
                                    onClick={() => setQuestionCount(c)}
                                    className={cn(
                                        "flex-1 py-2 text-sm font-bold rounded-xl border transition-all",
                                        questionCount === c
                                            ? "bg-purple-600/20 border-purple-500/50 text-purple-300"
                                            : "bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-200 hover:border-slate-500"
                                    )}
                                >
                                    {c === 'all' ? 'All' : c}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Info row */}
                <div className="flex items-center justify-between px-1 text-sm text-slate-500">
                    <div className="flex items-center gap-1.5">
                        <Clock size={14} /> {timePerQ}s per question
                        {previousAttempts > 0 && <span className="text-slate-600 ml-1">(Attempt #{previousAttempts + 1})</span>}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Hash size={14} /> {getCount()} questions
                    </div>
                </div>

                {/* Start Button */}
                <motion.button
                    onClick={handleStart}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:brightness-110 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-900/30 flex items-center justify-center gap-3 text-lg transition-all"
                >
                    <Play fill="currentColor" size={20} />
                    Start Test — {getCount()} Questions
                </motion.button>
            </div>
        </div>
    );
}
