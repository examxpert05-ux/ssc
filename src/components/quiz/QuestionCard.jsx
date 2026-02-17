import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Check, X, BookOpen } from 'lucide-react';

export default function QuestionCard({ question, selectedOption, onSelect }) {
    const options = ['A', 'B', 'C', 'D'];
    const isAnswered = !!selectedOption;

    return (
        <div className="w-full space-y-6">
            <motion.div
                key={question.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 shadow-lg"
            >
                <div className="flex justify-between items-start mb-4">
                    <span className="text-sm font-medium text-slate-400 bg-slate-900/50 px-3 py-1 rounded-full">
                        Question {question.question_number || '?'}
                    </span>
                    <span className="text-sm font-medium text-slate-500">
                        {question.type}
                    </span>
                </div>

                <h2 className="text-xl md:text-2xl font-semibold text-slate-100 leading-relaxed">
                    {question.question}
                </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode='wait'>
                    {options.map((opt, index) => {
                        const isSelected = selectedOption === opt;
                        const isCorrect = opt === question.correct_option;
                        const showCorrect = isAnswered && isCorrect;
                        const showWrong = isAnswered && isSelected && !isCorrect;

                        let borderColor = "border-white/5";
                        let bgColor = "bg-white/5";
                        let textColor = "text-slate-300";

                        if (showCorrect) {
                            borderColor = "border-green-500/50";
                            bgColor = "bg-green-500/20";
                            textColor = "text-green-100";
                        } else if (showWrong) {
                            borderColor = "border-red-500/50";
                            bgColor = "bg-red-500/20";
                            textColor = "text-red-100";
                        } else if (isSelected) {
                            // Selected but we don't know yet? check handled above.
                            // If we want to show selected state BEFORE submit?
                            // But usually onSelect submits immediately in this app based on QuizScreen logic.
                            borderColor = "border-blue-500/50";
                            bgColor = "bg-blue-600/20";
                            textColor = "text-blue-100";
                        }

                        return (
                            <motion.button
                                key={question.id + opt}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0, transition: { delay: index * 0.1 } }}
                                onClick={() => !isAnswered && onSelect(opt)}
                                disabled={isAnswered}
                                className={cn(
                                    "relative group w-full p-4 text-left rounded-xl border transition-all duration-200",
                                    borderColor, bgColor,
                                    !isAnswered && "hover:bg-white/10 hover:border-white/20"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={cn(
                                        "flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold border transition-colors",
                                        showCorrect ? "bg-green-500 text-white border-green-400" :
                                            showWrong ? "bg-red-500 text-white border-red-400" :
                                                isSelected ? "bg-blue-500 text-white border-blue-400" :
                                                    "bg-slate-800 text-slate-400 border-slate-700 group-hover:border-slate-500"
                                    )}>
                                        {opt}
                                    </span>
                                    <span className={cn("text-lg font-medium", textColor)}>
                                        {question.options[opt]}
                                    </span>
                                </div>

                                {showCorrect && (
                                    <motion.div
                                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400"
                                    >
                                        <Check size={20} />
                                    </motion.div>
                                )}
                                {showWrong && (
                                    <motion.div
                                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-red-400"
                                    >
                                        <X size={20} />
                                    </motion.div>
                                )}
                            </motion.button>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Explanation Section */}
            {isAnswered && question.explanation && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6 space-y-2"
                >
                    <div className="flex items-center gap-2 text-blue-400 font-bold mb-2">
                        <BookOpen size={18} />
                        <span>Explanation</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                        {question.explanation}
                    </p>
                </motion.div>
            )}
        </div>
    );
}
