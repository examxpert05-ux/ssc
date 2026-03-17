import React, { useEffect, useState, useCallback } from 'react';
import { useQuiz } from '../../store/quizStore';
import Timer from './Timer';
import QuestionCard from './QuestionCard';
import {
    ChevronRight, ChevronLeft, CheckCircle, LayoutGrid,
    Pause, Play, AlertTriangle, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

export default function QuizScreen() {
    const {
        filteredQuestions,
        currentQuestionIndex,
        answers,
        submitAnswer,
        nextQuestion,
        goToQuestion,
        filters,
        timerMode,
        timePerQuestion,
        totalTime,
        finishQuiz,
        zoomLevel,
        increaseZoom,
        decreaseZoom
    } = useQuiz();

    const [isPaused, setIsPaused] = useState(false);
    const [showNav, setShowNav] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);

    const currentQuestion = filteredQuestions[currentQuestionIndex];
    const totalQuestions = filteredQuestions.length;
    const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
    const selectedOption = answers[currentQuestion?.id];
    const answeredCount = Object.keys(answers).length;

    // Timer config
    const timerKey = timerMode === 'question' ? currentQuestion?.id : 'overall-timer';
    const timerDuration = timerMode === 'question' ? timePerQuestion : totalTime;

    // --- Fullscreen helpers (used by pause/resume/finish) ---
    const enterFullscreen = useCallback(() => {
        const el = document.documentElement;
        if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    }, []);

    const exitFullscreen = useCallback(() => {
        if (document.fullscreenElement) {
            if (document.exitFullscreen) document.exitFullscreen();
            else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        }
    }, []);

    // Exit fullscreen on unmount (e.g. back navigation)
    useEffect(() => {
        return () => exitFullscreen();
    }, [exitFullscreen]);

    // --- Keyboard Shortcuts ---
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'p' || e.key === 'P') handlePauseToggle();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isPaused]);

    // --- Pause / Resume (also controls fullscreen) ---
    const handlePauseToggle = () => {
        if (!isPaused) {
            exitFullscreen();
            setIsPaused(true);
        } else {
            setIsPaused(false);
            enterFullscreen();
        }
    };

    // --- Handlers ---
    const handleOptionSelect = (opt) => {
        if (selectedOption || isPaused) return;
        submitAnswer(currentQuestion.id, opt);
    };

    const handleTimeOut = () => {
        if (isPaused) return;
        if (timerMode === 'question') {
            if (!selectedOption) nextQuestion();
        } else {
            finishQuiz();
        }
    };

    const handleFinish = () => {
        exitFullscreen();
        finishQuiz();
    };

    if (!currentQuestion) return null;

    // Subject label
    const subjectLabel = filters.subject === 'Maths'
        ? `${filters.mathsVersion} · ${filters.chapter === 'All' ? 'All Chapters' : filters.chapter}`
        : filters.subject === 'GK/GS'
            ? `GK/GS · ${filters.gkgsSubject}`
            : `English · ${filters.topic}`;

    return (
        <div className="fixed inset-0 bg-slate-950 flex flex-col overflow-hidden z-50">

            {/* ══════════════════════════════════════════
                TOP EXAM HEADER BAR
            ══════════════════════════════════════════ */}
            <header className="flex-none bg-slate-900 border-b border-slate-700 px-4 py-2 flex items-center gap-4 shadow-xl">
                {/* Left: Subject + Progress */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="hidden sm:flex flex-col">
                        <span className="text-xs text-slate-400 font-medium uppercase tracking-widest">SSC EXAM</span>
                        <span className="text-sm font-semibold text-slate-200 truncate">{subjectLabel}</span>
                    </div>
                    <div className="h-8 w-px bg-slate-700 hidden sm:block" />
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-500">Question</span>
                        <span className="text-base font-bold text-white tabular-nums">
                            {currentQuestionIndex + 1}
                            <span className="text-slate-500 font-normal text-sm"> / {totalQuestions}</span>
                        </span>
                    </div>
                </div>

                {/* Center: Timer */}
                <div className="flex-shrink-0 w-48 md:w-64">
                    <Timer
                        key={timerKey}
                        duration={timerDuration}
                        onTimeout={handleTimeOut}
                        isPaused={isPaused}
                    />
                </div>

                {/* Right: Controls */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Font Size Controls */}
                    <div className="hidden sm:flex items-center gap-1 bg-slate-800 rounded-lg p-0.5 border border-slate-700 mr-2 shadow-inner">
                        <button onClick={decreaseZoom} className="px-2.5 py-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors font-bold text-sm" title="Decrease Font Size">A-</button>
                        <span className="text-xs text-slate-500 w-9 text-center font-mono select-none">{zoomLevel}%</span>
                        <button onClick={increaseZoom} className="px-2.5 py-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors font-bold text-base leading-none" title="Increase Font Size">A+</button>
                    </div>

                    {/* Question Navigator toggle (mobile) */}
                    <button
                        onClick={() => setShowNav(v => !v)}
                        title="Question Navigator"
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-all lg:hidden"
                    >
                        <LayoutGrid size={18} />
                    </button>

                    {/* Pause */}
                    <button
                        onClick={handlePauseToggle}
                        title={isPaused ? 'Resume (P)' : 'Pause (P)'}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-2 rounded-lg border font-semibold text-sm transition-all",
                            isPaused
                                ? "bg-green-600 hover:bg-green-500 border-green-500 text-white"
                                : "bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500/40 text-yellow-400"
                        )}
                    >
                        {isPaused ? <Play size={15} fill="currentColor" /> : <Pause size={15} />}
                        <span className="hidden sm:inline">{isPaused ? 'Resume' : 'Pause'}</span>
                    </button>

                    {/* Submit */}
                    <button
                        onClick={() => setShowSubmitModal(true)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-500 border border-red-500 text-white font-semibold text-sm rounded-lg transition-all"
                    >
                        <CheckCircle size={15} />
                        <span className="hidden sm:inline">Submit</span>
                    </button>
                </div>
            </header>

            {/* ══════════════════════════════════════════
                PROGRESS BAR (full-width, beneath header)
            ══════════════════════════════════════════ */}
            <div className="flex-none h-1 bg-slate-800">
                <motion.div
                    className="h-full bg-blue-500"
                    animate={{ width: `${((answeredCount) / totalQuestions) * 100}%` }}
                    transition={{ duration: 0.4 }}
                />
            </div>

            {/* ══════════════════════════════════════════
                MAIN BODY
            ══════════════════════════════════════════ */}
            <div className="flex flex-1 overflow-hidden">

                {/* Question Area */}
                <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8 space-y-6 custom-scrollbar">
                    <QuestionCard
                        key={currentQuestion.id}
                        question={currentQuestion}
                        questionIndex={currentQuestionIndex + 1}
                        selectedOption={selectedOption}
                        onSelect={handleOptionSelect}
                        isPaused={isPaused}
                    />

                    {/* Prev / Next Navigation */}
                    <div className="flex justify-between pt-2 pb-8">
                        <button
                            onClick={() => goToQuestion(Math.max(0, currentQuestionIndex - 1))}
                            disabled={currentQuestionIndex === 0}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none border border-transparent hover:border-white/10 transition-all"
                        >
                            <ChevronLeft size={18} /> Previous
                        </button>
                        <button
                            onClick={nextQuestion}
                            disabled={!selectedOption && timerMode === 'question'}
                            className={cn(
                                "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg",
                                selectedOption || timerMode === 'overall'
                                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20 hover:-translate-y-0.5 active:translate-y-0'
                                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            )}
                        >
                            {isLastQuestion ? 'Finish' : 'Next'} <ChevronRight size={18} />
                        </button>
                    </div>
                </main>

                {/* ══════════════════════════════════════
                    RIGHT SIDEBAR — Question Navigator (desktop always, mobile drawer)
                ══════════════════════════════════════ */}
                <aside className={cn(
                    "flex-none w-64 bg-slate-900 border-l border-slate-700 flex flex-col overflow-hidden transition-all duration-300",
                    "hidden lg:flex",
                )}>
                    <div className="p-4 border-b border-slate-700">
                        <div className="flex items-center gap-2 text-slate-200 font-semibold">
                            <LayoutGrid size={16} className="text-purple-400" />
                            Question Navigator
                        </div>
                        <div className="mt-2 flex gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 inline-block rounded-full bg-green-500" /> Answered</span>
                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 inline-block rounded-full bg-blue-500" /> Current</span>
                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 inline-block rounded-full bg-slate-700" /> Left</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        <div className="grid grid-cols-5 gap-1.5">
                            {filteredQuestions.map((q, idx) => {
                                const isAnswered = answers[q.id] !== undefined;
                                const isCurrent = currentQuestionIndex === idx;
                                return (
                                    <button
                                        key={q.id}
                                        onClick={() => goToQuestion(idx)}
                                        className={cn(
                                            "h-9 w-full rounded-lg text-xs font-bold transition-all border",
                                            isCurrent
                                                ? "bg-blue-600 border-blue-400 text-white shadow-[0_0_8px_rgba(37,99,235,0.5)] scale-105 z-10"
                                                : isAnswered
                                                    ? "bg-green-500/20 border-green-500/40 text-green-400 hover:bg-green-500/30"
                                                    : "bg-slate-800/60 border-slate-700 text-slate-500 hover:bg-slate-700 hover:text-slate-200"
                                        )}
                                    >
                                        {idx + 1}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-4 border-t border-slate-700 space-y-3">
                        <div className="flex justify-between text-sm text-slate-400">
                            <span>Answered</span>
                            <span className="font-bold text-green-400">{answeredCount} / {totalQuestions}</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-400">
                            <span>Remaining</span>
                            <span className="font-bold text-yellow-400">{totalQuestions - answeredCount}</span>
                        </div>
                        <button
                            onClick={() => setShowSubmitModal(true)}
                            className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                        >
                            <CheckCircle size={16} /> Submit Test
                        </button>
                    </div>
                </aside>
            </div>

            {/* ══════════════════════════════════════════
                MOBILE NAVIGATOR DRAWER
            ══════════════════════════════════════════ */}
            <AnimatePresence>
                {showNav && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 lg:hidden"
                    >
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowNav(false)} />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="absolute right-0 top-0 bottom-0 w-72 bg-slate-900 border-l border-slate-700 flex flex-col"
                        >
                            <div className="flex items-center justify-between p-4 border-b border-slate-700">
                                <span className="font-semibold text-slate-200">Question Navigator</span>
                                <button onClick={() => setShowNav(false)} className="p-1 text-slate-400 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4">
                                <div className="grid grid-cols-6 gap-1.5">
                                    {filteredQuestions.map((q, idx) => {
                                        const isAnswered = answers[q.id] !== undefined;
                                        const isCurrent = currentQuestionIndex === idx;
                                        return (
                                            <button
                                                key={q.id}
                                                onClick={() => { goToQuestion(idx); setShowNav(false); }}
                                                className={cn(
                                                    "h-9 w-full rounded-lg text-xs font-bold transition-all border",
                                                    isCurrent
                                                        ? "bg-blue-600 border-blue-400 text-white"
                                                        : isAnswered
                                                            ? "bg-green-500/20 border-green-500/40 text-green-400"
                                                            : "bg-slate-800/60 border-slate-700 text-slate-500"
                                                )}
                                            >
                                                {idx + 1}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="p-4 border-t border-slate-700">
                                <button onClick={() => { setShowSubmitModal(true); setShowNav(false); }}
                                    className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
                                    <CheckCircle size={16} /> Submit Test
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ══════════════════════════════════════════
                PAUSE OVERLAY
            ══════════════════════════════════════════ */}
            <AnimatePresence>
                {isPaused && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center gap-6"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="text-center space-y-4"
                        >
                            <div className="mx-auto w-20 h-20 rounded-full bg-yellow-500/10 border-2 border-yellow-500/40 flex items-center justify-center">
                                <Pause size={36} className="text-yellow-400" />
                            </div>
                            <h2 className="text-4xl font-bold text-white">Test Paused</h2>
                            <p className="text-slate-400 text-lg">Your time is frozen. No peeking! 😄</p>
                            <div className="flex items-center justify-center gap-3 text-sm text-slate-500 mt-2">
                                <span className="bg-slate-800 border border-slate-700 px-3 py-1 rounded-lg font-mono">P</span>
                                <span>to resume</span>
                            </div>
                        </motion.div>

                        <button
                            onClick={handlePauseToggle}
                            className="mt-4 flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-lg transition-all shadow-lg shadow-green-900/30 hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <Play size={20} fill="currentColor" /> Resume Test
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ══════════════════════════════════════════
                SUBMIT CONFIRMATION MODAL
            ══════════════════════════════════════════ */}
            <AnimatePresence>
                {showSubmitModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            className="bg-slate-900 border border-slate-700 rounded-2xl p-8 w-full max-w-sm text-center shadow-2xl space-y-5"
                        >
                            <div className="w-14 h-14 mx-auto rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
                                <AlertTriangle size={28} className="text-yellow-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Submit Test?</h3>
                                <p className="text-slate-400 mt-1 text-sm">
                                    You have answered <span className="text-white font-bold">{answeredCount}</span> of <span className="text-white font-bold">{totalQuestions}</span> questions.
                                    {totalQuestions - answeredCount > 0 && (
                                        <span className="text-yellow-400"> {totalQuestions - answeredCount} unanswered.</span>
                                    )}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowSubmitModal(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 font-medium transition-all"
                                >
                                    Go Back
                                </button>
                                <button
                                    onClick={handleFinish}
                                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all"
                                >
                                    Submit
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
