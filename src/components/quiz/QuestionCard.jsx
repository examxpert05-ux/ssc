import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Check, X } from 'lucide-react';

export default function QuestionCard({ question, selectedOption, onSelect }) {
    // Reset local state when question changes if needed, but controlled by parent is better.

    const options = ['A', 'B', 'C', 'D'];

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
                        Question {question.question_number}
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
                        const optionText = question.options[opt];

                        return (
                            <motion.button
                                key={question.id + opt}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0, transition: { delay: index * 0.1 } }}
                                onClick={() => onSelect(opt)}
                                className={cn(
                                    "relative group w-full p-4 text-left rounded-xl border transition-all duration-200",
                                    isSelected
                                        ? "bg-blue-600/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                                        : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={cn(
                                        "flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold border transition-colors",
                                        isSelected
                                            ? "bg-blue-500 text-white border-blue-400"
                                            : "bg-slate-800 text-slate-400 border-slate-700 group-hover:border-slate-500"
                                    )}>
                                        {opt}
                                    </span>
                                    <span className={cn(
                                        "text-lg font-medium",
                                        isSelected ? "text-blue-100" : "text-slate-300"
                                    )}>
                                        {optionText}
                                    </span>
                                </div>

                                {isSelected && (
                                    <motion.div
                                        layoutId="check"
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400"
                                    >
                                        <Check size={20} />
                                    </motion.div>
                                )}
                            </motion.button>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}
