import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const directoryPath = path.join(__dirname, '../');

fs.readdir(directoryPath, (err, files) => {
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    }

    files.forEach((file) => {
        if (path.extname(file) === '.html') {
            const filePath = path.join(directoryPath, file);
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    return console.log(err);
                }

                // Regex to remove the Forum link
                const result = data.replace(/<a\s+href="\/forum\.html"[^>]*>Forum<\/a>\s*/g, '');

                if (result !== data) {
                    fs.writeFile(filePath, result, 'utf8', (err) => {
                        if (err) return console.log(err);
                        console.log(`Updated: ${file}`);
                    });
                }
            });
        }
    });
});
