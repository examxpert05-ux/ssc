
import React, { useEffect, useState } from 'react';
import { useQuiz } from '../../store/quizStore';
import Timer from './Timer';
import QuestionCard from './QuestionCard';
import { ChevronRight, Clock, CheckCircle, Circle, LayoutGrid } from 'lucide-react';
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
        quizStatus,
        timerMode,
        timePerQuestion,
        totalTime,
        finishQuiz
    } = useQuiz();

    const currentQuestion = filteredQuestions[currentQuestionIndex];
    const totalQuestions = filteredQuestions.length;
    const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
    const selectedOption = answers[currentQuestion.id];

    // Logic for Overall Timer Mode
    const timerKey = timerMode === 'question' ? currentQuestion.id : 'overall-timer';
    const timerDuration = timerMode === 'question' ? timePerQuestion : totalTime;

    const handleOptionSelect = (opt) => {
        // In Exam mode, usually you can change answers? 
        // Current logic: if (selectedOption) return. 
        // User didn't ask to change answers, so sticking to "lock on answer" for now 
        // unless they explicitly want "review" capability. 
        // Sticking to original logic for consistency unless requested.
        if (selectedOption) return;
        submitAnswer(currentQuestion.id, opt);
    };

    const handleTimeOut = () => {
        if (timerMode === 'question') {
            if (!selectedOption) {
                nextQuestion();
            }
        } else {
            finishQuiz();
        }
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen lg:h-auto gap-6 max-w-7xl mx-auto p-4">
            {/* Left Column: Main Quiz Area */}
            <div className="flex-1 space-y-6">

                {/* Top Sticky Header (Timer & Progress) */}
                <div className="sticky top-4 z-10 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-xl space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <span className="text-slate-400 text-sm font-medium">Question</span>
                            <div className="text-2xl font-bold text-white">
                                {currentQuestionIndex + 1} <span className="text-slate-500 text-lg">/ {totalQuestions}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 flex-1 justify-end max-w-md">
                            <Timer
                                key={timerKey}
                                duration={timerDuration}
                                onTimeout={handleTimeOut}
                            />
                        </div>
                    </div>

                    {/* Question Progress Bar */}
                    <div className="w-full h-1 bg-slate-800/50 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-blue-600"
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </div>

                <div className="min-h-[400px]">
                    <QuestionCard
                        key={currentQuestion.id}
                        question={currentQuestion}
                        questionIndex={currentQuestionIndex + 1}
                        selectedOption={selectedOption}
                        onSelect={handleOptionSelect}
                    />
                </div>

                {/* Footer Navigation (Next/Prev) */}
                <div className="flex justify-between pt-4">
                    <button
                        onClick={() => goToQuestion(Math.max(0, currentQuestionIndex - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="px-6 py-3 rounded-xl font-medium text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                    >
                        Previous
                    </button>
                    <button
                        onClick={nextQuestion}
                        disabled={!selectedOption && timerMode === 'question'}
                        className={cn(
                            "px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg",
                            selectedOption || timerMode === 'overall'
                                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20 transform hover:-translate-y-1'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        )}
                    >
                        {isLastQuestion ? 'Finish' : 'Next'}
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Right Column: Navigation Panel */}
            <div className="w-full lg:w-80 space-y-4">
                <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 h-fit sticky top-4">
                    <div className="flex items-center gap-2 mb-4 text-slate-200 font-semibold border-b border-white/5 pb-2">
                        <LayoutGrid size={18} className="text-purple-400" />
                        Question Navigator
                    </div>

                    <div className="grid grid-cols-5 gap-2 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
                        {filteredQuestions.map((q, idx) => {
                            const isAnswered = answers[q.id] !== undefined;
                            const isCurrent = currentQuestionIndex === idx;

                            return (
                                <button
                                    key={q.id}
                                    onClick={() => goToQuestion(idx)}
                                    className={cn(
                                        "h-10 w-10 rounded-lg text-sm font-bold transition-all border",
                                        isCurrent
                                            ? "bg-blue-600 border-blue-400 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)] scale-110 z-10"
                                            : isAnswered
                                                ? "bg-green-500/20 border-green-500/50 text-green-400 hover:bg-green-500/30"
                                                : "bg-slate-800/50 border-slate-700 text-slate-500 hover:bg-slate-700 hover:text-slate-200"
                                    )}
                                >
                                    {idx + 1}
                                </button>
                            )
                        })}
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/5 space-y-4">
                        <div className="flex justify-between text-xs text-slate-400 px-2">
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500/50"></div>Answered</div>
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-600"></div>Current</div>
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-700"></div>Left</div>
                        </div>

                        <button
                            onClick={finishQuiz}
                            className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 text-red-400 font-bold rounded-xl transition-all flex justify-center items-center gap-2"
                        >
                            <CheckCircle size={18} />
                            Submit Quiz
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
