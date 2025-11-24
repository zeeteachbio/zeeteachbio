import { Octokit } from "https://esm.sh/octokit";

// State
let octokit = null;
let owner = 'zeeteachbio';
let repo = 'zeeteach';
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

// New Article Elements
const newArticleBtn = document.getElementById('new-article-btn');
const newArticleModal = document.getElementById('new-article-modal');
const createNewBtn = document.getElementById('create-new-btn');
const cancelNewBtn = document.getElementById('cancel-new-btn');
const newFilenameInput = document.getElementById('new-filename');
const newTitleInput = document.getElementById('new-title');

// Initialize Quill
const quill = new Quill('#content-editor', {
    theme: 'snow',
    modules: {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'script': 'sub' }, { 'script': 'super' }],
            [{ 'color': [] }, { 'background': [] }],
            ['link', 'image', 'video'],
            ['clean']
        ]
    }
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

        // Also fetch src/searchData.js to allow editing it
        let searchDataFile = null;
        try {
            const { data } = await octokit.request(`GET /repos/${owner}/${repo}/contents/src/searchData.js`);
            searchDataFile = data;
        } catch (e) {
            console.log("searchData.js not found in src/");
        }

        fileList.innerHTML = '';

        // Helper to create file item
        const createFileItem = (file, label = null) => {
            const li = document.createElement('li');
            li.className = 'file-item';
            li.innerHTML = `
                <span>${label || file.name}</span>
                <button class="btn-secondary" onclick="editFile('${file.path}')">Edit</button>
            `;
            li.querySelector('button').addEventListener('click', () => loadFileContent(file.path));
            return li;
        };

        // 1. Search Data
        if (searchDataFile) {
            const li = createFileItem(searchDataFile, '<strong>src/searchData.js</strong> (Edit Search Index)');
            li.style.borderLeft = "4px solid #f59e0b";
            fileList.appendChild(li);
        }

        const htmlFiles = files.filter(f => f.name.endsWith('.html') && f.name !== 'admin.html');

        // Grouping Logic
        const groups = {
            'Class 9': [],
            'Class 10': [],
            'Class 11': [],
            'Class 12': [],
            'General Articles': [],
            'Pages': []
        };

        htmlFiles.forEach(file => {
            if (file.name.includes('class9')) groups['Class 9'].push(file);
            else if (file.name.includes('class10')) groups['Class 10'].push(file);
            else if (file.name.includes('class11')) groups['Class 11'].push(file);
            else if (file.name.includes('class12')) groups['Class 12'].push(file);
            else if (file.name.startsWith('article-')) groups['General Articles'].push(file);
            else groups['Pages'].push(file);
        });

        // Render Groups
        Object.entries(groups).forEach(([groupName, groupFiles]) => {
            if (groupFiles.length === 0) return;

            const groupHeader = document.createElement('li');
            groupHeader.style.padding = '1rem 0.5rem 0.5rem';
            groupHeader.style.fontWeight = '700';
            groupHeader.style.color = 'var(--color-primary)';
            groupHeader.style.borderBottom = '2px solid var(--color-border)';
            groupHeader.style.marginTop = '1rem';
            groupHeader.innerText = groupName;
            fileList.appendChild(groupHeader);

            groupFiles.forEach(file => {
                fileList.appendChild(createFileItem(file));
            });
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

        // FIX: Correctly decode UTF-8 content
        const content = decodeURIComponent(escape(atob(data.content)));

        if (path.endsWith('.js')) {
            // Text editor for JS files
            pageTitleInput.value = path;
            pageTitleInput.disabled = true; // Can't rename JS files easily here

            // For JS, we just put text in Quill? No, Quill is for HTML.
            // We should probably use a simple textarea for JS or force Quill to be text only.
            // For simplicity, let's just use Quill as a text editor but it adds HTML tags.
            // Actually, let's just use the innerText of Quill.
            // Better: Replace Quill with a textarea for JS files?
            // For now, let's just load it into Quill as code block?
            // Let's just load it as text.
            quill.setText(content);
            document.getElementById('current-file').innerText = path;
            showScreen('editor');
            return;
        }

        // HTML Parsing
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');

        const title = doc.querySelector('title') ? doc.querySelector('title').innerText : path;

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

        pageTitleInput.value = title.replace(' - Zee Teach', '');
        pageTitleInput.disabled = false;

        quill.setContents([]);
        const delta = quill.clipboard.convert(bodyContent);
        quill.setContents(delta, 'silent');

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
        let newContentBase64;

        if (currentFilePath.endsWith('.js')) {
            // Save JS file (plain text)
            const newText = quill.getText();
            newContentBase64 = btoa(unescape(encodeURIComponent(newText)));
        } else {
            // Save HTML file
            const { data } = await octokit.request(`GET /repos/${owner}/${repo}/contents/${currentFilePath}`);
            const originalContent = atob(data.content);

            const parser = new DOMParser();
            const doc = parser.parseFromString(originalContent, 'text/html');

            if (doc.querySelector('title')) {
                doc.querySelector('title').innerText = `${pageTitleInput.value} - Zee Teach`;
            }

            const newBodyHtml = quill.root.innerHTML;
            const articleBody = doc.querySelector('.article-body');
            const main = doc.querySelector('main');

            if (articleBody) {
                articleBody.innerHTML = newBodyHtml;
            } else if (main) {
                main.innerHTML = newBodyHtml;
            } else {
                doc.body.innerHTML = newBodyHtml;
            }

            const newHtml = "<!DOCTYPE html>\n" + doc.documentElement.outerHTML;
            newContentBase64 = btoa(unescape(encodeURIComponent(newHtml)));
        }

        await octokit.request(`PUT /repos/${owner}/${repo}/contents/${currentFilePath}`, {
            message: `Update ${currentFilePath} via Admin Dashboard`,
            content: newContentBase64,
            sha: currentFileSha
        });

        statusMsg.innerText = 'Successfully published! Changes will be live in ~1 minute.';
        statusMsg.classList.add('status-success');
        statusMsg.style.display = 'block';

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

// New Article Logic
newArticleBtn.addEventListener('click', () => {
    newArticleModal.style.display = 'flex';
});

cancelNewBtn.addEventListener('click', () => {
    newArticleModal.style.display = 'none';
});

createNewBtn.addEventListener('click', async () => {
    const filename = newFilenameInput.value.trim();
    const title = newTitleInput.value.trim();

    if (!filename || !title) return alert("Please fill in all fields");

    const fullFilename = filename.endsWith('.html') ? filename : `${filename}.html`;

    createNewBtn.disabled = true;
    createNewBtn.innerText = "Creating...";

    try {
        // Template for new article
        const template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title} - Zee Teach</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script type="module" src="/src/main.js"></script>
</head>
<body>
    <div id="app">
        <header class="header">
            <div class="container header-content">
                <a href="/" class="logo">
                    <img src="/logo.png" alt="Zeeteach Logo" class="logo-icon">
                    Zee Teach
                </a>
                <nav class="nav">
                    <a href="/" class="nav-link">Home</a>
                </nav>
            </div>
        </header>
        <main>
            <article class="article">
                <div class="container article-container">
                    <header class="article-header">
                        <h1 class="article-title">${title}</h1>
                        <div class="article-meta">Category • 5 min read</div>
                    </header>
                    <div class="article-body">
                        <p>Write your content here...</p>
                    </div>
                </div>
            </article>
        </main>
        <footer class="footer">
            <div class="container footer-content">
                <p>&copy; 2025 Zeeteach. All rights reserved.</p>
            </div>
        </footer>
    </div>
</body>
</html>`;

        const contentBase64 = btoa(unescape(encodeURIComponent(template)));

        await octokit.request(`PUT /repos/${owner}/${repo}/contents/${fullFilename}`, {
            message: `Create ${fullFilename} via Admin Dashboard`,
            content: contentBase64
        });

        alert("Article created! It will appear in the list shortly.");
        newArticleModal.style.display = 'none';
        await loadFiles();

    } catch (error) {
        console.error(error);
        alert(`Error creating file: ${error.message}`);
    } finally {
        createNewBtn.disabled = false;
        createNewBtn.innerText = "Create";
    }
});

backBtn.addEventListener('click', () => {
    showScreen('dashboard');
});
