import React, { useEffect, useState } from 'react';
import { useQuiz } from '../../store/quizStore';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, XCircle, CheckCircle, Home, MinusCircle, Target, BookOpen, Award, ChevronDown, ChevronUp } from 'lucide-react';
import MathText from '../ui/MathText';

export default function ResultScreen() {
    const { score, filteredQuestions, answers, resetQuiz, setCurrentView, appLanguage } = useQuiz();
    const [showReview, setShowReview] = useState(false);

    const totalQuestions = filteredQuestions.length;
    const correctCount = filteredQuestions.filter(q => q.correct_option === answers[q.id]).length;
    const wrongCount = filteredQuestions.filter(q => answers[q.id] && q.correct_option !== answers[q.id]).length;
    const skippedCount = totalQuestions - correctCount - wrongCount;
    const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    const grade = accuracy >= 90 ? { label: 'Excellent!', color: 'text-green-400', bg: 'from-green-500/20 to-emerald-500/10', border: 'border-green-500/30' }
        : accuracy >= 70 ? { label: 'Great Job!', color: 'text-blue-400', bg: 'from-blue-500/20 to-indigo-500/10', border: 'border-blue-500/30' }
        : accuracy >= 50 ? { label: 'Good Effort', color: 'text-yellow-400', bg: 'from-yellow-500/20 to-orange-500/10', border: 'border-yellow-500/30' }
        : { label: 'Keep Practicing', color: 'text-red-400', bg: 'from-red-500/20 to-rose-500/10', border: 'border-red-500/30' };

    useEffect(() => {
        if (accuracy > 50) {
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 } });
        }
    }, [accuracy]);

    const handleHome = () => {
        resetQuiz();
        setCurrentView('dashboard');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl mx-auto space-y-6 pb-16"
        >
            {/* Result Hero */}
            <div className={`relative bg-gradient-to-b ${grade.bg} border ${grade.border} rounded-3xl p-8 text-center overflow-hidden shadow-2xl`}>
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 12, delay: 0.1 }}
                    className="relative"
                >
                    <div className="text-6xl mb-3">
                        {accuracy >= 90 ? '🏆' : accuracy >= 70 ? '🎯' : accuracy >= 50 ? '💪' : '📚'}
                    </div>
                    <h2 className={`text-3xl font-black ${grade.color}`}>{grade.label}</h2>
                    <p className="text-slate-400 mt-1 text-sm">Test completed · {totalQuestions} Questions</p>
                </motion.div>

                {/* Score ring */}
                <div className="mt-8 flex items-center justify-center gap-10">
                    <div className="text-center">
                        <div className="text-5xl font-black text-white">{score}</div>
                        <div className="text-slate-400 text-xs uppercase tracking-widest mt-1 font-semibold">Score</div>
                    </div>
                    <div className="w-px h-12 bg-white/10" />
                    <div className="text-center">
                        <div className={`text-5xl font-black ${grade.color}`}>{accuracy}%</div>
                        <div className="text-slate-400 text-xs uppercase tracking-widest mt-1 font-semibold">Accuracy</div>
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Correct', value: correctCount, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
                    { label: 'Wrong', value: wrongCount, icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
                    { label: 'Skipped', value: skippedCount, icon: MinusCircle, color: 'text-slate-400', bg: 'bg-slate-700/40 border-slate-600/30' },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                    <motion.div
                        key={label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className={`flex flex-col items-center gap-2 p-5 rounded-2xl border ${bg}`}
                    >
                        <Icon size={22} className={color} />
                        <span className={`text-2xl font-black ${color}`}>{value}</span>
                        <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{label}</span>
                    </motion.div>
                ))}
            </div>

            {/* Accuracy bar */}
            <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-5 space-y-3">
                <div className="flex justify-between text-sm font-semibold">
                    <span className="text-slate-400">Overall Accuracy</span>
                    <span className={grade.color}>{accuracy}%</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${accuracy}%` }}
                        transition={{ delay: 0.4, duration: 1, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
                    />
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                    <span>0%</span><span>50%</span><span>100%</span>
                </div>
            </div>

            {/* Scoring breakdown */}
            <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-slate-400 mb-3">Scoring Breakdown</h3>
                <div className="flex gap-6 text-sm">
                    <div className="flex items-center gap-2"><span className="text-green-400 font-bold">+2</span> <span className="text-slate-500">per correct</span></div>
                    <div className="flex items-center gap-2"><span className="text-red-400 font-bold">-0.5</span> <span className="text-slate-500">per wrong</span></div>
                    <div className="flex items-center gap-2"><span className="text-slate-400 font-bold">0</span> <span className="text-slate-500">skipped</span></div>
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
                <button
                    onClick={handleHome}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 rounded-xl font-bold transition-all"
                >
                    <Home size={18} /> Dashboard
                </button>
                <button
                    onClick={resetQuiz}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-900/30 transition-all hover:-translate-y-0.5"
                >
                    <RefreshCw size={18} /> Try Again
                </button>
            </div>

            {/* Answer Review */}
            <div className="border-t border-slate-800 pt-4">
                <button
                    onClick={() => setShowReview(v => !v)}
                    className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl font-semibold transition-all"
                >
                    <div className="flex items-center gap-2">
                        <BookOpen size={18} className="text-blue-400" />
                        Review All Answers
                    </div>
                    {showReview ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>

                <AnimatePresence>
                    {showReview && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 space-y-4 overflow-hidden"
                        >
                            {filteredQuestions.map((q, idx) => {
                                const isSkipped = !answers[q.id];
                                const isCorrect = answers[q.id] === q.correct_option;
                                const statusColor = isSkipped ? 'border-l-slate-500' : isCorrect ? 'border-l-green-500' : 'border-l-red-500';

                                return (
                                    <div key={q.id} className={`bg-slate-900/60 border border-slate-700 border-l-4 ${statusColor} p-5 rounded-2xl space-y-4`}>
                                        <div className="flex items-start gap-3">
                                            <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shrink-0 mt-0.5">Q{idx + 1}</span>
                                            <p className="text-slate-200 font-medium leading-relaxed">
                                                <MathText text={(q.question || (appLanguage === 'Hindi' && q.hindi ? q.hindi : q.english) || '').replace(/^Q\.\d+\.\s*/, '')} />
                                            </p>
                                        </div>
                                        {isSkipped && (
                                            <span className="text-xs font-bold text-orange-400 bg-orange-400/10 px-3 py-1 rounded-full border border-orange-400/20">⚠ Skipped</span>
                                        )}
                                        <div className="grid gap-2">
                                            {['A', 'B', 'C', 'D'].map(opt => {
                                                const isOptCorrect = q.correct_option === opt;
                                                const isOptSelected = answers[q.id] === opt;
                                                const optText = q.options[opt] || q.options[opt.toLowerCase()];

                                                let cls = 'border-slate-700 bg-slate-800/40 text-slate-500';
                                                if (isOptCorrect) cls = 'border-green-500/50 bg-green-500/10 text-green-300';
                                                else if (isOptSelected && !isOptCorrect) cls = 'border-red-500/50 bg-red-500/10 text-red-300';

                                                return (
                                                    <div key={opt} className={`flex items-center gap-3 p-3 rounded-xl border ${cls}`}>
                                                        <span className="font-bold text-sm w-7 h-7 flex items-center justify-center rounded-full border border-current shrink-0">{opt}</span>
                                                        <span className="text-sm flex-1"><MathText text={optText ?? ''} /></span>
                                                        {isOptCorrect && <CheckCircle size={16} className="text-green-400 shrink-0" />}
                                                        {isOptSelected && !isOptCorrect && <XCircle size={16} className="text-red-400 shrink-0" />}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {q.explanation && q.explanation !== 'NA' && (
                                            <div className="p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-xl">
                                                <div className="flex items-center gap-2 text-indigo-300 font-semibold text-xs mb-2">
                                                    <BookOpen size={13} /> Explanation
                                                </div>
                                                <p className="text-slate-300 text-sm leading-relaxed"><MathText text={q.explanation} /></p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
