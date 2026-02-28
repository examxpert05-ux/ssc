import React, { useEffect, useState } from 'react';
import { useQuiz } from '../../store/quizStore';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import { RefreshCw, XCircle, CheckCircle, Home, MinusCircle, Target, BookOpen } from 'lucide-react';
import MathText from '../ui/MathText';

export default function ResultScreen() {
    const { score, filteredQuestions, answers, resetQuiz, setCurrentView, appLanguage } = useQuiz();
    const [showReview, setShowReview] = useState(false);

    const totalQuestions = filteredQuestions.length;
    const correctCount = filteredQuestions.filter(q => q.correct_option === answers[q.id]).length;
    const wrongCount = filteredQuestions.filter(q => answers[q.id] && q.correct_option !== answers[q.id]).length;
    const skippedCount = totalQuestions - correctCount - wrongCount;

    const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    useEffect(() => {
        if (accuracy > 50) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    }, [accuracy]);

    const handleHome = () => {
        resetQuiz();
        setCurrentView('dashboard');
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl mx-auto space-y-8 text-center"
        >
            <div className="space-y-2">
                <h2 className="text-3xl font-bold text-white">Quiz Completed!</h2>
                <p className="text-slate-400">Here's how you performed</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl space-y-8">
                {/* Score Display */}
                <div className="flex flex-col items-center justify-center space-y-2">
                    <span className="text-slate-400 text-sm uppercase tracking-wider font-bold">Total Score</span>
                    <span className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">
                        {score}
                    </span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 flex flex-col items-center">
                        <Target className="text-green-400 mb-2" size={24} />
                        <span className="text-2xl font-bold text-green-400">{correctCount}</span>
                        <span className="text-xs text-slate-400 font-medium">Correct</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex flex-col items-center">
                        <XCircle className="text-red-400 mb-2" size={24} />
                        <span className="text-2xl font-bold text-red-400">{wrongCount}</span>
                        <span className="text-xs text-slate-400 font-medium">Wrong</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-500/10 border border-slate-500/20 flex flex-col items-center">
                        <MinusCircle className="text-slate-400 mb-2" size={24} />
                        <span className="text-2xl font-bold text-slate-400">{skippedCount}</span>
                        <span className="text-xs text-slate-400 font-medium">Skipped</span>
                    </div>
                </div>

                {/* Accuracy Bar */}
                <div className="space-y-2 text-left">
                    <div className="flex justify-between text-sm font-medium text-slate-400">
                        <span>Accuracy</span>
                        <span>{accuracy}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${accuracy}%` }}
                            transition={{ delay: 0.5, duration: 1 }}
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        />
                    </div>
                </div>
            </div>

            <div className="flex gap-4 justify-center">
                <button
                    onClick={handleHome}
                    className="flex items-center gap-2 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all font-bold border border-white/5"
                >
                    <Home size={20} />
                    Dashboard
                </button>
                <button
                    onClick={resetQuiz}
                    className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all font-bold shadow-lg shadow-blue-600/20"
                >
                    <RefreshCw size={20} />
                    Play Again
                </button>
            </div>

            <div className="pt-8 border-t border-white/5">
                <button
                    onClick={() => setShowReview(!showReview)}
                    className="flex items-center gap-2 mx-auto px-6 py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl transition-all font-medium border border-white/10"
                >
                    <BookOpen size={18} />
                    {showReview ? 'Hide Review' : 'Review Answers'}
                </button>
            </div>

            {showReview && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 space-y-6 text-left"
                >
                    {filteredQuestions.map((q, idx) => {
                        const isSkipped = !answers[q.id];
                        return (
                            <div key={q.id} className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-2xl space-y-4 shadow-lg">
                                <div className="flex gap-3 text-slate-200 font-medium text-lg">
                                    <span className="text-blue-400 shrink-0">Q{idx + 1}.</span>
                                    <div><MathText text={(q.question || (appLanguage === 'Hindi' && q.hindi ? q.hindi : q.english) || '').replace(/^Q\.\d+\.\s*/, '')} /></div>
                                </div>
                                {isSkipped && (
                                    <div className="text-sm font-semibold text-orange-400 bg-orange-400/10 inline-block px-3 py-1 rounded border border-orange-400/20">
                                        Skipped
                                    </div>
                                )}
                                <div className="grid gap-3 col-span-1">
                                    {['A', 'B', 'C', 'D'].map(opt => {
                                        const isCorrect = q.correct_option === opt;
                                        const isSelected = answers[q.id] === opt;

                                        let bg = "bg-slate-800/50";
                                        let border = "border-slate-700";
                                        let text = "text-slate-400";

                                        if (isCorrect) {
                                            bg = "bg-green-500/20";
                                            border = "border-green-500/50";
                                            text = "text-green-300";
                                        } else if (isSelected && !isCorrect) {
                                            bg = "bg-red-500/20";
                                            border = "border-red-500/50";
                                            text = "text-red-300";
                                        }

                                        const optText = q.options[opt] || q.options[opt.toLowerCase()];

                                        return (
                                            <div key={opt} className={`p-4 rounded-xl border ${bg} ${border} ${text} flex gap-4 transition-all items-center`}>
                                                <span className="font-bold bg-white/5 w-8 h-8 flex items-center justify-center rounded-lg shrink-0">{opt}</span>
                                                <span className="text-md leading-relaxed">{optText}</span>
                                                {isCorrect && <CheckCircle size={20} className="ml-auto text-green-400 shrink-0" />}
                                                {isSelected && !isCorrect && <XCircle size={20} className="ml-auto text-red-400 shrink-0" />}
                                            </div>
                                        )
                                    })}
                                </div>
                                {q.explanation && (
                                    <div className="mt-4 p-5 bg-blue-900/20 border border-blue-500/30 rounded-xl space-y-2">
                                        <div className="flex items-center gap-2 text-blue-400 font-bold mb-1">
                                            <BookOpen size={16} />
                                            <span>Explanation</span>
                                        </div>
                                        <p className="text-slate-300 leading-relaxed text-sm">
                                            {q.explanation}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </motion.div>
            )}
        </motion.div>
    );
}
