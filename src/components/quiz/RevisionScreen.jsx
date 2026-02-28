import React from 'react';
import { useQuiz } from '../../store/quizStore';
import { PlayCircle, GraduationCap, BookOpen, AlertCircle, Maximize2, Minimize2 } from 'lucide-react';
import { motion } from 'framer-motion';

const fractionData = [
    { fraction: "1/1", percentage: "100%" },
    { fraction: "1/2", percentage: "50%" },
    { fraction: "1/3", percentage: "33 1/3%" },
    { fraction: "1/4", percentage: "25%" },
    { fraction: "1/5", percentage: "20%" },
    { fraction: "1/6", percentage: "16 2/3%" },
    { fraction: "1/7", percentage: "14 2/7%" },
    { fraction: "1/8", percentage: "12 1/2%" },
    { fraction: "1/9", percentage: "11 1/9%" },
    { fraction: "1/10", percentage: "10%" },
    { fraction: "1/11", percentage: "9 1/11%" },
    { fraction: "1/12", percentage: "8 1/3%" },
    { fraction: "1/13", percentage: "7 9/13%" },
    { fraction: "1/14", percentage: "7 1/7%" },
    { fraction: "1/15", percentage: "6 2/3%" },
    { fraction: "1/20", percentage: "5%" },
    { fraction: "1/25", percentage: "4%" },
    { fraction: "1/40", percentage: "2 1/2%" },
];

export default function RevisionScreen() {
    const { startRealQuiz, filters, polityNotes, staticGkNotes, historyNotes, geographyNotes, economicsNotes, physicsNotes, chemistryNotes, biologyNotes, currentAffairsNotes, math1Notes, math2Notes } = useQuiz();
    const [isExpanded, setIsExpanded] = React.useState(false);

    const isGkGs = filters.subject === 'GK/GS';
    const isMaths = filters.subject === 'Maths 1' || filters.subject === 'Maths 2';

    // Get notes for the selected topics
    let selectedTopicsNotes = [];
    if (isGkGs) {
        let currentNotesSource = filters.gkgsSubject === 'History' ? historyNotes : (filters.gkgsSubject === 'Polity' ? polityNotes : (filters.gkgsSubject === 'Geography' ? geographyNotes : (filters.gkgsSubject === 'Economics' ? economicsNotes : (filters.gkgsSubject === 'Physics' ? physicsNotes : (filters.gkgsSubject === 'Chemistry' ? chemistryNotes : (filters.gkgsSubject === 'Biology' ? biologyNotes : (filters.gkgsSubject === 'Current Affairs' ? currentAffairsNotes : staticGkNotes)))))));

        if (filters.gkgsSubject === 'History') {
            currentNotesSource = currentNotesSource.filter(n => n.category === filters.historyCategory);
        }

        let topicsToFetch = filters.gkgsTopics || [];
        if (topicsToFetch.length === 0 || topicsToFetch.includes('All')) {
            // If all, get all topics
            topicsToFetch = currentNotesSource.map(n => n.topic);
        }
        selectedTopicsNotes = currentNotesSource.filter(n => topicsToFetch.includes(n.topic));
    } else if (isMaths) {
        const currentNotes = filters.subject === 'Maths 1' ? math1Notes : math2Notes;
        if (currentNotes) {
            selectedTopicsNotes = currentNotes.filter(n => n.topic === filters.chapter || n.chapter === filters.chapter);
        }
    }

    return (
        <div className={`flex flex-col items-center justify-center min-h-[80vh] w-full mx-auto p-6 transition-all duration-300 ${isExpanded ? 'max-w-7xl' : 'max-w-4xl'}`}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 w-full shadow-2xl"
            >
                <div className="flex justify-end mb-2">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 rounded-lg border border-slate-600/50 transition-colors flex items-center gap-2"
                        title={isExpanded ? "Minimize view" : "Expand for easier reading"}
                    >
                        {isExpanded ? <><Minimize2 size={18} /> <span className="text-sm font-medium">Minimize</span></> : <><Maximize2 size={18} /> <span className="text-sm font-medium">Expand Notes</span></>}
                    </button>
                </div>
                <div className="text-center mb-8">
                    <div className="flex justify-center items-center gap-3 mb-2">
                        {isGkGs || selectedTopicsNotes.length > 0 ? <BookOpen size={40} className="text-blue-400" /> : <GraduationCap size={40} className="text-yellow-400" />}
                        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 uppercase tracking-wider">
                            {isGkGs ? `${filters.gkgsSubject} Quick Revision` : (selectedTopicsNotes.length > 0 ? `${filters.chapter} Notes` : 'Speed Booster Hacks')}
                        </h1>
                    </div>
                    <p className="text-slate-400 text-lg">
                        {isGkGs || selectedTopicsNotes.length > 0 ? 'Quickly review these key points before starting the quiz.' : 'Fraction to Percentage Conversion'}
                    </p>
                </div>

                {!isGkGs && selectedTopicsNotes.length === 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        {fractionData.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex justify-between items-center bg-slate-800/50 border border-white/5 rounded-xl px-6 py-4 hover:bg-slate-800 hover:border-blue-500/30 transition-all group"
                            >
                                <span className="text-xl font-bold text-blue-400 font-mono group-hover:text-blue-300 mx-auto">{item.fraction}</span>
                                <span className="text-slate-600 font-bold">=</span>
                                <span className="text-xl font-bold text-white font-mono group-hover:text-yellow-400 mx-auto">{item.percentage}</span>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className={`w-full mb-8 overflow-y-auto pr-4 custom-scrollbar space-y-6 transition-all duration-300 ${isExpanded ? 'max-h-[70vh]' : 'max-h-[50vh]'}`}>
                        {selectedTopicsNotes.length > 0 ? (
                            selectedTopicsNotes.map((topicNode, idx) => (
                                <motion.div
                                    key={topicNode.topic}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 text-left"
                                >
                                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-700/50">
                                        <AlertCircle size={24} className="text-blue-400" />
                                        <h3 className="text-xl font-bold text-white">Notes: {topicNode.topic}</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {Array.isArray(topicNode.notes) ? topicNode.notes.map((note, i) => {
                                            if (typeof note === 'object' && note.subtopic) {
                                                return (
                                                    <div key={i} className="mb-4">
                                                        <h4 className="text-blue-300 font-semibold mb-2">{note.subtopic}</h4>
                                                        <ul className="list-disc pl-5 space-y-2 text-slate-300 text-sm leading-relaxed">
                                                            {note.points.map((point, j) => (
                                                                <li key={j}>{point}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                );
                                            } else {
                                                return (
                                                    <ul key={i} className="list-disc pl-5 text-slate-300 text-sm leading-relaxed">
                                                        <li>{note}</li>
                                                    </ul>
                                                );
                                            }
                                        }) : <p>{topicNode.notes}</p>}
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center text-slate-400 py-8">
                                No revision notes available for the selected topics.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex justify-center pt-4">
                    <button
                        onClick={startRealQuiz}
                        className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl font-bold text-white shadow-lg hover:shadow-blue-500/25 transition-all transform hover:-translate-y-1 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <div className="flex items-center gap-3 relative z-10">
                            <span>Ready for Quiz</span>
                            <PlayCircle size={24} className="group-hover:scale-110 transition-transform" />
                        </div>
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
