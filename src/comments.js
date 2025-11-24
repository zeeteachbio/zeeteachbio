import { api } from './services/api.js';

export class CommentSystem {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        // Extract article ID from filename (e.g., 'article-tips.html' -> 'tips')
        // Or just use the full pathname as ID for simplicity
        this.articleId = window.location.pathname.replace(/^\/|\.html$/g, '');
        this.comments = [];
        this.savedSelection = null; // To store cursor position
        this.init();
    }

    async init() {
        if (!this.container) return;
        this.renderForm();
        await this.loadComments();
    }

    async loadComments() {
        try {
            this.comments = await api.getComments(this.articleId);
            this.renderComments();
        } catch (error) {
            console.error("Failed to load comments:", error);
        }
    }

    renderForm() {
        const formHtml = `
            <div class="comment-form">
                <h3>Leave a Comment</h3>
                <div class="toolbar">
                    <button type="button" data-cmd="bold" title="Bold"><b>B</b></button>
                    <button type="button" data-cmd="italic" title="Italic"><i>I</i></button>
                    <button type="button" data-cmd="underline" title="Underline"><u>U</u></button>
                    <button type="button" data-cmd="insertUnorderedList" title="Bullet List">•</button>
                    <button type="button" class="emoji-btn" title="Add Emoji">😀</button>
                    <div class="emoji-picker hidden">
                        <span>😀</span><span>😂</span><span>😍</span><span>🤔</span><span>👍</span><span>👎</span><span>🎉</span><span>🔥</span><span>❤️</span><span>📚</span>
                    </div>
                </div>
                <div class="editor" contenteditable="true" placeholder="Write your comment here..."></div>
                <button class="submit-btn">Post Comment</button>
            </div>
        `;

        // Check if form already exists to avoid duplication
        if (!this.container.querySelector('.comment-form')) {
            this.container.insertAdjacentHTML('afterbegin', formHtml);
            this.attachFormListeners();
        }
    }

    attachFormListeners() {
        const toolbar = this.container.querySelector('.toolbar');
        const editor = this.container.querySelector('.editor');
        const submitBtn = this.container.querySelector('.submit-btn');
        const emojiBtn = this.container.querySelector('.emoji-btn');
        const emojiPicker = this.container.querySelector('.emoji-picker');

        // Save selection when editor loses focus
        editor.addEventListener('blur', () => {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                this.savedSelection = selection.getRangeAt(0);
            }
        });

        toolbar.addEventListener('click', (e) => {
            if (e.target.dataset.cmd) {
                // Restore selection if needed, though execCommand usually handles it if focused
                editor.focus();
                document.execCommand(e.target.dataset.cmd, false, null);
            }
        });

        emojiBtn.addEventListener('click', () => {
            emojiPicker.classList.toggle('hidden');
        });

        emojiPicker.addEventListener('click', (e) => {
            if (e.target.tagName === 'SPAN') {
                // Restore selection before inserting
                editor.focus();
                if (this.savedSelection) {
                    const selection = window.getSelection();
                    selection.removeAllRanges();
                    selection.addRange(this.savedSelection);
                }

                document.execCommand('insertText', false, e.target.innerText);
                emojiPicker.classList.add('hidden');

                // Update saved selection after insertion
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                    this.savedSelection = selection.getRangeAt(0);
                }
            }
        });

        // Close picker when clicking outside
        document.addEventListener('click', (e) => {
            if (!emojiBtn.contains(e.target) && !emojiPicker.contains(e.target)) {
                emojiPicker.classList.add('hidden');
            }
        });

        submitBtn.addEventListener('click', async () => {
            const content = editor.innerHTML;
            if (editor.innerText.trim()) {
                // Optimistic UI update could happen here, but for now we wait
                submitBtn.disabled = true;
                submitBtn.textContent = 'Posting...';

                try {
                    await api.postComment(this.articleId, { content });
                    editor.innerHTML = '';
                    await this.loadComments(); // Reload to get updated list with ID
                } catch (error) {
                    console.error("Failed to post comment:", error);
                    alert("Failed to post comment. Please try again.");
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Post Comment';
                }
            }
        });
    }

    // Helper to find comment in nested structure
    findComment(comments, id) {
        for (let comment of comments) {
            if (comment.id === id) return comment;
            if (comment.replies.length) {
                const found = this.findComment(comment.replies, id);
                if (found) return found;
            }
        }
        return null;
    }

    async likeComment(id) {
        try {
            const success = await api.likeComment(this.articleId, id);
            if (success) {
                // Ideally we'd just update the local state, but reloading is safer for sync
                await this.loadComments();
            }
        } catch (error) {
            console.error("Failed to like comment:", error);
        }
    }

    renderComments() {
        let list = this.container.querySelector('.comments-list');
        if (!list) {
            list = document.createElement('div');
            list.className = 'comments-list';
            this.container.appendChild(list);
        }

        if (this.comments.length === 0) {
            list.innerHTML = '<p class="no-comments">No comments yet. Be the first!</p>';
        } else {
            list.innerHTML = this.comments.map(c => this.createCommentHTML(c)).join('');
        }

        // Re-attach listeners for dynamic elements
        list.querySelectorAll('.like-btn').forEach(btn => {
            // Remove old listeners to prevent duplicates if re-rendering (though innerHTML wipes them)
            btn.onclick = () => this.likeComment(parseInt(btn.dataset.id));
        });

        list.querySelectorAll('.reply-btn').forEach(btn => {
            btn.onclick = () => this.showReplyForm(parseInt(btn.dataset.id));
        });
    }

    createCommentHTML(comment, isReply = false) {
        return `
            <div class="comment ${isReply ? 'reply' : ''}" id="comment-${comment.id}">
                <div class="comment-avatar">👤</div>
                <div class="comment-body">
                    <div class="comment-header">
                        <span class="author">Student</span>
                        <span class="date">${comment.date}</span>
                    </div>
                    <div class="comment-text">${comment.content}</div>
                    <div class="comment-actions">
                        <button class="like-btn" data-id="${comment.id}">👍 ${comment.likes}</button>
                        <button class="reply-btn" data-id="${comment.id}">Reply</button>
                    </div>
                    <div class="reply-form-container" id="reply-form-${comment.id}"></div>
                    ${comment.replies.length ? `<div class="replies">${comment.replies.map(r => this.createCommentHTML(r, true)).join('')}</div>` : ''}
                </div>
            </div>
        `;
    }

    showReplyForm(id) {
        const container = document.getElementById(`reply-form-${id}`);
        if (container.innerHTML) {
            container.innerHTML = ''; // Toggle off
            return;
        }

        container.innerHTML = `
            <div class="reply-input-group">
                <div class="editor small" contenteditable="true" placeholder="Write a reply..."></div>
                <button class="submit-reply-btn">Reply</button>
            </div>
        `;

        const btn = container.querySelector('.submit-reply-btn');
        const editor = container.querySelector('.editor');

        // Focus the editor immediately
        editor.focus();

        btn.addEventListener('click', async () => {
            if (editor.innerText.trim()) {
                btn.disabled = true;
                btn.textContent = '...';

                try {
                    await api.postComment(this.articleId, {
                        content: editor.innerHTML,
                        parentId: id
                    });
                    container.innerHTML = '';
                    await this.loadComments();
                } catch (error) {
                    console.error("Failed to post reply:", error);
                    alert("Failed to post reply.");
                    btn.disabled = false;
                    btn.textContent = 'Reply';
                }
            }
        });
    }
}
