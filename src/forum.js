import { api } from './services/api.js';

const initForum = async () => {
    const app = document.getElementById('app');
    const loginView = document.getElementById('login-view');
    const listView = document.getElementById('list-view');
    const createView = document.getElementById('create-view');
    const detailView = document.getElementById('detail-view');

    const usernameInput = document.getElementById('username');
    const loginForm = document.getElementById('login-form');
    const userDisplay = document.getElementById('user-display');
    const logoutBtn = document.getElementById('logout-btn');

    const topicsContainer = document.getElementById('topics-container');
    const newTopicBtn = document.getElementById('new-topic-btn');

    const createTopicForm = document.getElementById('create-topic-form');
    const cancelCreateBtn = document.getElementById('cancel-create-btn');
    const topicTitleInput = document.getElementById('topic-title');
    const topicContentInput = document.getElementById('topic-content');

    const questionDisplay = document.getElementById('question-display');
    const answersContainer = document.getElementById('answers-container');
    const backToListBtn = document.getElementById('back-to-list-btn');
    const replyForm = document.getElementById('reply-form');
    const replyContentInput = document.getElementById('reply-content');

    let currentUser = localStorage.getItem('forum_user');
    let currentQuestionId = null;

    // --- Navigation & View Management ---
    const showView = (viewId) => {
        [loginView, listView, createView, detailView].forEach(el => el.classList.add('hidden'));
        document.getElementById(viewId).classList.remove('hidden');
    };

    const updateAuth = () => {
        if (currentUser) {
            userDisplay.textContent = `Hi, ${currentUser}`;
            showView('list-view');
            loadQuestions();
        } else {
            showView('login-view');
        }
    };

    // --- Auth Logic ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = usernameInput.value.trim();
        if (name) {
            currentUser = name;
            localStorage.setItem('forum_user', name);
            updateAuth();
        }
    });

    logoutBtn.addEventListener('click', () => {
        currentUser = null;
        localStorage.removeItem('forum_user');
        updateAuth();
    });

    // --- Questions List Logic ---
    const loadQuestions = async () => {
        topicsContainer.innerHTML = '<div style="text-align:center; padding: 2rem;">Loading...</div>';
        try {
            const questions = await api.getQuestions();
            if (questions.length === 0) {
                topicsContainer.innerHTML = '<div style="text-align:center; padding: 2rem; color: #666;">No questions yet. Be the first to ask!</div>';
                return;
            }

            topicsContainer.innerHTML = questions.map(q => `
                <div class="topic-card" data-id="${q.id}">
                    <div class="topic-meta">
                        <span>Posted by <strong>${q.author}</strong></span>
                        <span>${new Date(q.date).toLocaleDateString()} &bull; ${q.answers.length} answers</span>
                    </div>
                    <h3 class="topic-title">${q.title}</h3>
                    <p class="topic-preview">${q.content}</p>
                </div>
            `).join('');

            // Add click listeners
            document.querySelectorAll('.topic-card').forEach(card => {
                card.addEventListener('click', () => loadQuestionDetail(card.dataset.id));
            });
        } catch (error) {
            console.error(error);
            topicsContainer.innerHTML = '<div style="color:red; text-align:center;">Failed to load questions.</div>';
        }
    };

    newTopicBtn.addEventListener('click', () => {
        showView('create-view');
    });

    // --- Create Question Logic ---
    cancelCreateBtn.addEventListener('click', () => {
        showView('list-view');
    });

    createTopicForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = topicTitleInput.value.trim();
        const content = topicContentInput.value.trim();

        if (title && content) {
            try {
                await api.postQuestion({
                    title,
                    content,
                    author: currentUser
                });
                // Reset form
                topicTitleInput.value = '';
                topicContentInput.value = '';
                showView('list-view');
                loadQuestions();
            } catch (error) {
                alert('Failed to post question');
            }
        }
    });

    // --- Question Detail Logic ---
    const loadQuestionDetail = async (id) => {
        currentQuestionId = id;
        showView('detail-view');
        questionDisplay.innerHTML = 'Loading...';
        answersContainer.innerHTML = '';

        try {
            const question = await api.getQuestion(id);
            if (!question) {
                questionDisplay.innerHTML = 'Question not found.';
                return;
            }

            questionDisplay.innerHTML = `
                <div class="detail-card">
                    <div class="topic-meta">
                        <span>Posted by <strong>${question.author}</strong> on ${new Date(question.date).toLocaleString()}</span>
                    </div>
                    <h1 class="topic-title" style="font-size: 1.75rem; margin-bottom: 1rem;">${question.title}</h1>
                    <div style="line-height: 1.6; white-space: pre-wrap;">${question.content}</div>
                </div>
            `;

            renderAnswers(question.answers);

        } catch (error) {
            console.error(error);
            questionDisplay.innerHTML = 'Error loading question.';
        }
    };

    const renderAnswers = (answers) => {
        if (answers.length === 0) {
            answersContainer.innerHTML = '<p style="color: #666;">No answers yet.</p>';
        } else {
            answersContainer.innerHTML = answers.map(a => `
                <div class="answer-card">
                    <div class="topic-meta">
                        <span><strong>${a.author}</strong> answered on ${new Date(a.date).toLocaleString()}</span>
                    </div>
                    <div style="line-height: 1.6; white-space: pre-wrap;">${a.content}</div>
                </div>
            `).join('');
        }
    };

    backToListBtn.addEventListener('click', () => {
        currentQuestionId = null;
        showView('list-view');
        loadQuestions(); // Refresh to update answer counts
    });

    // --- Reply Logic ---
    replyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const content = replyContentInput.value.trim();

        if (content && currentQuestionId) {
            try {
                const newAnswer = await api.postAnswer(currentQuestionId, {
                    content,
                    author: currentUser
                });

                replyContentInput.value = '';

                // Optimistically append or reload
                // Let's reload the question data to be safe
                const question = await api.getQuestion(currentQuestionId);
                renderAnswers(question.answers);

            } catch (error) {
                alert('Failed to post answer');
            }
        }
    });

    // Initialize
    updateAuth();
};

// Run
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initForum);
} else {
    initForum();
}
