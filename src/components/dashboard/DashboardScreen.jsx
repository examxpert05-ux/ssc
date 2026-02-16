import React from 'react';
import { useQuiz } from '../../store/quizStore';
import { motion } from 'framer-motion';
import { Play, LogOut, TrendingUp, Award, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardScreen() {
    const { user, history, logout, setFilter } = useQuiz();

    // Calculate Stats
    const totalTests = history.length;
    const bestScore = history.reduce((max, h) => Math.max(max, h.score), 0);
    const avgAccuracy = totalTests > 0
        ? Math.round(history.reduce((acc, h) => acc + h.accuracy, 0) / totalTests)
        : 0;

    // Prepare Chart Data (Reverse chronological for chart L->R?)
    // Actually history is [latest, ..., oldest]. We want Oldest -> Newest for chart.
    const chartData = [...history].reverse().map((h, i) => ({
        name: `Test ${i + 1}`,
        score: h.score,
        accuracy: h.accuracy
    }));

    const handleStartNew = () => {
        // We already have user, just need to switch view?
        // Actually StartScreen needs to be rendered.
        // In App.jsx we will handle routing. 
        // This button might just need to trigger a state change or just strictly App.jsx logic.
        // Dashboard is "Home". Clicking "New Quiz" -> goes to StartScreen (which is selection).
        // Let's assume App.jsx handles "view" based on state. 
        // We can add a temporary 'view' state component or just reuse quizStatus 'idle' but we need to differentiate Dashboard vs Start.
        // Let's add `setView` to store or just pass a prop?
        // Actually easier: In App.jsx, if user && quizStatus === 'idle', we can show Dashboard OR StartScreen.
        // Let's add a local state in Store for `currentView`? 
        // modifying store for 'currentView': 'dashboard' | 'start'
        useQuiz.setState({ currentView: 'start' });
    };

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8 p-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Hello, {user} 👋</h1>
                    <p className="text-slate-400">Here's your progress report.</p>
                </div>
                <button
                    onClick={logout}
                    className="p-2 text-slate-400 hover:text-red-400 transition-colors bg-slate-900/50 rounded-lg border border-white/5"
                    title="Logout"
                >
                    <LogOut size={20} />
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: 'Total Tests', value: totalTests, icon: Activity, color: 'text-blue-400' },
                    { label: 'Best Score', value: bestScore, icon: Award, color: 'text-yellow-400' },
                    { label: 'Avg Accuracy', value: `${avgAccuracy}%`, icon: TrendingUp, color: 'text-green-400' }
                ].map((stat) => (
                    <motion.div
                        key={stat.label}
                        className="bg-slate-900/50 border border-white/10 p-6 rounded-2xl flex items-center gap-4"
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className={`p-3 bg-white/5 rounded-xl ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">{stat.value}</div>
                            <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">{stat.label}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Section */}
                <div className="lg:col-span-2 bg-slate-900/50 border border-white/10 p-6 rounded-3xl min-h-[300px]">
                    <h3 className="text-lg font-bold text-white mb-6">Performance Trend</h3>
                    <div className="h-[250px] w-full">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                        itemStyle={{ color: '#60a5fa' }}
                                    />
                                    <Line type="monotone" dataKey="score" stroke="#60a5fa" strokeWidth={3} dot={{ r: 4, fill: '#60a5fa' }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-500">
                                No data yet. Take a quiz!
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions & Recent History */}
                <div className="space-y-4">
                    <button
                        onClick={handleStartNew}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.02]"
                    >
                        <Play fill="currentColor" size={20} />
                        Start New Quiz
                    </button>

                    <div className="bg-slate-900/50 border border-white/10 p-6 rounded-3xl flex-1">
                        <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                            {history.map((h, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                                    <div>
                                        <div className="text-sm font-bold text-slate-200">{h.chapter}</div>
                                        <div className="text-xs text-slate-500">{new Date(h.date).toLocaleDateString()}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-blue-400 font-bold">{h.score} pts</div>
                                        <div className="text-xs text-slate-400">{h.accuracy}% Acc</div>
                                    </div>
                                </div>
                            ))}
                            {history.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No history found.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
