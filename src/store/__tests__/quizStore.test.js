import { describe, it, expect, beforeEach } from 'vitest';
import { useQuiz } from '../quizStore';

// Reset store helper
const resetStore = () => {
    useQuiz.setState({
        filters: {
            subject: 'Maths',
            mathsVersion: 'Maths 2',
            chapter: 'All',
            type: 'All',
            gkgsSubject: 'Static GK',
            gkgsTopics: [],
            historyCategory: 'Ancient',
            topic: 'Idioms'
        },
        timerMode: 'question',
        questionCount: 'all',
        quizStatus: 'idle',
        currentQuestionIndex: 0,
        answers: {},
        score: 0,
        filteredQuestions: [],
        user: null,
        history: [],
        metadata: null,
        timerConfig: null,
        isAppReady: false,
    });
};

describe('quizStore — filter actions', () => {
    beforeEach(resetStore);

    it('setFilter updates a filter key', () => {
        useQuiz.getState().setFilter('subject', 'English');
        expect(useQuiz.getState().filters.subject).toBe('English');
    });

    it('setTimerMode updates timerMode', () => {
        useQuiz.getState().setTimerMode('overall');
        expect(useQuiz.getState().timerMode).toBe('overall');
    });

    it('setQuestionCount updates questionCount', () => {
        useQuiz.getState().setQuestionCount(20);
        expect(useQuiz.getState().questionCount).toBe(20);
    });
});

describe('quizStore — user actions', () => {
    beforeEach(() => {
        resetStore();
        localStorage.clear();
    });

    it('login sets user and loads history from localStorage', () => {
        const mockHistory = [{ score: 10, total: 20, date: '2026-01-01' }];
        localStorage.setItem('quiz_history_testuser', JSON.stringify(mockHistory));

        useQuiz.getState().login('testuser');

        expect(useQuiz.getState().user).toBe('testuser');
        expect(useQuiz.getState().history).toEqual(mockHistory);
    });

    it('logout clears user', () => {
        useQuiz.setState({ user: 'testuser', history: [{}] });
        useQuiz.getState().logout();
        expect(useQuiz.getState().user).toBeNull();
        expect(useQuiz.getState().history).toEqual([]);
    });

    it('saveResult stores result in history and localStorage', () => {
        useQuiz.setState({ user: 'testuser', history: [] });
        const result = { score: 15, total: 20 };
        useQuiz.getState().saveResult(result);

        expect(useQuiz.getState().history[0]).toEqual(result);
        const stored = JSON.parse(localStorage.getItem('quiz_history_testuser') || '[]');
        expect(stored[0]).toEqual(result);
    });

    it('saveResult is a no-op when no user is logged in', () => {
        const before = useQuiz.getState().history;
        useQuiz.getState().saveResult({ score: 5 });
        expect(useQuiz.getState().history).toEqual(before);
    });
});

describe('quizStore — quiz flow', () => {
    beforeEach(resetStore);

    it('submitAnswer records the answer', () => {
        useQuiz.setState({
            filteredQuestions: [{ id: 'q1', question: 'Test?', correct_option: 'A' }],
            quizStatus: 'running',
        });
        useQuiz.getState().submitAnswer('q1', 'A');
        expect(useQuiz.getState().answers['q1']).toBe('A');
    });

    it('submitAnswer gives +2 score for correct answer', () => {
        useQuiz.setState({
            filteredQuestions: [{ id: 'q1', correct_option: 'A' }],
            quizStatus: 'running',
            score: 0,
        });
        useQuiz.getState().submitAnswer('q1', 'A');
        expect(useQuiz.getState().score).toBe(2);
    });

    it('submitAnswer gives -0.5 score for wrong answer', () => {
        useQuiz.setState({
            filteredQuestions: [{ id: 'q1', correct_option: 'A' }],
            quizStatus: 'running',
            score: 0,
        });
        useQuiz.getState().submitAnswer('q1', 'B');
        expect(useQuiz.getState().score).toBe(-0.5);
    });
});
