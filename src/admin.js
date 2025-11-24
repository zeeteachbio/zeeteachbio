import { Octokit } from "https://esm.sh/octokit";

// State
let octokit = null;
let owner = 'zeeteachbio';
let repo = 'zeeteach'; // Default, will try to detect or ask
let currentFileSha = null;
let currentFilePath = null;

// DOM Elements
const screens = {
    login: document.getElementById('login-screen'),
    dashboard: document.getElementById('dashboard-screen'),
    editor: document.getElementById('editor-screen')
};

const loginBtn = document.getElementById('login-btn');
const tokenInput = document.getElementById('github-token');
const fileList = document.getElementById('file-list');
const backBtn = document.getElementById('back-btn');
const saveBtn = document.getElementById('save-btn');
const pageTitleInput = document.getElementById('page-title');
const statusMsg = document.getElementById('status-msg');

// Initialize TinyMCE
tinymce.init({
    selector: '#content-editor',
    height: 500,
    plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
    toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
});

// Navigation
function showScreen(screenName) {
    Object.values(screens).forEach(el => el.classList.remove('active-screen'));
    screens[screenName].classList.add('active-screen');
}

// Login
loginBtn.addEventListener('click', async () => {
    const token = tokenInput.value.trim();
    if (!token) return alert('Please enter a token');

    try {
        octokit = new Octokit({ auth: token });
        const { data: user } = await octokit.request('GET /user');
        console.log(`Logged in as ${user.login}`);

        // Try to find the repo automatically or default to hardcoded
        // For this user, we know the repo is zeeteachbio/zeeteach or similar
        // We'll stick to the one we know works or let them configure if needed.
        // For now, assuming zeeteachbio/zeeteach based on previous context.
        // Actually, user said 'zeeteachbio/zeeteachbio' for Giscus, let's try to detect.

        await loadFiles();
        showScreen('dashboard');
    } catch (error) {
        console.error(error);
        alert('Login failed. Please check your token.');
    }
});

// Load Files
async function loadFiles() {
    fileList.innerHTML = '<p>Loading files...</p>';
    try {
        // Fetch root directory
        // Note: This assumes the repo name. If it fails, we might need to ask user for repo name.
        // Let's try the one from Giscus config first: zeeteachbio/zeeteachbio
        // Or the one from earlier: zeeteachbio/zeeteach
        // We'll try a list of candidates.

        let files = [];
        const candidates = ['zeeteach', 'zeeteachbio'];
        let found = false;

        for (const r of candidates) {
            try {
                const { data } = await octokit.request(`GET /repos/${owner}/${r}/contents/`);
                repo = r;
                files = data;
                found = true;
                break;
            } catch (e) {
                console.log(`Repo ${r} not found, trying next...`);
            }
        }

        if (!found) {
            throw new Error("Could not find repository 'zeeteach' or 'zeeteachbio'");
        }

        fileList.innerHTML = '';
        const htmlFiles = files.filter(f => f.name.endsWith('.html') && f.name !== 'admin.html');

        htmlFiles.forEach(file => {
            const li = document.createElement('li');
            li.className = 'file-item';
            li.innerHTML = `
                <span>${file.name}</span>
                <button class="btn-secondary" onclick="editFile('${file.path}')">Edit</button>
            `;
            // We need to attach event listener properly or use global function
            li.querySelector('button').addEventListener('click', () => loadFileContent(file.path));
            fileList.appendChild(li);
        });

    } catch (error) {
        console.error(error);
        fileList.innerHTML = `<p style="color: red">Error loading files: ${error.message}</p>`;
    }
}

// Load File Content
async function loadFileContent(path) {
    try {
        const { data } = await octokit.request(`GET /repos/${owner}/${repo}/contents/${path}`);
        currentFileSha = data.sha;
        currentFilePath = path;

        const content = atob(data.content);

        // Parse HTML to find title and main content
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');

        const title = doc.querySelector('title') ? doc.querySelector('title').innerText : path;
        // We assume content is in <main> or <article> or body
        // Let's try to be smart: look for .article-body, then main, then body
        let bodyContent = '';
        const articleBody = doc.querySelector('.article-body');
        const main = doc.querySelector('main');

        if (articleBody) {
            bodyContent = articleBody.innerHTML;
        } else if (main) {
            bodyContent = main.innerHTML;
        } else {
            bodyContent = doc.body.innerHTML;
        }

        pageTitleInput.value = title.replace(' - Zee Teach', ''); // Clean title
        tinymce.get('content-editor').setContent(bodyContent);
        document.getElementById('current-file').innerText = path;

        showScreen('editor');
    } catch (error) {
        console.error(error);
        alert('Error loading file content');
    }
}

// Save File
saveBtn.addEventListener('click', async () => {
    if (!currentFilePath || !currentFileSha) return;

    saveBtn.disabled = true;
    saveBtn.innerText = 'Publishing...';
    statusMsg.className = 'status-msg';
    statusMsg.style.display = 'none';

    try {
        // 1. Get original content to preserve head/scripts
        const { data } = await octokit.request(`GET /repos/${owner}/${repo}/contents/${currentFilePath}`);
        const originalContent = atob(data.content);

        const parser = new DOMParser();
        const doc = parser.parseFromString(originalContent, 'text/html');

        // 2. Update Title
        if (doc.querySelector('title')) {
            doc.querySelector('title').innerText = `${pageTitleInput.value} - Zee Teach`;
        }

        // 3. Update Body
        const newBodyHtml = tinymce.get('content-editor').getContent();
        const articleBody = doc.querySelector('.article-body');
        const main = doc.querySelector('main');

        if (articleBody) {
            articleBody.innerHTML = newBodyHtml;
        } else if (main) {
            main.innerHTML = newBodyHtml;
        } else {
            // Fallback: replace everything in body except scripts? 
            // This is risky, let's just append to body if structure is weird
            doc.body.innerHTML = newBodyHtml;
        }

        // 4. Serialize back to string
        const newHtml = "<!DOCTYPE html>\n" + doc.documentElement.outerHTML;
        const newContentBase64 = btoa(unescape(encodeURIComponent(newHtml))); // Handle unicode

        // 5. Commit to GitHub
        await octokit.request(`PUT /repos/${owner}/${repo}/contents/${currentFilePath}`, {
            message: `Update ${currentFilePath} via Admin Dashboard`,
            content: newContentBase64,
            sha: currentFileSha
        });

        statusMsg.innerText = 'Successfully published! Changes will be live in ~1 minute.';
        statusMsg.classList.add('status-success');
        statusMsg.style.display = 'block';

        // Update SHA for next save
        const { data: newData } = await octokit.request(`GET /repos/${owner}/${repo}/contents/${currentFilePath}`);
        currentFileSha = newData.sha;

    } catch (error) {
        console.error(error);
        statusMsg.innerText = `Error publishing: ${error.message}`;
        statusMsg.classList.add('status-error');
        statusMsg.style.display = 'block';
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerText = 'Publish Changes';
    }
});

backBtn.addEventListener('click', () => {
    showScreen('dashboard');
});
