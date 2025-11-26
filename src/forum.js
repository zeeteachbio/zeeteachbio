import { api } from './services/api.js';
import { authService } from './services/authService.js';

const initForum = async () => {
    // Views
    const landingView = document.getElementById('landing-view');
    const loginView = document.getElementById('login-view');
    const signupView = document.getElementById('signup-view');
    const verifyView = document.getElementById('verify-view');
    const forgotView = document.getElementById('forgot-view');
    const resetView = document.getElementById('reset-view');
    const listView = document.getElementById('list-view');
    const createView = document.getElementById('create-view');
    const detailView = document.getElementById('detail-view');

    // Buttons & Forms
    const toLoginBtn = document.getElementById('to-login-btn');
    const toSignupBtn = document.getElementById('to-signup-btn');
    const backToLandingLogin = document.getElementById('back-to-landing-from-login');
    const backToLandingSignup = document.getElementById('back-to-landing-from-signup');
    const forgotPasswordBtn = document.getElementById('forgot-password-btn');
    const backToLoginForgot = document.getElementById('back-to-login-from-forgot');
    const resendCodeBtn = document.getElementById('resend-code-btn');

    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const verifyForm = document.getElementById('verify-form');
    const forgotForm = document.getElementById('forgot-form');
    const resetForm = document.getElementById('reset-form');

    // Inputs
    const loginEmailInput = document.getElementById('login-email');
    const loginPasswordInput = document.getElementById('login-password');

    const signupNameInput = document.getElementById('signup-name');
    const signupEmailInput = document.getElementById('signup-email');
    const signupPasswordInput = document.getElementById('signup-password');
    const captchaInput = document.getElementById('captcha-input');
    const captchaQuestion = document.getElementById('captcha-question');

    const verifyCodeInput = document.getElementById('verify-code');
    const verifyEmailDisplay = document.getElementById('verify-email-display');

    const forgotEmailInput = document.getElementById('forgot-email');
    const resetCodeInput = document.getElementById('reset-code');
    const newPasswordInput = document.getElementById('new-password');

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

    let currentUser = JSON.parse(localStorage.getItem('forum_user_session'));
    let currentQuestionId = null;
    let pendingEmail = null; // For verification flow
    let captchaAnswer = 0;

    // --- Navigation & View Management ---
    const showView = (view) => {
        [landingView, loginView, signupView, verifyView, forgotView, resetView, listView, createView, detailView].forEach(el => {
            if (el) el.classList.add('hidden');
        });
        if (view) view.classList.remove('hidden');
    };

    const updateAuth = () => {
        if (currentUser) {
            userDisplay.textContent = `Hi, ${currentUser.name}`;
            showView(listView);
            loadQuestions();
        } else {
            showView(landingView);
        }
    };

    // --- CAPTCHA Logic ---
    const generateCaptcha = () => {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        captchaAnswer = num1 + num2;
        if (captchaQuestion) captchaQuestion.textContent = `${num1} + ${num2} = ?`;
        if (captchaInput) captchaInput.value = '';
    };

    // --- Auth Navigation ---
    toLoginBtn?.addEventListener('click', () => showView(loginView));
    toSignupBtn?.addEventListener('click', () => {
        generateCaptcha();
        showView(signupView);
    });
    backToLandingLogin?.addEventListener('click', () => showView(landingView));
    backToLandingSignup?.addEventListener('click', () => showView(landingView));
    forgotPasswordBtn?.addEventListener('click', () => showView(forgotView));
    backToLoginForgot?.addEventListener('click', () => showView(loginView));

    // --- Auth Logic ---
    const validateGmail = (email) => {
        return email && email.toLowerCase().endsWith('@gmail.com');
    };

    // LOGIN
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = loginEmailInput.value.trim();
        const password = loginPasswordInput.value;

        if (!validateGmail(email)) {
            alert('Please enter a valid Gmail address');
            return;
        }

        try {
            const result = await authService.signIn(email, password);
            if (result.success) {
                currentUser = result.user;
                localStorage.setItem('forum_user_session', JSON.stringify(currentUser));
                updateAuth();
            }
        } catch (error) {
            alert(error.message);
            if (error.message.includes('not verified')) {
                pendingEmail = email;
                verifyEmailDisplay.textContent = email;
                showView(verifyView);
            }
        }
    });

    // SIGN UP
    signupForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = signupNameInput.value.trim();
        const email = signupEmailInput.value.trim();
        const password = signupPasswordInput.value;
        const captcha = parseInt(captchaInput.value);

        if (captcha !== captchaAnswer) {
            alert('Incorrect security answer. Please try again.');
            generateCaptcha();
            return;
        }

        if (!validateGmail(email)) {
            alert('Please enter a valid Gmail address');
            return;
        }

        try {
            const result = await authService.signUp(name, email, password);
            if (result.success) {
                // Show mock verification code
                alert(`[DEMO] Verification Code: ${result.verificationCode}`);

                pendingEmail = email;
                verifyEmailDisplay.textContent = email;
                showView(verifyView);
            }
        } catch (error) {
            alert(error.message);
        }
    });

    // VERIFY
    verifyForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const code = verifyCodeInput.value.trim();

        try {
            const result = await authService.verifyEmail(pendingEmail, code);
            if (result.success) {
                alert('Email verified! Please sign in.');
                showView(loginView);
            }
        } catch (error) {
            alert(error.message);
        }
    });

    resendCodeBtn?.addEventListener('click', async () => {
        // In a real app, call resend endpoint. Here we just simulate.
        alert('A new code has been sent (check console/demo alert).');
    });

    // FORGOT PASSWORD
    forgotForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = forgotEmailInput.value.trim();

        if (!validateGmail(email)) {
            alert('Please enter a valid Gmail address');
            return;
        }

        try {
            const result = await authService.requestPasswordReset(email);
            if (result.resetCode) {
                alert(`[DEMO] Reset Code: ${result.resetCode}`);
            }
            pendingEmail = email; // Reuse this for reset flow
            showView(resetView);
        } catch (error) {
            alert(error.message);
        }
    });

    // RESET PASSWORD
    resetForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const code = resetCodeInput.value.trim();
        const newPassword = newPasswordInput.value;

        try {
            const result = await authService.resetPassword(pendingEmail, code, newPassword);
            if (result.success) {
                alert('Password updated. Please sign in.');
                showView(loginView);
            }
        } catch (error) {
            alert(error.message);
        }
    });

    logoutBtn?.addEventListener('click', () => {
        currentUser = null;
        localStorage.removeItem('forum_user_session');
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

    newTopicBtn?.addEventListener('click', () => {
        showView(createView);
    });

    // --- Create Question Logic ---
    cancelCreateBtn?.addEventListener('click', () => {
        showView(listView);
    });

    createTopicForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = topicTitleInput.value.trim();
        const content = topicContentInput.value.trim();

        if (title && content) {
            try {
                await api.postQuestion({
                    title,
                    content,
                    author: currentUser.name
                });
                // Reset form
                topicTitleInput.value = '';
                topicContentInput.value = '';
                showView(listView);
                loadQuestions();
            } catch (error) {
                alert('Failed to post question');
            }
        }
    });

    // --- Question Detail Logic ---
    const loadQuestionDetail = async (id) => {
        currentQuestionId = id;
        showView(detailView);
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

    backToListBtn?.addEventListener('click', () => {
        currentQuestionId = null;
        showView(listView);
        loadQuestions(); // Refresh to update answer counts
    });

    // --- Reply Logic ---
    replyForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const content = replyContentInput.value.trim();

        if (content && currentQuestionId) {
            try {
                const newAnswer = await api.postAnswer(currentQuestionId, {
                    content,
                    author: currentUser.name
                });

                replyContentInput.value = '';

                // Optimistically append or reload
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
