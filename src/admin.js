import { Octokit } from "octokit";
import './editorCompat.js';

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

// Add version indicator
document.title = "Admin Dashboard v2.2 - Zee Teach";
const headerTitle = document.querySelector('.header .logo');
if (headerTitle) headerTitle.innerHTML += ' <span style="font-size: 0.8rem; color: #666;">(v2.2)</span>';

// Add Logout Button to Header
const header = document.querySelector('header');
if (header) {
    const logoutBtn = document.createElement('button');
    logoutBtn.id = 'logout-btn';
    logoutBtn.className = 'btn-secondary';
    logoutBtn.style.cssText = 'font-size: 0.8rem; padding: 0.25rem 0.5rem; margin-left: 1rem; display: none;';
    logoutBtn.innerText = 'Logout';
    header.appendChild(logoutBtn);

    logoutBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('github_token');
            window.location.reload();
        }
    });
}



const loginBtn = document.getElementById('login-btn');
const tokenInput = document.getElementById('github-token');
const fileGrid = document.getElementById('file-grid'); // New Grid Container
const fileList = document.getElementById('file-list'); // Fallback
const backBtn = document.getElementById('back-btn');
const saveBtn = document.getElementById('save-btn');
const syncBtn = document.getElementById('sync-btn'); // New Sync Button
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

console.log('Admin script loaded v2.2');

// Initialize Tiptap editor
let quill = null;

function initializeQuill() {
    if (quill || !document.getElementById('content-editor')) return quill;

    console.log('Initializing Tiptap instead of Quill...');
    quill = window.editorAPI.initialize();

    // Remove floating toolbar setup since Tiptap has built-in menus
    // setupFloatingToolbar();
    return quill;
}

// Navigation
function showScreen(screenName) {
    Object.values(screens).forEach(el => el.classList.remove('active-screen'));
    screens[screenName].classList.add('active-screen');
}

// Debug Logger
function log(msg, type = 'info') {
    const logEl = document.getElementById('debug-log');
    if (logEl) {
        if (type === 'error') {
            logEl.style.display = 'block'; // Auto-show on error
        }
        const timestamp = new Date().toLocaleTimeString();
        logEl.innerText += `[${timestamp}] [${type}] ${msg}\n`;
        // Auto-scroll to bottom
        logEl.scrollTop = logEl.scrollHeight;
        console.log(`[${type}] ${msg}`);
    }
}

// Global Error Handling
window.onerror = function (msg, url, lineNo, columnNo, error) {
    log(`Global Error: ${msg} at ${url}:${lineNo}:${columnNo}`, 'error');
    return false;
};

window.onunhandledrejection = function (event) {
    log(`Unhandled Promise Rejection: ${event.reason}`, 'error');
};

// Toggle Debug Log
const toggleDebugBtn = document.getElementById('toggle-debug-btn');
if (toggleDebugBtn) {
    toggleDebugBtn.addEventListener('click', () => {
        const logEl = document.getElementById('debug-log');
        if (logEl.style.display === 'none') {
            logEl.style.display = 'block';
            toggleDebugBtn.innerText = 'Hide Debug Log';
        } else {
            logEl.style.display = 'none';
            toggleDebugBtn.innerText = 'Show Debug Log';
        }
    });
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

        // Save token to localStorage
        localStorage.setItem('github_token', token);

        // Show Logout Button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) logoutBtn.style.display = 'inline-block';


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

// Check for stored token on load
(async function checkSession() {
    const storedToken = localStorage.getItem('github_token');
    if (storedToken) {
        log('Found stored session, attempting auto-login...', 'info');
        tokenInput.value = storedToken; // Pre-fill for convenience

        try {
            octokit = new Octokit({ auth: storedToken });
            const { data: user } = await octokit.request('GET /user');

            log(`Auto-logged in as ${user.login}`, 'success');
            currentUser = user.login;

            // Show Logout Button
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) logoutBtn.style.display = 'inline-block';

            showScreen('dashboard');
            await loadFiles();
        } catch (error) {
            console.error('Auto-login failed', error);
            log('Session expired or invalid. Please log in again.', 'warning');
            localStorage.removeItem('github_token');
        }
    }
})();


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
                    // Get default branch and tree recursively
                    const { data: repoInfo } = await octokit.request(`GET /repos/${o}/${r}`);
                    const branch = repoInfo.default_branch;
                    const { data: treeData } = await octokit.request(`GET /repos/${o}/${r}/git/trees/${branch}?recursive=1`);

                    owner = o;
                    repo = r;
                    // Filter for blobs (files) and map to expected format
                    files = treeData.tree.filter(item => item.type === 'blob').map(item => ({
                        ...item,
                        name: item.path.split('/').pop(),
                        path: item.path
                    }));

                    found = true;
                    break outerLoop;
                } catch (e) {
                    console.log(`Repo ${o}/${r} not found or tree fetch failed.`, e);
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
            log('Fetching searchData.js...', 'info');
            const { data } = await octokit.request(`GET /repos/${owner}/${repo}/contents/src/searchData.js?t=${Date.now()}`);
            searchDataFile = data;

            // Parse search index
            const content = decodeURIComponent(escape(atob(data.content)));
            const arrayString = content.replace(/export\s+const\s+searchIndex\s*=\s*/, '').replace(/;\s*$/, '');
            try {
                searchIndex = new Function('return ' + arrayString)();
                log(`Parsed search index with ${searchIndex.length} items`, 'success');
            } catch (e) {
                console.error("Failed to parse searchData.js content", e);
                log(`Failed to parse searchData.js: ${e.message}`, 'error');
                alert("Warning: Failed to parse searchData.js. Some file categorization might be incorrect.");
            }
        } catch (e) {
            console.log("searchData.js not found in src/", e);
            log('searchData.js not found, proceeding without metadata', 'warning');
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
                    <button class="btn-secondary btn-sm">Edit</button>
                    <button class="btn-danger btn-sm">Del</button>
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

        const EXCLUDED_FILES = ['index.html', 'admin.html', 'search.html', 'chapter.html', 'test_api.html', 'animated-logo.html', 'dna-animation.html'];
        const htmlFiles = files.filter(f =>
            f.name.endsWith('.html') &&
            !EXCLUDED_FILES.includes(f.name) &&
            !f.path.includes('_backup') &&
            !f.path.includes('.github')
        );

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
            // Match against full path or name
            const metadata = searchIndex.find(item => item.url === `/${file.path}` || item.url === file.path || item.url === `/${file.name}`);

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
                    if (chapter) {
                        // Try exact match first
                        if (groups[category].chapters[chapter]) {
                            groups[category].chapters[chapter].push(file);
                        } else {
                            // Try case-insensitive match
                            const targetChapter = Object.keys(groups[category].chapters).find(
                                c => c.toLowerCase() === chapter.toLowerCase()
                            );
                            if (targetChapter) {
                                groups[category].chapters[targetChapter].push(file);
                            } else {
                                groups[category].files.push(file); // Chapter not found in predefined list
                            }
                        }
                    } else {
                        groups[category].files.push(file); // No chapter in metadata
                    }
                    assigned = true;
                }
            }

            // 2. Fallback to filename/path matching if not assigned via metadata
            if (!assigned) {
                // Check path for classification
                const pathLower = file.path.toLowerCase();
                if (pathLower.includes('stb/class9') || /class-?9/.test(name)) groups['STB Class 9'].files.push(file);
                else if (pathLower.includes('stb/class10') || /class-?10/.test(name)) groups['STB Class 10'].files.push(file);
                else if (pathLower.includes('stb/class11') || /class-?11/.test(name)) groups['STB Class 11'].files.push(file);
                else if (pathLower.includes('stb/class12') || /class-?12/.test(name)) groups['STB Class 12'].files.push(file);
                else if (pathLower.includes('akueb/class9') || /akueb-class-?9/.test(name)) groups['AKUEB Class 9'].files.push(file);
                else if (pathLower.includes('akueb/class10') || /akueb-class-?10/.test(name)) groups['AKUEB Class 10'].files.push(file);
                else if (pathLower.includes('akueb/class11') || /akueb-class-?11/.test(name)) groups['AKUEB Class 11'].files.push(file);
                else if (pathLower.includes('akueb/class12') || /akueb-class-?12/.test(name)) groups['AKUEB Class 12'].files.push(file);
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
                <button class="btn-primary btn-sm" style="font-size: 0.75rem;">+ New</button>
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

        // Initialize Quill editor if not already initialized
        const editor = initializeQuill();
        if (!editor) {
            alert('Failed to initialize editor');
            return;
        }

        // FIX: Correctly decode UTF-8 content
        const content = decodeURIComponent(escape(atob(data.content)));

        if (path.endsWith('.js')) {
            // Text editor for JS files
            pageTitleInput.value = path;
            pageTitleInput.disabled = true;
            window.editorAPI.setHTML(`<pre>${content}</pre>`);
            document.getElementById('current-file').innerText = path;
            showScreen('editor');
            return;
        }

        // HTML Parsing
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');

        const title = doc.querySelector('title') ? doc.querySelector('title').innerText : path;

        let bodyContent = '';
        const articleContent = doc.querySelector('#article-content');
        const articleBody = doc.querySelector('.article-body');
        const main = doc.querySelector('main');

        if (articleContent) {
            bodyContent = articleContent.innerHTML;
        } else if (articleBody) {
            bodyContent = articleBody.innerHTML;
        } else if (main) {
            // If falling back to main, try to exclude header/meta if they exist
            const clone = main.cloneNode(true);
            const header = clone.querySelector('.article-header');
            if (header) header.remove();
            bodyContent = clone.innerHTML;
        } else {
            bodyContent = doc.body.innerHTML;
        }

        // FIX: Auto-repair common encoding artifacts (Mojibake)
        // Ã¢Â€Â¢ -> •
        // Ã¢Â€Â” -> —
        // Ã¢Â€Â™ -> ’
        // Ã¢Â€Âœ -> “
        // Ã¢Â€Â -> ”
        bodyContent = bodyContent
            .replace(/Ã¢Â€Â¢/g, '•')
            .replace(/Ã¢Â€Â”/g, '—')
            .replace(/Ã¢Â€Â™/g, '’')
            .replace(/Ã¢Â€Âœ/g, '“')
            .replace(/Ã¢Â€Â/g, '”')
            .replace(/Â/g, ''); // Remove stray non-breaking space artifacts often appearing as Â

        // Check for extremely large content
        if (bodyContent.length > 1000000) { // 1MB warning
            if (!confirm(`Warning: This file is very large (${Math.round(bodyContent.length / 1024)}KB). It may contain large embedded images which can slow down or crash the editor. Do you want to try loading it anyway?`)) {
                showScreen('dashboard');
                return;
            }
        }

        console.log('Body Content Length:', bodyContent.length);
        // Load HTML content into Tiptap
        window.editorAPI.setHTML(bodyContent);

        document.getElementById('current-file').innerText = path;

        showScreen('editor');
    } catch (error) {
        console.error(error);
        alert('Error loading file content: ' + error.message);
    }
}

// Helper to update both searchData.js and articles.json
async function updateSearchIndex(newIndex, message) {
    // 1. Update searchData.js (JS Module)
    try {
        const { data: searchData } = await octokit.request(`GET /repos/${owner}/${repo}/contents/src/searchData.js`);
        const newSearchContent = `export const searchIndex = ${JSON.stringify(newIndex, null, 4)};`;
        const newSearchBase64 = btoa(unescape(encodeURIComponent(newSearchContent)));

        await octokit.request(`PUT /repos/${owner}/${repo}/contents/src/searchData.js`, {
            message: message,
            content: newSearchBase64,
            sha: searchData.sha
        });
        console.log("Updated searchData.js");
    } catch (e) {
        console.error("Error updating searchData.js", e);
    }

    // 2. Update articles.json (JSON Data in public/)
    try {
        let sha = null;
        try {
            const { data } = await octokit.request(`GET /repos/${owner}/${repo}/contents/public/articles.json`);
            sha = data.sha;
        } catch (e) {
            // File might not exist yet
        }

        const newJsonContent = JSON.stringify(newIndex, null, 4);
        const newJsonBase64 = btoa(unescape(encodeURIComponent(newJsonContent)));

        await octokit.request(`PUT /repos/${owner}/${repo}/contents/public/articles.json`, {
            message: message,
            content: newJsonBase64,
            sha: sha
        });
        console.log("Updated articles.json");
    } catch (e) {
        console.error("Error updating articles.json", e);
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
            const newText = window.editorAPI.getHTML().replace(/<[^>]*>/g, ''); // Strip HTML tags
            newContentBase64 = btoa(unescape(encodeURIComponent(newText)));
        } else {
            // Save HTML file
            const { data } = await octokit.request(`GET /repos/${owner}/${repo}/contents/${currentFilePath}`);
            const originalContent = decodeURIComponent(escape(atob(data.content)));

            const parser = new DOMParser();
            const doc = parser.parseFromString(originalContent, 'text/html');

            if (doc.querySelector('title')) {
                doc.querySelector('title').innerText = `${pageTitleInput.value} - Zee Teach`;
            }

            const newBodyHtml = window.editorAPI.getHTML();
            const articleContent = doc.querySelector('#article-content');
            const articleBody = doc.querySelector('.article-body');
            const main = doc.querySelector('main');

            if (articleContent) {
                articleContent.innerHTML = newBodyHtml;
            } else if (articleBody) {
                // Fallback for old articles, but try to preserve if possible or just overwrite
                // Ideally we should wrap it, but for now just overwrite to avoid breaking
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

    // Helper to construct folder path
    const getFolderPath = (category, chapter) => {
        let basePath = '';
        if (category.includes('STB')) basePath = 'stb/';
        else if (category.includes('AKUEB')) basePath = 'akueb/';
        else return ''; // Root for General

        // Extract class number
        const classMatch = category.match(/Class\s+(\d+)/);
        const classNum = classMatch ? classMatch[1] : '';
        if (classNum) basePath += `class${classNum}/`;

        // Slugify chapter name
        if (chapter) {
            const chapterSlug = 'ch' + chapter.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
            basePath += `${chapterSlug}/`;
        }
        return basePath;
    };

    const folderPath = getFolderPath(category, chapter);
    // Ensure filename doesn't start with slash if folderPath is present
    const cleanFilename = filename.replace(/^\/+/, '');
    const fullFilePath = folderPath + (cleanFilename.endsWith('.html') ? cleanFilename : `${cleanFilename}.html`);

    createNewBtn.disabled = true;
    createNewBtn.innerText = "Creating...";

    try {
        // 0. Check if file already exists
        try {
            await octokit.request(`GET /repos/${owner}/${repo}/contents/${fullFilePath}`);
            // If we get here, file exists
            alert(`File ${fullFilePath} already exists! Please choose a different filename.`);
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
                    <img src="/logo-hexagon.svg" alt="Zeeteach Logo" class="logo-icon">
                    Zee Teach
                </a>
                <nav class="nav">
                    <a href="/" class="nav-link">Home</a>
                    <div class="dropdown">
                        <a href="javascript:void(0)" class="nav-link dropdown-toggle">STB Notes ▾</a>
                        <div class="dropdown-menu">
                            <a href="/stb/class9/" class="dropdown-item">Class 9</a>
                            <a href="/stb/class10/" class="dropdown-item">Class 10</a>
                            <a href="/stb/class11/" class="dropdown-item">Class 11</a>
                            <a href="/stb/class12/" class="dropdown-item">Class 12</a>
                        </div>
                    </div>
                    <div class="dropdown">
                        <a href="javascript:void(0)" class="nav-link dropdown-toggle">AKUEB Notes ▾</a>
                        <div class="dropdown-menu">
                            <a href="/akueb/class9/" class="dropdown-item">Class 9</a>
                            <a href="/akueb/class10/" class="dropdown-item">Class 10</a>
                            <a href="/akueb/class11/" class="dropdown-item">Class 11</a>
                            <a href="/akueb/class12/" class="dropdown-item">Class 12</a>
                        </div>
                    </div>
                    <div class="search-container">
                        <input type="text" class="search-input" placeholder="Search globally..." autocomplete="off">
                        <button class="search-btn">
                            <svg class="search-icon-svg" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </button>
                    </div>
                </nav>
            </div>
        </header>
        <main>
            <article class="article">
                <div class="container article-container">
                    <div class="article-body">
                        <a href="javascript:history.back()" class="back-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                            Go Back
                        </a>
                        <div class="article-meta" style="margin-bottom: 1.5rem; color: var(--color-text-light); font-size: 0.9rem; font-weight: 500;">
                            ${chapter}
                        </div>
                        
                        <div id="article-content">
                            <h1>${title}</h1>
                            <p>Start writing your content here...</p>
                        </div>

                        <div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid var(--color-border);">
                            <a href="javascript:history.back()" class="back-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                                </svg>
                                Go Back
                            </a>
                        </div>
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

        await octokit.request(`PUT /repos/${owner}/${repo}/contents/${fullFilePath}`, {
            message: `Create ${fullFilePath}`,
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
                url: `/${fullFilePath}`,
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

            await updateSearchIndex(currentSearchIndex, `Add ${title} to search index`);

        } catch (e) {
            console.error("Error updating search index", e);
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
        log(`Deleting file: ${path}`, 'info');
        // 1. Delete the file
        await octokit.request(`DELETE /repos/${owner}/${repo}/contents/${path}`, {
            message: `Delete ${path} via Admin Dashboard`,
            sha: sha
        });
        log(`File deleted from GitHub: ${path}`, 'success');

        // 2. Update searchData.js if it's an article
        if (path.endsWith('.html') && !path.includes('admin') && !path.includes('index')) {
            try {
                log('Updating search index...', 'info');
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

                // Filter out the deleted article (Case Insensitive)
                const newSearchIndex = currentSearchIndex.filter(item =>
                    item.url.toLowerCase() !== urlToDelete.toLowerCase()
                );

                if (newSearchIndex.length !== currentSearchIndex.length) {
                    await updateSearchIndex(newSearchIndex, `Remove ${path} from search index`);
                    log('Search index updated', 'success');
                } else {
                    log(`Article not found in search index (URL: ${urlToDelete}), skipping update`, 'warning');
                    // Optional: Alert user that index wasn't updated
                    alert(`Warning: File deleted, but could not find matching entry in search index to remove. Please check public/articles.json manually.`);
                }

            } catch (e) {
                console.error("Error updating search index during delete", e);
                log(`Error updating search index: ${e.message}`, 'error');
                alert("File deleted, but failed to update search index. Please check manually.");
            }
        }

        alert(`Successfully deleted ${path}`);
        showScreen('dashboard');
        await loadFiles(); // Refresh list
    } catch (error) {
        console.error(error);
        log(`Error deleting file: ${error.message}`, 'error');
        alert(`Error deleting file: ${error.message}`);
    }
}


backBtn.addEventListener('click', () => {
    showScreen('dashboard');
});

// Sync Index Button
if (syncBtn) {
    syncBtn.addEventListener('click', async () => {
        if (!confirm('This will scan ALL article files and regenerate the search index. This may take a while. Continue?')) return;

        syncBtn.disabled = true;
        syncBtn.innerText = 'Syncing...';

        try {
            log('Starting full index sync...', 'info');

            // 1. Get full file tree
            const { data: repoInfo } = await octokit.request(`GET /repos/${owner}/${repo}`);
            const branch = repoInfo.default_branch;
            const { data: treeData } = await octokit.request(`GET /repos/${owner}/${repo}/git/trees/${branch}?recursive=1`);

            const articleFiles = treeData.tree.filter(item =>
                item.type === 'blob' &&
                item.path.endsWith('.html') &&
                !item.path.includes('admin') &&
                !item.path.includes('index.html') &&
                !item.path.includes('search.html') &&
                !item.path.includes('chapter.html') &&
                !item.path.includes('404.html')
            );

            log(`Found ${articleFiles.length} articles. Processing...`, 'info');

            const newSearchIndex = [];

            // Process in batches to avoid overwhelming the browser/API
            for (const file of articleFiles) {
                try {
                    log(`Processing ${file.path}...`, 'info');
                    const { data } = await octokit.request(`GET /repos/${owner}/${repo}/contents/${file.path}`);
                    const content = decodeURIComponent(escape(atob(data.content)));
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(content, 'text/html');

                    // Extract Metadata
                    const title = doc.querySelector('title')?.innerText.replace(' - Zee Teach', '').trim() || 'Untitled';

                    // Excerpt Strategy: Meta Description -> First Paragraph -> Default
                    let excerpt = doc.querySelector('meta[name="description"]')?.content;
                    if (!excerpt) {
                        const firstP = doc.querySelector('.article-body p') || doc.querySelector('main p');
                        if (firstP) {
                            excerpt = firstP.innerText.substring(0, 150) + '...';
                        }
                    }
                    if (!excerpt) excerpt = title;

                    // Category & Chapter from Path
                    // Expected: stb/class9/ch1-intro/file.html
                    const parts = file.path.split('/');
                    let category = 'General';
                    let chapter = 'General';

                    if (parts.length >= 3) {
                        const type = parts[0].toUpperCase(); // STB or AKUEB
                        const cls = parts[1].replace('class', 'Class '); // class9 -> Class 9
                        category = `${type} ${cls}`;

                        const chSlug = parts[2];
                        // Try to format chapter name from slug: ch1-introduction-to-biology -> 1. Introduction To Biology
                        // This is a bit heuristic but better than nothing
                        chapter = chSlug.replace(/^ch/, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    }

                    newSearchIndex.push({
                        title,
                        url: '/' + file.path,
                        excerpt,
                        category,
                        chapter,
                        date: new Date().toISOString(),
                        views: 0,
                        comments: 0,
                        thumbnail: null
                    });

                } catch (e) {
                    console.error(`Failed to process ${file.path}`, e);
                    log(`Failed to process ${file.path}: ${e.message}`, 'error');
                }
            }

            await updateSearchIndex(newSearchIndex, 'Full Sync: Regenerate search index');
            log('Sync complete!', 'success');
            alert('Sync complete! Search index regenerated.');

        } catch (error) {
            console.error(error);
            log(`Sync failed: ${error.message}`, 'error');
            alert(`Sync failed: ${error.message}`);
        } finally {
            syncBtn.disabled = false;
            syncBtn.innerText = 'Sync Index';
        }
    });
}

function setupFloatingToolbar() {
    const floatingToolbar = document.getElementById('floating-toolbar');
    if (floatingToolbar && quill) {
        quill.on('selection-change', (range) => {
            if (range && range.length > 0) {
                const bounds = quill.getBounds(range.index, range.length);

                // Calculate position relative to the editor container
                const containerBounds = document.querySelector('.ql-container').getBoundingClientRect();
                // Position above the selection
                const top = bounds.top + window.scrollY + containerBounds.top - floatingToolbar.offsetHeight - 10;
                const left = bounds.left + window.scrollX + containerBounds.left + (bounds.width / 2) - (floatingToolbar.offsetWidth / 2);

                // Ensure it doesn't go off screen
                const adjustedLeft = Math.max(10, Math.min(left, window.innerWidth - floatingToolbar.offsetWidth - 10));

                floatingToolbar.style.top = `${top}px`;
                floatingToolbar.style.left = `${adjustedLeft}px`;
                floatingToolbar.classList.add('visible');

                // Update button states based on current formatting
                const formats = quill.getFormat(range);

                // Buttons
                floatingToolbar.querySelectorAll('button').forEach(btn => {
                    const format = btn.dataset.format;
                    const value = btn.dataset.value;

                    if (value) {
                        if (formats[format] == value) {
                            btn.classList.add('active');
                        } else {
                            btn.classList.remove('active');
                        }
                    } else {
                        if (formats[format]) {
                            btn.classList.add('active');
                        } else {
                            btn.classList.remove('active');
                        }
                    }
                });

                // Selects
                floatingToolbar.querySelectorAll('select').forEach(select => {
                    const format = select.dataset.format;
                    if (formats[format]) {
                        // Handle array values (like fonts sometimes) or simple strings
                        select.value = formats[format];
                    } else {
                        // Reset to default if no format applied
                        if (format === 'size') select.value = '';
                        else if (format === 'align') select.value = '';
                        else if (format === 'font') select.value = 'mirza'; // Default font
                        else select.value = select.options[0].value;
                    }
                });

            } else {
                floatingToolbar.classList.remove('visible');
            }
        });

        // Toolbar Button Actions
        floatingToolbar.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation(); // Prevent losing focus

                const format = btn.dataset.format;
                const value = btn.dataset.value;

                if (value) {
                    quill.format(format, value);
                } else {
                    const currentFormat = quill.getFormat();
                    quill.format(format, !currentFormat[format]);
                }
            });
        });

        // Toolbar Select Actions
        floatingToolbar.querySelectorAll('select').forEach(select => {
            select.addEventListener('change', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const format = select.dataset.format;
                const value = select.value;

                quill.format(format, value);
            });

            select.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        });
    }
}
