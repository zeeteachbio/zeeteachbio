import { Octokit } from "octokit";

// State
let octokit = null;
let owner = 'zeeteachbio';
let repo = 'zeeteachbio';
let currentUser = null;
let currentFileSha = null;
let currentFilePath = null;

// Chapter Data
const chapters = {
    'STB Class 9': [
        "1. Introduction to Biology", "2. Solving a Biological Problem", "3. Biodiversity",
        "4. Cells and Tissues", "5. Cell Cycle", "6. Enzymes",
        "7. Bioenergetics", "8. Nutrition", "9. Transport"
    ],
    'STB Class 10': [
        "1. Gaseous Exchange", "2. Homeostasis", "3. Coordination and Control",
        "4. Support and Movement", "5. Reproduction", "6. Inheritance",
        "7. Man and His Environment", "8. Biotechnology", "9. Pharmacology"
    ],
    'STB Class 11': [
        "1. Biological Molecules", "2. Enzymes", "3. Cell Structure and Function",
        "4. Bioenergetics", "5. Acellular Life", "6. Prokaryotes",
        "7. Protoctists and Fungi", "8. Diversity Among Plants", "9. Diversity Among Animals",
        "10. Forms and Functions in Plant", "11. Holozoic Nutrition", "12. Circulation",
        "13. Immunity", "14. Gaseous Exchange"
    ],
    'STB Class 12': [
        "15. Homeostasis", "16. Support and Movement", "17. Coordination and Control",
        "18. Reproduction", "19. Growth and Development", "20. Chromosomes and DNA",
        "21. Cell Cycle", "22. Variation and Genetics", "23. Biotechnology",
        "24. Evolution", "25. Ecosystem", "26. Some Major Ecosystems",
        "27. Man and His Environment"
    ],
    'AKUEB Class 9': [
        "1. Introduction to Biology", "2. Solving a Biological Problem", "3. Biodiversity",
        "4. Cells and Tissues", "5. Gaseous Exchange", "6. Enzymes",
        "7. Bioenergetics", "8. Nutrition and Digestion", "9. Transport"
    ],
    'AKUEB Class 10': [],
    'AKUEB Class 11': [
        "1. Biological Molecules", "2. Enzymes", "3. The Cell",
        "4. Classification and Acellular Life", "5. Kingdom Prokaryotae",
        "6. Kingdom Protoctista", "7. Kingdom Fungi", "8. Kingdom Plantae",
        "9. Kingdom Animalia", "10. Bioenergetics", "11. Nutrition",
        "12. Gaseous Exchange", "13. Transport", "14. Immune System"
    ],
    'AKUEB Class 12': []
};

// DOM Elements
const screens = {
    login: document.getElementById('login-screen'),
    dashboard: document.getElementById('dashboard-screen'),
    editor: document.getElementById('editor-screen')
};

const loginBtn = document.getElementById('login-btn');
const tokenInput = document.getElementById('github-token');
const fileGrid = document.getElementById('file-grid'); // New Grid Container
const fileList = document.getElementById('file-list'); // Fallback
const backBtn = document.getElementById('back-btn');
const saveBtn = document.getElementById('save-btn');
const pageTitleInput = document.getElementById('page-title');
const statusMsg = document.getElementById('status-msg');
const editorDeleteBtn = document.getElementById('editor-delete-btn');

// New Article Elements
const newArticleBtn = document.getElementById('new-article-btn');
const newArticleModal = document.getElementById('new-article-modal');
const createNewBtn = document.getElementById('create-new-btn');
const cancelNewBtn = document.getElementById('cancel-new-btn');
const newFilenameInput = document.getElementById('new-filename');
const newTitleInput = document.getElementById('new-title');
const newCategorySelect = document.getElementById('new-category');
const newChapterSelect = document.getElementById('new-chapter');
const chapterContainer = document.getElementById('chapter-container');

console.log('Admin script loaded');

// Initialize Quill
// Register Image Resize Module
if (window.Quill) {
    let ImageResizeModule = window.ImageResize;
    if (ImageResizeModule && typeof ImageResizeModule !== 'function' && ImageResizeModule.default) {
        ImageResizeModule = ImageResizeModule.default;
    }

    if (typeof ImageResizeModule === 'function') {
        window.Quill.register('modules/imageResize', ImageResizeModule);
    } else {
        console.error('ImageResize module not found or not a constructor', window.ImageResize);
    }

    // Register Custom Attributors for Spacing
    const Parchment = window.Quill.import('parchment');
    const LineHeightStyle = new Parchment.Attributor.Style('line-height', 'line-height', {
        scope: Parchment.Scope.INLINE
    });
    const MarginBottomStyle = new Parchment.Attributor.Style('margin-bottom', 'margin-bottom', {
        scope: Parchment.Scope.BLOCK
    });

    window.Quill.register(LineHeightStyle, true);
    window.Quill.register(MarginBottomStyle, true);
}

const quill = new Quill('#content-editor', {
    theme: 'snow',
    modules: {
        imageResize: {
            displaySize: true
        },
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            [{ 'font': [] }],
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'script': 'sub' }, { 'script': 'super' }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            ['link', 'image', 'video'],
            [{ 'line-height': ['1.0', '1.2', '1.5', '1.8', '2.0', '2.5', '3.0'] }],
            [{ 'margin-bottom': ['0px', '10px', '20px', '30px', '40px', '50px'] }],
            ['clean']
        ]
    }
});

// Navigation
function showScreen(screenName) {
    Object.values(screens).forEach(el => el.classList.remove('active-screen'));
    screens[screenName].classList.add('active-screen');
}

// Debug Logger
function log(msg, type = 'info') {
    const logEl = document.getElementById('debug-log');
    if (logEl) {
        logEl.style.display = 'block';
        const timestamp = new Date().toLocaleTimeString();
        logEl.innerText += `[${timestamp}] [${type}] ${msg}\n`;
        console.log(`[${type}] ${msg}`);
    }
}

// Login
loginBtn.addEventListener('click', async () => {
    const token = tokenInput.value.trim();
    if (!token) return alert('Please enter a token');

    loginBtn.disabled = true;
    loginBtn.innerText = 'Logging in...';
    log('Attempting login...', 'info');

    try {
        log('Initializing Octokit...', 'info');
        octokit = new Octokit({ auth: token });

        log('Verifying token...', 'info');
        const { data: user } = await octokit.request('GET /user');

        log(`Logged in as ${user.login}`, 'success');
        currentUser = user.login;

        log('Loading files...', 'info');
        await loadFiles();

        log('Switching to dashboard...', 'info');
        showScreen('dashboard');
    } catch (error) {
        console.error(error);
        log(`Login failed: ${error.message}`, 'error');
        if (error.status === 401) {
            log('Error 401: Unauthorized. Please check if your token is valid.', 'error');
        }
        alert('Login failed. Please check the debug log for details.');
    } finally {
        loginBtn.disabled = false;
        loginBtn.innerText = 'Login';
    }
});

// Load Files
async function loadFiles() {
    fileGrid.innerHTML = '<p>Loading files...</p>';
    try {
        let files = [];
        // Try current user first, then default owner
        const owners = [currentUser, 'zeeteachbio'].filter(Boolean);
        // Remove duplicates
        const uniqueOwners = [...new Set(owners)];

        const repoNames = ['zeeteach', 'zeeteachbio'];
        let found = false;

        outerLoop:
        for (const o of uniqueOwners) {
            for (const r of repoNames) {
                try {
                    console.log(`Trying repo: ${o}/${r}`);
                    const { data } = await octokit.request(`GET /repos/${o}/${r}/contents/?t=${Date.now()}`);
                    owner = o;
                    repo = r;
                    files = data;
                    found = true;
                    break outerLoop;
                } catch (e) {
                    console.log(`Repo ${o}/${r} not found.`);
                }
            }
        }

        if (!found) {
            throw new Error("Could not find repository 'zeeteach' or 'zeeteachbio'");
        }

        // Fetch src/searchData.js to get metadata
        let searchDataFile = null;
        let searchIndex = [];
        try {
            const { data } = await octokit.request(`GET /repos/${owner}/${repo}/contents/src/searchData.js?t=${Date.now()}`);
            searchDataFile = data;

            // Parse search index
            const content = decodeURIComponent(escape(atob(data.content)));
            const arrayString = content.replace(/export\s+const\s+searchIndex\s*=\s*/, '').replace(/;\s*$/, '');
            try {
                searchIndex = new Function('return ' + arrayString)();
            } catch (e) {
                console.error("Failed to parse searchData.js content", e);
            }
        } catch (e) {
            console.log("searchData.js not found in src/", e);
        }

        fileGrid.innerHTML = '';
        fileList.innerHTML = '';

        // Helper to create file item
        const createFileItem = (file, label = null) => {
            const div = document.createElement('div');
            div.className = 'file-item';
            div.innerHTML = `
                <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-right: 0.5rem;" title="${label || file.name}">${label || file.name}</span>
                <div style="display: flex; gap: 0.25rem;">
                    <button class="btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">Edit</button>
                    <button class="btn-secondary" style="color: #ef4444; border-color: #ef4444; padding: 0.25rem 0.5rem; font-size: 0.8rem;">Del</button>
                </div>
            `;

            const buttons = div.querySelectorAll('button');
            const editBtn = buttons[0];
            const deleteBtn = buttons[1];

            editBtn.addEventListener('click', () => loadFileContent(file.path));

            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent file item click if any
                if (confirm(`Are you sure you want to delete ${file.name}?`)) {
                    deleteFile(file.path, file.sha);
                }
            });

            return div;
        };

        const htmlFiles = files.filter(f => f.name.endsWith('.html') && f.name !== 'admin.html');

        // Grouping Logic
        const groups = {
            'STB Class 9': { files: [], chapters: {} },
            'STB Class 10': { files: [], chapters: {} },
            'STB Class 11': { files: [], chapters: {} },
            'STB Class 12': { files: [], chapters: {} },
            'AKUEB Class 9': { files: [], chapters: {} },
            'AKUEB Class 10': { files: [], chapters: {} },
            'AKUEB Class 11': { files: [], chapters: {} },
            'AKUEB Class 12': { files: [], chapters: {} }
        };
        const otherFiles = [];

        // Initialize chapter buckets
        Object.keys(groups).forEach(cls => {
            if (chapters[cls]) {
                chapters[cls].forEach(chap => {
                    groups[cls].chapters[chap] = [];
                });
            }
        });

        htmlFiles.forEach(file => {
            const name = file.name.toLowerCase();

            // 1. Try to find metadata in searchIndex
            const metadata = searchIndex.find(item => item.url === `/${file.name}` || item.url === file.name);

            let assigned = false;

            if (metadata) {
                let category = metadata.category;
                // Map old categories
                if (category === 'Class 9') category = 'STB Class 9';
                if (category === 'Class 10') category = 'STB Class 10';
                if (category === 'Class 11') category = 'STB Class 11';
                if (category === 'Class 12') category = 'STB Class 12';

                const chapter = metadata.chapter;

                if (groups[category]) {
                    if (chapter && groups[category].chapters[chapter]) {
                        groups[category].chapters[chapter].push(file);
                    } else {
                        groups[category].files.push(file); // No chapter or unknown chapter
                    }
                    assigned = true;
                }
            }

            // 2. Fallback to filename matching if not assigned via metadata
            if (!assigned) {
                if (/class-?9/.test(name)) groups['STB Class 9'].files.push(file);
                else if (/class-?10/.test(name)) groups['STB Class 10'].files.push(file);
                else if (/class-?11/.test(name)) groups['STB Class 11'].files.push(file);
                else if (/class-?12/.test(name)) groups['STB Class 12'].files.push(file);
                else if (/akueb-class-?9/.test(name)) groups['AKUEB Class 9'].files.push(file);
                else if (/akueb-class-?10/.test(name)) groups['AKUEB Class 10'].files.push(file);
                else if (/akueb-class-?11/.test(name)) groups['AKUEB Class 11'].files.push(file);
                else if (/akueb-class-?12/.test(name)) groups['AKUEB Class 12'].files.push(file);
                else otherFiles.push(file);
            }
        });

        // Render 4 Columns for Classes
        Object.entries(groups).forEach(([groupName, groupData]) => {
            const col = document.createElement('div');
            col.className = 'file-column';

            const header = document.createElement('h3');
            header.innerHTML = `
                ${groupName}
                <button class="btn-primary" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">+ New</button>
            `;

            // Add New Article Button Logic
            header.querySelector('button').onclick = () => {
                newCategorySelect.value = groupName;
                updateChapterDropdown(groupName);
                newArticleModal.style.display = 'flex';
            };

            col.appendChild(header);

            let hasFiles = false;

            // Render Chapters
            if (chapters[groupName]) {
                chapters[groupName].forEach(chapterName => {
                    const chapterFiles = groupData.chapters[chapterName];

                    const chapterHeader = document.createElement('div');
                    chapterHeader.style.fontSize = '0.85rem';
                    chapterHeader.style.fontWeight = '600';
                    chapterHeader.style.color = '#64748b';
                    chapterHeader.style.marginTop = '0.75rem';
                    chapterHeader.style.marginBottom = '0.25rem';
                    chapterHeader.style.paddingBottom = '0.25rem';
                    chapterHeader.style.borderBottom = '1px dashed #e2e8f0';
                    chapterHeader.innerText = chapterName;
                    col.appendChild(chapterHeader);

                    if (chapterFiles && chapterFiles.length > 0) {
                        chapterFiles.forEach(file => {
                            col.appendChild(createFileItem(file));
                        });
                        hasFiles = true;
                    } else {
                        const emptyMsg = document.createElement('div');
                        emptyMsg.style.fontSize = '0.75rem';
                        emptyMsg.style.color = '#cbd5e1';
                        emptyMsg.style.fontStyle = 'italic';
                        emptyMsg.style.paddingLeft = '0.5rem';
                        emptyMsg.innerText = 'No articles';
                        col.appendChild(emptyMsg);
                    }
                });
            }

            // Render Uncategorized Files for this Class
            if (groupData.files.length > 0) {
                const otherHeader = document.createElement('div');
                otherHeader.style.fontSize = '0.85rem';
                otherHeader.style.fontWeight = '600';
                otherHeader.style.color = '#64748b';
                otherHeader.style.marginTop = '1rem';
                otherHeader.innerText = 'Uncategorized / General';
                col.appendChild(otherHeader);

                groupData.files.forEach(file => {
                    col.appendChild(createFileItem(file));
                });
                hasFiles = true;
            }

            fileGrid.appendChild(col);
        });

        // Render Other Files below
        if (otherFiles.length > 0 || searchDataFile) {
            const otherSection = document.createElement('div');
            otherSection.style.gridColumn = "1 / -1";
            otherSection.style.marginTop = "2rem";
            otherSection.innerHTML = '<h3 style="border-bottom: 2px solid var(--color-border); padding-bottom: 0.5rem; margin-bottom: 1rem;">Other Files & Pages</h3>';

            const list = document.createElement('div');
            list.style.display = 'grid';
            list.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
            list.style.gap = '1rem';

            if (searchDataFile) {
                const item = createFileItem(searchDataFile, 'src/searchData.js');
                item.style.borderLeft = "4px solid #f59e0b";
                list.appendChild(item);
            }

            otherFiles.forEach(file => {
                list.appendChild(createFileItem(file));
            });

            otherSection.appendChild(list);
            fileGrid.appendChild(otherSection);
        }

    } catch (error) {
        console.error(error);
        fileGrid.innerHTML = `<p style="color: red">Error loading files: ${error.message}</p>`;
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
            pageTitleInput.disabled = true;
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

// Editor Delete Button
if (editorDeleteBtn) {
    editorDeleteBtn.addEventListener('click', () => {
        if (!currentFilePath || !currentFileSha) return;
        if (confirm(`Are you sure you want to delete ${currentFilePath}? This cannot be undone.`)) {
            deleteFile(currentFilePath, currentFileSha);
        }
    });
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
        let errorMsg = `Error publishing: ${error.message}`;
        if (error.status === 401) {
            errorMsg = 'Error 401: Unauthorized. Your token may be invalid, expired, or missing the "repo" scope. Please log out and try again with a valid token.';
        }
        statusMsg.innerText = errorMsg;
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
    updateChapterDropdown(newCategorySelect.value);
});

cancelNewBtn.addEventListener('click', () => {
    newArticleModal.style.display = 'none';
});

// Update Chapter Dropdown based on Category
function updateChapterDropdown(category) {
    newChapterSelect.innerHTML = '<option value="">Select Chapter...</option>';

    if (chapters[category]) {
        chapterContainer.style.display = 'block';
        chapters[category].forEach(chapter => {
            const option = document.createElement('option');
            option.value = chapter;
            option.innerText = chapter;
            newChapterSelect.appendChild(option);
        });
    } else {
        chapterContainer.style.display = 'none';
    }
}

newCategorySelect.addEventListener('change', (e) => {
    updateChapterDropdown(e.target.value);
});

createNewBtn.addEventListener('click', async () => {
    const filename = newFilenameInput.value.trim();
    const title = newTitleInput.value.trim();
    const category = newCategorySelect ? newCategorySelect.value : "General";
    const chapter = newChapterSelect.value;
    const thumbnailInput = document.getElementById('new-thumbnail');
    let thumbnail = thumbnailInput ? thumbnailInput.value.trim() : '';

    if (!filename || !title) return alert("Please fill in all fields");
    if (chapters[category] && !chapter) return alert("Please select a chapter");

    const fullFilename = filename.endsWith('.html') ? filename : `${filename}.html`;

    createNewBtn.disabled = true;
    createNewBtn.innerText = "Creating...";

    try {
        // 0. Check if file already exists
        try {
            await octokit.request(`GET /repos/${owner}/${repo}/contents/${fullFilename}`);
            // If we get here, file exists
            alert(`File ${fullFilename} already exists! Please choose a different filename.`);
            createNewBtn.disabled = false;
            createNewBtn.innerText = "Create";
            return;
        } catch (e) {
            // 404 means file doesn't exist, which is good
            if (e.status !== 404) {
                throw e;
            }
        }

        // 1. Create the HTML File
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
                        <div class="article-meta">
                            ${category} ${chapter ? `&bull; ${chapter}` : ''} &bull; 5 min read
                        </div>
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

        // 2. Update src/searchData.js
        try {
            const { data: searchData } = await octokit.request(`GET /repos/${owner}/${repo}/contents/src/searchData.js`);
            const currentContent = decodeURIComponent(escape(atob(searchData.content)));

            // Robust parsing: extract array and parse as JS
            const arrayString = currentContent.replace(/export\s+const\s+searchIndex\s*=\s*/, '').replace(/;\s*$/, '');
            let currentSearchIndex;
            try {
                // Use Function constructor to safely parse JS object literal
                currentSearchIndex = new Function('return ' + arrayString)();
            } catch (e) {
                console.error("Failed to parse searchData.js", e);
                throw new Error("Failed to parse search index");
            }

            // Create new entry
            const newEntry = {
                title: title,
                url: `/${fullFilename}`,
                excerpt: `${title} - ${category} ${chapter ? `(${chapter})` : ''} notes.`,
                category: category,
                chapter: chapter || null,
                date: new Date().toISOString(),
                views: 0,
                comments: 0,
                thumbnail: thumbnail || null
            };

            // Add to index
            currentSearchIndex.push(newEntry);

            // Serialize back to string
            const newSearchContent = `export const searchIndex = ${JSON.stringify(currentSearchIndex, null, 4)};`;
            const newSearchBase64 = btoa(unescape(encodeURIComponent(newSearchContent)));

            await octokit.request(`PUT /repos/${owner}/${repo}/contents/src/searchData.js`, {
                message: `Add ${title} to search index`,
                content: newSearchBase64,
                sha: searchData.sha
            });
            console.log("Updated searchData.js");

        } catch (e) {
            console.error("Error updating searchData.js", e);
            alert("Article created, but failed to update search index automatically. Please update it manually.");
        }

        alert("Article created and added to search!");
        newArticleModal.style.display = 'none';
        await loadFiles();
        await loadFiles();

    } catch (error) {
        console.error(error);
        alert(`Error creating file: ${error.message}`);
    } finally {
        createNewBtn.disabled = false;
        createNewBtn.innerText = "Create";
    }
});

// Delete File Function (Robust)
async function deleteFile(path, sha) {
    try {
        // 1. Delete the file
        await octokit.request(`DELETE /repos/${owner}/${repo}/contents/${path}`, {
            message: `Delete ${path} via Admin Dashboard`,
            sha: sha
        });

        // 2. Update searchData.js if it's an article
        if (path.endsWith('.html') && !path.includes('admin') && !path.includes('index')) {
            try {
                const { data: searchData } = await octokit.request(`GET /repos/${owner}/${repo}/contents/src/searchData.js`);
                const currentContent = decodeURIComponent(escape(atob(searchData.content)));

                const urlToDelete = `/${path}`;

                // Robust parsing: extract array and parse as JS
                const arrayString = currentContent.replace(/export\s+const\s+searchIndex\s*=\s*/, '').replace(/;\s*$/, '');
                let currentSearchIndex;
                try {
                    // Use Function constructor to safely parse JS object literal
                    currentSearchIndex = new Function('return ' + arrayString)();
                } catch (e) {
                    console.error("Failed to parse searchData.js", e);
                    throw new Error("Failed to parse search index");
                }

                // Filter out the deleted article
                const newSearchIndex = currentSearchIndex.filter(item => item.url !== urlToDelete);

                if (newSearchIndex.length !== currentSearchIndex.length) {
                    // Serialize back to string
                    const newContent = `export const searchIndex = ${JSON.stringify(newSearchIndex, null, 4)};`;
                    const newContentBase64 = btoa(unescape(encodeURIComponent(newContent)));

                    await octokit.request(`PUT /repos/${owner}/${repo}/contents/src/searchData.js`, {
                        message: `Remove ${path} from search index`,
                        content: newContentBase64,
                        sha: searchData.sha
                    });
                    console.log("Updated searchData.js");
                }

            } catch (e) {
                console.error("Error updating searchData.js during delete", e);
                alert("File deleted, but failed to update search index. Please check manually.");
            }
        }

        alert(`Successfully deleted ${path}`);
        showScreen('dashboard');
        await loadFiles(); // Refresh list
    } catch (error) {
        console.error(error);
        alert(`Error deleting file: ${error.message}`);
    }
}

backBtn.addEventListener('click', () => {
    showScreen('dashboard');
});
