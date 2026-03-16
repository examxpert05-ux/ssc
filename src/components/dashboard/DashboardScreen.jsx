import React from 'react';
import { useQuiz } from '../../store/quizStore';
import { motion } from 'framer-motion';
import { Play, LogOut, TrendingUp, Award, Activity, Clock, ChevronRight, BarChart2, BookOpen } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function DashboardScreen() {
    const { user, history, logout, setCurrentView } = useQuiz();

    const totalTests = history.length;
    const bestScore = history.reduce((max, h) => Math.max(max, h.score), 0);
    const avgAccuracy = totalTests > 0
        ? Math.round(history.reduce((acc, h) => acc + h.accuracy, 0) / totalTests)
        : 0;
    const totalCorrect = history.reduce((sum, h) => sum + (h.correct || 0), 0);

    const chartData = [...history].reverse().slice(-10).map((h, i) => ({
        name: `#${i + 1}`,
        score: Number(h.score.toFixed(1)),
        accuracy: h.accuracy,
    }));

    const handleStartNew = () => useQuiz.setState({ currentView: 'start' });

    const gradeColor = avgAccuracy >= 80 ? 'text-green-400' : avgAccuracy >= 60 ? 'text-blue-400' : avgAccuracy >= 40 ? 'text-yellow-400' : 'text-red-400';

    const stats = [
        { label: 'Tests Taken', value: totalTests, icon: Activity, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
        { label: 'Best Score', value: bestScore, icon: Award, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
        { label: 'Avg Accuracy', value: `${avgAccuracy}%`, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
        { label: 'Total Correct', value: totalCorrect, icon: BookOpen, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    ];

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6 p-4 pb-16">

            {/* Header Bar */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">👋</span>
                        <h1 className="text-2xl font-black text-white">Hello, {user}!</h1>
                    </div>
                    <p className="text-slate-400 text-sm mt-0.5">
                        {totalTests === 0 ? "Ready to start your first test?" : `You've completed ${totalTests} test${totalTests > 1 ? 's' : ''} so far.`}
                    </p>
                </div>
                <button
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800/60 hover:bg-red-500/10 border border-slate-700 hover:border-red-500/40 text-slate-400 hover:text-red-400 rounded-xl transition-all font-medium text-sm"
                    title="Logout"
                >
                    <LogOut size={16} />
                    <span className="hidden sm:inline">Logout</span>
                </button>
            </div>

            {/* CTA button */}
            <motion.button
                onClick={handleStartNew}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-900/30 flex items-center justify-center gap-3 text-lg transition-all"
            >
                <Play fill="currentColor" size={20} />
                Start New Test
                <ChevronRight size={20} className="ml-1 opacity-70" />
            </motion.button>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map(({ label, value, icon: Icon, color, bg }, i) => (
                    <motion.div
                        key={label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`bg-slate-900/60 border ${bg.split(' ')[1]} rounded-2xl p-5 flex flex-col gap-3`}
                    >
                        <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center border`}>
                            <Icon size={18} className={color} />
                        </div>
                        <div>
                            <div className={`text-2xl font-black ${color}`}>{value}</div>
                            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-0.5">{label}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Chart + History */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                {/* Performance Chart */}
                <div className="lg:col-span-3 bg-slate-900/60 border border-slate-700 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <BarChart2 size={18} className="text-blue-400" />
                        <h3 className="font-bold text-white">Performance Trend</h3>
                        <span className="ml-auto text-xs text-slate-500">Last 10 tests</span>
                    </div>
                    <div className="h-[220px]">
                        {chartData.length > 1 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis dataKey="name" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc', fontSize: 12 }}
                                        itemStyle={{ color: '#60a5fa' }}
                                    />
                                    <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2.5} fill="url(#scoreGrad)" dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#1e3a5f' }} activeDot={{ r: 6 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-600">
                                <BarChart2 size={40} className="opacity-30" />
                                <p className="text-sm">Complete at least 2 tests to see your trend.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent History */}
                <div className="lg:col-span-2 bg-slate-900/60 border border-slate-700 rounded-2xl p-6 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                        <Clock size={18} className="text-purple-400" />
                        <h3 className="font-bold text-white">Recent Activity</h3>
                    </div>
                    <div className="flex-1 space-y-2 overflow-y-auto max-h-[260px] custom-scrollbar pr-1">
                        {history.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-600 text-sm py-8 gap-2">
                                <Activity size={32} className="opacity-30" />
                                No tests yet. Take one!
                            </div>
                        ) : history.map((h, i) => {
                            const accColor = h.accuracy >= 70 ? 'text-green-400' : h.accuracy >= 40 ? 'text-yellow-400' : 'text-red-400';
                            return (
                                <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 rounded-xl transition-colors">
                                    <div className={`w-2 h-8 rounded-full ${h.accuracy >= 70 ? 'bg-green-500' : h.accuracy >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-semibold text-slate-200 truncate">{h.chapter}</div>
                                        <div className="text-xs text-slate-500">{h.subject} · {new Date(h.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className={`text-sm font-bold ${accColor}`}>{h.accuracy}%</div>
                                        <div className="text-xs text-slate-500">{h.score} pts</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
