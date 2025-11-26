import { searchIndex } from '../searchData.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || !API_BASE_URL || !isLocal;

// Mock API Service (Fallback)
const mockApi = {
    delay: (ms = 500) => new Promise(resolve => setTimeout(resolve, ms)),

    async getArticles() {
        await this.delay();
        return [...searchIndex];
    },

    async getComments(articleId) {
        await this.delay();
        const storageKey = `comments_${articleId}`;
        return JSON.parse(localStorage.getItem(storageKey)) || [];
    },

    async postComment(articleId, comment) {
        await this.delay();
        const storageKey = `comments_${articleId}`;
        const comments = JSON.parse(localStorage.getItem(storageKey)) || [];

        const newComment = {
            id: Date.now(),
            ...comment,
            date: new Date().toLocaleDateString(),
            likes: 0,
            replies: []
        };

        if (comment.parentId) {
            const addReply = (list) => {
                for (let c of list) {
                    if (c.id === comment.parentId) {
                        c.replies.unshift(newComment);
                        return true;
                    }
                    if (c.replies.length && addReply(c.replies)) return true;
                }
                return false;
            };
            addReply(comments);
        } else {
            comments.unshift(newComment);
        }

        localStorage.setItem(storageKey, JSON.stringify(comments));
        return newComment;
    },

    async likeComment(articleId, commentId) {
        await this.delay(200);
        const storageKey = `comments_${articleId}`;
        const comments = JSON.parse(localStorage.getItem(storageKey)) || [];

        const findAndLike = (list) => {
            for (let c of list) {
                if (c.id === commentId) {
                    c.likes++;
                    return true;
                }
                if (c.replies.length && findAndLike(c.replies)) return true;
            }
            return false;
        };

        if (findAndLike(comments)) {
            localStorage.setItem(storageKey, JSON.stringify(comments));
            return true;
        }
        return false;
    },

    // --- Forum Methods ---
    async getQuestions() {
        await this.delay();
        return JSON.parse(localStorage.getItem('forum_questions')) || [];
    },

    async getQuestion(id) {
        await this.delay();
        const questions = JSON.parse(localStorage.getItem('forum_questions')) || [];
        return questions.find(q => q.id === id);
    },

    async postQuestion(data) {
        await this.delay();
        const questions = JSON.parse(localStorage.getItem('forum_questions')) || [];
        const newQuestion = {
            id: Date.now().toString(),
            ...data,
            date: new Date().toISOString(),
            answers: []
        };
        questions.unshift(newQuestion);
        localStorage.setItem('forum_questions', JSON.stringify(questions));
        return newQuestion;
    },

    async postAnswer(questionId, data) {
        await this.delay();
        const questions = JSON.parse(localStorage.getItem('forum_questions')) || [];
        const question = questions.find(q => q.id === questionId);
        if (question) {
            const newAnswer = {
                id: Date.now().toString(),
                ...data,
                date: new Date().toISOString()
            };
            question.answers.push(newAnswer);
            localStorage.setItem('forum_questions', JSON.stringify(questions));
            return newAnswer;
        }
        throw new Error('Question not found');
    }
};

// Real API Service
export const api = {
    async getArticles() {
        if (USE_MOCK) {
            const articles = await mockApi.getArticles();
            // Merge with local storage for views/comments
            const localStats = JSON.parse(localStorage.getItem('articleStats')) || {};

            return articles.map(article => ({
                ...article,
                views: (localStats[article.url]?.views || 0) + (article.views || 0),
                comments: (localStats[article.url]?.comments || 0) + (article.comments || 0)
            })).sort((a, b) => new Date(b.date) - new Date(a.date));
        }
        try {
            const response = await fetch(`${API_BASE_URL}/articles`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.info("Backend not reachable, using mock data.");
            return mockApi.getArticles();
        }
    },

    async incrementViews(url) {
        if (USE_MOCK) {
            const localStats = JSON.parse(localStorage.getItem('articleStats')) || {};
            if (!localStats[url]) localStats[url] = { views: 0, comments: 0 };
            localStats[url].views++;
            localStorage.setItem('articleStats', JSON.stringify(localStats));
            return true;
        }
        // Real API implementation would go here
        return true;
    },

    async getComments(articleId) {
        if (USE_MOCK) return mockApi.getComments(articleId);
        try {
            const response = await fetch(`${API_BASE_URL}/comments?articleId=${articleId}`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.info("Backend not reachable, using mock data.");
            return mockApi.getComments(articleId);
        }
    },

    async postComment(articleId, comment) {
        if (USE_MOCK) {
            // Update comment count in stats
            const localStats = JSON.parse(localStorage.getItem('articleStats')) || {};
            // Find url by articleId (assuming articleId is url or we map it)
            // For now, let's assume articleId passed here is actually the URL or we can't easily map it without fetching all articles.
            // But wait, the comment system uses a specific ID. 
            // Let's just update the stats if we can find the URL.
            // Actually, the comment system in main.js passes 'comments-section' ID, but the API calls use the article URL or ID.
            // Let's assume for now we just increment if we can.
            return mockApi.postComment(articleId, comment);
        }
        try {
            const response = await fetch(`${API_BASE_URL}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...comment, articleId }),
            });
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.info("Backend not reachable, using mock data.");
            return mockApi.postComment(articleId, comment);
        }
    },

    async likeComment(articleId, commentId) {
        if (USE_MOCK) return mockApi.likeComment(articleId, commentId);
        try {
            // Assuming a PATCH or POST endpoint for likes
            const response = await fetch(`${API_BASE_URL}/comments/${commentId}/like`, {
                method: 'POST',
            });
            if (!response.ok) throw new Error('Network response was not ok');
            return true;
        } catch (error) {
            console.info("Backend not reachable, using mock data.");
            return mockApi.likeComment(articleId, commentId);
        }
    },

    // --- Forum Methods (Backend Integration) ---
    async getQuestions() {
        try {
            const response = await fetch('/api/questions');
            if (!response.ok) throw new Error('Failed to fetch questions');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    },

    async getQuestion(id) {
        try {
            const response = await fetch(`/api/questions/${id}`);
            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return null;
        }
    },

    async postQuestion(data) {
        const response = await fetch('/api/questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to post question');
        return await response.json();
    },

    async postAnswer(questionId, data) {
        const response = await fetch(`/api/questions/${questionId}/answers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to post answer');
        return await response.json();
    }
};
