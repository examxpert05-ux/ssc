import React from 'react';
import { motion } from 'framer-motion';
import { useQuiz } from '../../store/quizStore';
import { Languages } from 'lucide-react';

export default function Layout({ children }) {
    const { appLanguage, setAppLanguage } = useQuiz();

    return (
        <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[100px]" />
            </div>

            {/* Language Toggle */}
            <div className="absolute top-4 right-4 z-50">
                <button
                    onClick={() => setAppLanguage(appLanguage === 'English' ? 'Hindi' : 'English')}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 shadow-lg rounded-full text-sm text-slate-300 font-medium backdrop-blur-md transition-all active:scale-95"
                >
                    <Languages size={16} className="text-blue-400" />
                    {appLanguage}
                </button>
            </div>

            {/* Main Container */}
            <motion.main
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-4xl max-h-[90vh] lg:max-h-none overflow-y-auto lg:overflow-visible custom-scrollbar"
            >
                {children}
            </motion.main>
        </div>
    );
}
