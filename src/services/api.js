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
    }
};

// Real API Service
export const api = {
    async getArticles() {
        if (USE_MOCK) return mockApi.getArticles();
        try {
            const response = await fetch(`${API_BASE_URL}/articles`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.info("Backend not reachable, using mock data.");
            return mockApi.getArticles();
        }
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
        if (USE_MOCK) return mockApi.postComment(articleId, comment);
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
    }
};
