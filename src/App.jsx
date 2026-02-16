import React from 'react';
import { useQuiz } from './store/quizStore';
import Layout from './components/ui/Layout';
import StartScreen from './components/quiz/StartScreen';
import QuizScreen from './components/quiz/QuizScreen';
import ResultScreen from './components/quiz/ResultScreen';
import LoginScreen from './components/auth/LoginScreen';
import DashboardScreen from './components/dashboard/DashboardScreen';
import { AnimatePresence, motion } from 'framer-motion';

export default function App() {
  const { quizStatus, user, currentView } = useQuiz();

  return (
    <Layout>
      <AnimatePresence mode="wait">
        {!user ? (
          <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LoginScreen />
          </motion.div>
        ) : quizStatus === 'idle' ? (
          currentView === 'dashboard' ? (
            <motion.div key="dashboard" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <DashboardScreen />
            </motion.div>
          ) : (
            <motion.div key="start" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <StartScreen />
            </motion.div>
          )
        ) : quizStatus === 'running' ? (
          <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <QuizScreen />
          </motion.div>
        ) : (
          <motion.div key="result" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}>
            <ResultScreen />
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}


