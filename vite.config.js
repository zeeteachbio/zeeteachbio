import { defineConfig } from 'vite'
import { resolve } from 'path'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { VitePWA } from 'vite-plugin-pwa'

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
    plugins: [
        updateIndexPlugin(),
        VitePWA({
            registerType: 'autoUpdate',
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp}'],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-cache',
                            expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }
                        }
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'gstatic-fonts-cache',
                            expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }
                        }
                    },
                    {
                        urlPattern: /^https:\/\/cdnjs\.cloudflare\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'cdnjs-cache',
                            expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 30 }
                        }
                    }
                ]
            },
            manifest: {
                name: 'Zee Teach Bio',
                short_name: 'ZeeTeach',
                description: 'Biology Made Easy - Comprehensive notes for STB and AKUEB students',
                theme_color: '#8b5cf6',
                icons: [
                    { src: '/logo-hexagon.svg', sizes: '192x192', type: 'image/svg+xml' },
                    { src: '/logo-hexagon.svg', sizes: '512x512', type: 'image/svg+xml' }
                ]
            }
        })
    ],
    base: '/',
    build: {
        rollupOptions: {
            input: htmlFiles
        }
    }
})

