import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Check, X, BookOpen, Lock } from 'lucide-react';
import MathText from '../ui/MathText';
import { useQuiz } from '../../store/quizStore';

export default function QuestionCard({ question, selectedOption, onSelect, questionIndex, isPaused }) {
    const options = ['A', 'B', 'C', 'D'];
    const isAnswered = !!selectedOption;
    const appLanguage = useQuiz(state => state.appLanguage);
    const zoomLevel = useQuiz(state => state.zoomLevel);

    const questionText = question.question || (appLanguage === 'Hindi' && question.hindi ? question.hindi : question.english) || '';

    return (
        <div className="w-full max-w-3xl mx-auto space-y-5">

            {/* Question Box */}
            <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
                className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 md:p-8 shadow-lg"
            >
                {/* Meta row */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                            Q. {questionIndex}
                        </span>
                        {question.type && (
                            <span className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded-full">
                                {question.type}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {question.source && (
                            <span className="text-xs font-semibold text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded">
                                {question.source}
                            </span>
                        )}
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                            <span className="text-green-400 font-bold">+2</span>
                            <span>/</span>
                            <span className="text-red-400 font-bold">-0.5</span>
                        </div>
                    </div>
                </div>

                {/* Question Text */}
                <p 
                    className="text-white font-medium leading-relaxed transition-all duration-200"
                    style={{ fontSize: `${(zoomLevel / 100) * 1.25}rem` }}
                >
                    <MathText text={questionText.replace(/^Q\.\d+\.\s*/, '')} />
                </p>
            </motion.div>

            {/* Options — OMR style */}
            <div className="space-y-3">
                {options.map((opt, index) => {
                    const isSelected = selectedOption === opt;
                    const isCorrect = opt === question.correct_option;
                    const showCorrect = isAnswered && isCorrect;
                    const showWrong = isAnswered && isSelected && !isCorrect;

                    let containerClass = "border-slate-700 bg-slate-800/40 hover:bg-slate-700/50 hover:border-slate-500";
                    let circleClass = "border-slate-600 text-slate-400";
                    let labelClass = "text-slate-300";

                    if (showCorrect) {
                        containerClass = "border-green-500/60 bg-green-500/10";
                        circleClass = "border-green-500 bg-green-500 text-white";
                        labelClass = "text-green-100";
                    } else if (showWrong) {
                        containerClass = "border-red-500/60 bg-red-500/10";
                        circleClass = "border-red-500 bg-red-500 text-white";
                        labelClass = "text-red-100";
                    } else if (isSelected) {
                        containerClass = "border-blue-500/60 bg-blue-500/10";
                        circleClass = "border-blue-500 bg-blue-500 text-white";
                        labelClass = "text-blue-100";
                    }

                    return (
                        <motion.button
                            key={question.id + opt}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0, transition: { delay: index * 0.06 } }}
                            onClick={() => !isAnswered && !isPaused && onSelect(opt)}
                            disabled={isAnswered || isPaused}
                            className={cn(
                                "relative w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left group cursor-pointer disabled:cursor-default",
                                containerClass
                            )}
                        >
                            {/* OMR Circle */}
                            <span className={cn(
                                "flex-none flex items-center justify-center w-9 h-9 rounded-full border-2 text-sm font-bold transition-all",
                                circleClass
                            )}>
                                {showCorrect ? <Check size={16} strokeWidth={3} /> : showWrong ? <X size={16} strokeWidth={3} /> : opt}
                            </span>

                            {/* Option Text */}
                            <span 
                                className={cn("flex-1 font-medium leading-snug transition-all duration-200", labelClass)}
                                style={{ fontSize: `${(zoomLevel / 100) * 1.125}rem` }}
                            >
                                <MathText text={question.options[opt] ?? ''} />
                            </span>

                            {/* Right status icon */}
                            {showCorrect && (
                                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex-none text-green-400 font-bold text-sm">
                                    Correct ✓
                                </motion.span>
                            )}
                            {showWrong && (
                                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex-none text-red-400 font-bold text-sm">
                                    Wrong ✗
                                </motion.span>
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Explanation */}
            <AnimatePresence>
                {isAnswered && question.explanation && question.explanation !== 'NA' && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-5 space-y-2"
                    >
                        <div className="flex items-center gap-2 text-indigo-300 font-semibold text-sm">
                            <BookOpen size={15} />
                            <span>Explanation</span>
                        </div>
                        <p 
                            className="text-slate-300 leading-relaxed transition-all duration-200"
                            style={{ fontSize: `${(zoomLevel / 100) * 1}rem` }}
                        >
                            <MathText text={question.explanation} />
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
