import React, { useState } from 'react';
import { useQuiz } from '../../store/quizStore';
import { motion } from 'framer-motion';
import { User, ArrowRight } from 'lucide-react';

export default function LoginScreen() {
    const [username, setUsername] = useState('');
    const { login } = useQuiz();

    const handleLogin = (e) => {
        e.preventDefault();
        if (username.trim()) {
            login(username.trim());
        }
    };

    return (
        <div className="w-full max-w-md mx-auto space-y-8 pt-20">
            <div className="text-center space-y-4">
                <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    Welcome
                </h1>
                <p className="text-slate-400">
                    Enter your name to track your progress & compete.
                </p>
            </div>

            <motion.form
                onSubmit={handleLogin}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-6 shadow-2xl"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
            >
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 ml-1">Username</label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="e.g. Maverick"
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-12 pr-4 py-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                            autoFocus
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={!username.trim()}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Start Journey
                    <ArrowRight size={20} />
                </button>
            </motion.form>
        </div>
    );
}
