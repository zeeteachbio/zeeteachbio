import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const searchDataPath = path.join(rootDir, 'src', 'searchData.js');

// Files/Dirs to exclude
const EXCLUDED_NAMES = [
    'node_modules', 'dist', '.git', '.github', '_backup_2', '_backup_3', '_backup_2025_12_01', 'scripts', 'public'
];
const EXCLUDED_FILES = [
    'index.html', 'search.html', 'admin.html', 'chapter.html', 'test_api.html', 'animated-logo.html', 'dna-animation.html'
];

function findHtmlFiles(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
            if (!EXCLUDED_NAMES.includes(item.name)) {
                findHtmlFiles(fullPath, fileList);
            }
        } else if (item.name.endsWith('.html') && !EXCLUDED_FILES.includes(item.name)) {
            // Also check if it's an index.html inside a class folder (we might want to exclude those too if they are just listings)
            // But for now, let's include them if they have content.
            // Actually, usually index.html in subfolders are listing pages. Let's exclude 'index.html' generally.
            if (item.name !== 'index.html') {
                fileList.push(fullPath);
            }
        }
    }
    return fileList;
}

function extractData(content, filepath) {
    // Title
    let titleMatch = content.match(/<title>(.*?) - Zee Teach<\/title>/);
    let title = titleMatch ? titleMatch[1] : '';
    if (!title) {
        titleMatch = content.match(/<title>(.*?)<\/title>/);
        title = titleMatch ? titleMatch[1] : '';
    }
    if (!title) {
        titleMatch = content.match(/<h1.*?>(.*?)<\/h1>/);
        title = titleMatch ? titleMatch[1] : path.basename(filepath, '.html');
    }

    // Category & Chapter from Path
    // Path format: .../stb/class9/ch1-intro.../file.html
    const relativePath = path.relative(rootDir, filepath).replace(/\\/g, '/');
    const parts = relativePath.split('/');

    let category = 'General';
    let chapter = null;

    if (parts.includes('stb')) {
        const classPart = parts.find(p => p.startsWith('class'));
        if (classPart) category = `STB Class ${classPart.replace('class', '')}`;
    } else if (parts.includes('akueb')) {
        const classPart = parts.find(p => p.startsWith('class'));
        if (classPart) category = `AKUEB Class ${classPart.replace('class', '')}`;
    }

    // Chapter is usually the parent folder of the file
    // e.g. stb/class9/ch1-introduction/file.html -> ch1-introduction
    if (parts.length >= 2) {
        const parent = parts[parts.length - 2];
        if (parent.startsWith('ch')) {
            // Try to make it readable: ch1-introduction-to-biology -> 1. Introduction to Biology
            // This is a guess, but better than slug.
            // Or just keep the slug if we can't parse.
            // Let's try to extract number.
            const match = parent.match(/^ch(\d+)-(.*)/);
            if (match) {
                const num = match[1];
                const text = match[2].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                chapter = `${num}. ${text}`;
            } else {
                chapter = parent;
            }
        }
    }

    // Excerpt
    let excerpt = '';
    const bodyMatch = content.match(/class="article-body"[^>]*>([\s\S]*?)<\/div>/);
    if (bodyMatch) {
        const pMatch = bodyMatch[1].match(/<p[^>]*>([\s\S]*?)<\/p>/);
        if (pMatch) {
            excerpt = pMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
        }
    }

    if (!excerpt) {
        const metaMatch = content.match(/<meta name="description" content="(.*?)"/);
        if (metaMatch) excerpt = metaMatch[1];
    }

    if (!excerpt) {
        const pMatch = content.match(/<p[^>]*>([\s\S]*?)<\/p>/);
        if (pMatch) {
            excerpt = pMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
        }
    }

    if (!excerpt || excerpt.length < 5) excerpt = "Click to read more.";
    if (excerpt.length > 120) excerpt = excerpt.substring(0, 120) + '...';

    return { title, category, chapter, excerpt };
}

// 1. Read existing data
let existingData = [];
try {
    if (fs.existsSync(searchDataPath)) {
        const fileContent = fs.readFileSync(searchDataPath, 'utf-8');
        const jsonMatch = fileContent.match(/export const searchIndex = (\[[\s\S]*?\]);/);
        if (jsonMatch) {
            existingData = JSON.parse(jsonMatch[1]);
        }
    }
} catch (e) {
    console.error("Error reading existing data:", e);
}

// Map url -> existing entry
const existingMap = new Map();
existingData.forEach(item => existingMap.set(item.url, item));

// 2. Scan directory recursively
const allHtmlFiles = findHtmlFiles(rootDir);
const articles = [];

allHtmlFiles.forEach(filepath => {
    const content = fs.readFileSync(filepath, 'utf-8');
    const { title, category, chapter, excerpt } = extractData(content, filepath);

    // Construct URL relative to root
    const relativePath = path.relative(rootDir, filepath).replace(/\\/g, '/');
    const url = `/${relativePath}`;

    let entry = existingMap.get(url);
    if (entry) {
        entry.title = title;
        entry.category = category;
        entry.chapter = chapter || entry.chapter; // Keep existing chapter if extraction fails
        entry.excerpt = excerpt;
    } else {
        entry = {
            title,
            url,
            excerpt,
            category,
            chapter,
            date: new Date().toISOString(),
            views: 0,
            comments: 0,
            thumbnail: null
        };
    }
    articles.push(entry);
});

// 3. Write back
const outputContent = `export const searchIndex = ${JSON.stringify(articles, null, 4)};\n`;
fs.writeFileSync(searchDataPath, outputContent);

console.log(`Updated search index with ${articles.length} articles.`);
