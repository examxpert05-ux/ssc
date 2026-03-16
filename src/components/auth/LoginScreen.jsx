import React, { useState } from 'react';
import { useQuiz } from '../../store/quizStore';
import { motion } from 'framer-motion';
import { User, ArrowRight, BookOpen, Trophy, Target } from 'lucide-react';

const features = [
    { icon: BookOpen, label: 'Maths, English & GK/GS' },
    { icon: Target, label: 'Adaptive Difficulty' },
    { icon: Trophy, label: 'Track Your Progress' },
];

export default function LoginScreen() {
    const [username, setUsername] = useState('');
    const { login } = useQuiz();

    const handleLogin = (e) => {
        e.preventDefault();
        if (username.trim()) login(username.trim());
    };

    return (
        <div className="w-full min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

                {/* Left — Branding */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center md:text-left space-y-6 px-2"
                >
                    <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 px-4 py-1.5 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                        <span className="text-blue-400 text-sm font-semibold tracking-wide uppercase">SSC Exam Prep</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-white leading-tight">
                        Master<br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                            Every Topic
                        </span>
                    </h1>
                    <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
                        Targeted practice for SSC CGL, CHSL, and MTS with 10,000+ questions and adaptive difficulty.
                    </p>
                    <div className="flex flex-col gap-3 pt-2">
                        {features.map(({ icon: Icon, label }) => (
                            <div key={label} className="flex items-center gap-3 text-slate-300">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                                    <Icon size={16} className="text-blue-400" />
                                </div>
                                <span className="text-sm font-medium">{label}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Right — Login Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <form
                        onSubmit={handleLogin}
                        className="bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-3xl p-8 shadow-2xl space-y-6"
                    >
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
                            <p className="text-slate-400 text-sm">Enter your name to continue where you left off.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300">Your Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="e.g. Arjun, Priya..."
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-11 pr-4 py-3.5 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={!username.trim()}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                        >
                            Start Your Journey
                            <ArrowRight size={18} />
                        </button>

                        <p className="text-center text-xs text-slate-600">
                            No account needed — your progress is saved locally.
                        </p>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
