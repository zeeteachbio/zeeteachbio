import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const searchDataPath = path.join(rootDir, 'src', 'searchData.js');

// Files to exclude
const EXCLUDED_FILES = [
    'index.html',
    'search.html',
    'admin.html',
    'class9.html',
    'class10.html',
    'class11.html',
    'class12.html',
    'test-test.html',
    'test_api.html'
];

function extractData(content, filename) {
    // Title
    let titleMatch = content.match(/<title>(.*?) - Zee Teach<\/title>/);
    let title = titleMatch ? titleMatch[1] : '';
    if (!title) {
        titleMatch = content.match(/<title>(.*?)<\/title>/);
        title = titleMatch ? titleMatch[1] : '';
    }
    if (!title) {
        titleMatch = content.match(/<h1.*?>(.*?)<\/h1>/);
        title = titleMatch ? titleMatch[1] : filename;
    }

    // Category
    let category = 'General';
    if (filename.includes('class9')) category = 'Class 9';
    else if (filename.includes('class10')) category = 'Class 10';
    else if (filename.includes('class11')) category = 'Class 11';
    else if (filename.includes('class12')) category = 'Class 12';

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
        // Try to get first paragraph of body if no article-body class
        const pMatch = content.match(/<p[^>]*>([\s\S]*?)<\/p>/);
        if (pMatch) {
            excerpt = pMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
        }
    }

    if (!excerpt || excerpt.length < 5) excerpt = "Click to read more.";
    if (excerpt.length > 120) excerpt = excerpt.substring(0, 120) + '...';

    return { title, category, excerpt };
}

// 1. Read existing data
let existingData = [];
try {
    if (fs.existsSync(searchDataPath)) {
        const fileContent = fs.readFileSync(searchDataPath, 'utf-8');
        // Extract the array part
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

// 2. Scan directory
const files = fs.readdirSync(rootDir);
const articles = [];

files.forEach(file => {
    if (file.endsWith('.html') && !EXCLUDED_FILES.includes(file)) {
        // Filter logic: Must start with article- OR be explicitly whitelisted?
        // User said "upload any new article". 
        // Let's include all HTML files that are not excluded.

        const content = fs.readFileSync(path.join(rootDir, file), 'utf-8');
        const { title, category, excerpt } = extractData(content, file);
        const url = `/${file}`;

        let entry = existingMap.get(url);
        if (entry) {
            // Update mutable fields but keep stats/date
            entry.title = title;
            entry.category = category;
            entry.excerpt = excerpt;
        } else {
            // New entry
            entry = {
                title,
                url,
                excerpt,
                category,
                date: new Date().toISOString(),
                views: 0,
                comments: 0
            };
        }
        articles.push(entry);
    }
});

// 3. Write back
const outputContent = `export const searchIndex = ${JSON.stringify(articles, null, 4)};\n`;
fs.writeFileSync(searchDataPath, outputContent);

console.log(`Updated search index with ${articles.length} articles.`);
