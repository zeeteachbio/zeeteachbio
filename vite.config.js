import { defineConfig } from 'vite'
import { resolve } from 'path'
import fs from 'fs'

import { exec } from 'child_process'

// Dynamically find all HTML files in the root directory
const htmlFiles = fs.readdirSync(__dirname)
    .filter(file => file.endsWith('.html'))
    .reduce((acc, file) => {
        const name = file.replace(/\.html$/, '');
        acc[name] = resolve(__dirname, file);
        return acc;
    }, {});

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
