import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

const files = fs.readdirSync(rootDir);

files.forEach(file => {
    if (file.endsWith('.html')) {
        const filePath = path.join(rootDir, file);
        let content = fs.readFileSync(filePath, 'utf-8');

        // Check if Forum link already exists
        if (!content.includes('href="/forum.html"')) {
            // Insert after Home link
            const homeLink = '<a href="/" class="nav-link">Home</a>';
            const forumLink = '\n                    <a href="/forum.html" class="nav-link">Forum</a>';

            if (content.includes(homeLink)) {
                content = content.replace(homeLink, homeLink + forumLink);
                fs.writeFileSync(filePath, content);
                console.log(`Updated ${file}`);
            }
        }
    }
});
