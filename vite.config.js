import { defineConfig } from 'vite'
import { resolve } from 'path'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'

// Recursively find all HTML files in a directory
function findHtmlFiles(dir, basePath = '') {
    const files = {};
    // Check if directory exists before reading
    if (!fs.existsSync(dir)) return files;

    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        const relativePath = basePath ? path.join(basePath, item.name) : item.name;

        if (item.isDirectory()) {
            // Skip node_modules, dist, and backup directories
            if (['node_modules', 'dist', '_backup_2', '_backup_3', '_backup_2025_12_01', '.git'].includes(item.name)) {
                continue;
            }
            Object.assign(files, findHtmlFiles(fullPath, relativePath));
        } else if (item.name.endsWith('.html')) {
            const name = relativePath.replace(/\.html$/, '').replace(/\\/g, '/');
            files[name] = resolve(fullPath);
        }
    }
    return files;
}

// Find all HTML files in the project
const htmlFiles = findHtmlFiles(__dirname);

const updateIndexPlugin = () => {
    return {
        name: 'update-index',
        handleHotUpdate({ file, server }) {
            if (file.endsWith('.html') && file.includes('article-')) {
                exec('node scripts/update_index.js', (err, stdout, stderr) => {
                    if (err) console.error('Error updating index:', err);
                    else console.log('Auto-updated search index');
                });
            }
        }
    }
}

export default defineConfig({
    plugins: [updateIndexPlugin()],
    base: '/',
    build: {
        rollupOptions: {
            input: htmlFiles
        }
    }
})
