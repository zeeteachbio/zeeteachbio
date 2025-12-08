const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const articlesJsonPath = path.join(projectRoot, 'public', 'articles.json');
const searchDataPath = path.join(projectRoot, 'src', 'searchData.js');

function fixGhostArticles() {
    console.log('Starting ghost article cleanup...');

    // 1. Fix public/articles.json
    if (fs.existsSync(articlesJsonPath)) {
        console.log(`Reading ${articlesJsonPath}...`);
        try {
            const content = fs.readFileSync(articlesJsonPath, 'utf8');
            const articles = JSON.parse(content);
            const initialCount = articles.length;

            const validArticles = articles.filter(article => {
                // Remove leading slash for file path check
                const relativePath = article.url.startsWith('/') ? article.url.slice(1) : article.url;
                const fullPath = path.join(projectRoot, relativePath);

                if (fs.existsSync(fullPath)) {
                    return true;
                } else {
                    console.log(`[Ghost Detected] Removing: ${article.title} (${article.url})`);
                    return false;
                }
            });

            if (validArticles.length < initialCount) {
                fs.writeFileSync(articlesJsonPath, JSON.stringify(validArticles, null, 4));
                console.log(`Updated articles.json: Removed ${initialCount - validArticles.length} ghost entries.`);
            } else {
                console.log('articles.json is clean.');
            }
        } catch (e) {
            console.error('Error processing articles.json:', e);
        }
    } else {
        console.log('public/articles.json not found.');
    }

    // 2. Fix src/searchData.js
    if (fs.existsSync(searchDataPath)) {
        console.log(`Reading ${searchDataPath}...`);
        try {
            let content = fs.readFileSync(searchDataPath, 'utf8');

            // Extract the array part
            const match = content.match(/export\s+const\s+searchIndex\s*=\s*(\[[\s\S]*?\]);?/);
            if (match && match[1]) {
                const arrayString = match[1];
                let searchIndex;
                try {
                    // Use Function constructor to safely parse JS object literal if it's not strict JSON
                    // But since it's likely JSON-like, we can try JSON.parse first if it was strictly JSON, 
                    // but searchData.js might have trailing commas or unquoted keys (though admin.js writes valid JSON).
                    // Let's use the same approach as admin.js: Function constructor
                    searchIndex = new Function('return ' + arrayString)();
                } catch (e) {
                    console.error('Failed to parse searchIndex array:', e);
                    return;
                }

                const initialCount = searchIndex.length;
                const validIndex = searchIndex.filter(item => {
                    const relativePath = item.url.startsWith('/') ? item.url.slice(1) : item.url;
                    const fullPath = path.join(projectRoot, relativePath);

                    if (fs.existsSync(fullPath)) {
                        return true;
                    } else {
                        console.log(`[Ghost Detected in Search] Removing: ${item.title} (${item.url})`);
                        return false;
                    }
                });

                if (validIndex.length < initialCount) {
                    const newContent = `export const searchIndex = ${JSON.stringify(validIndex, null, 4)};`;
                    fs.writeFileSync(searchDataPath, newContent);
                    console.log(`Updated searchData.js: Removed ${initialCount - validIndex.length} ghost entries.`);
                } else {
                    console.log('searchData.js is clean.');
                }
            } else {
                console.log('Could not find searchIndex array in searchData.js');
            }
        } catch (e) {
            console.error('Error processing searchData.js:', e);
        }
    } else {
        console.log('src/searchData.js not found.');
    }
}

fixGhostArticles();
