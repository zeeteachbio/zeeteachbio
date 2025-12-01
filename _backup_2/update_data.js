import { searchIndex } from './src/searchData.js';
import fs from 'fs';

const updatedIndex = searchIndex.map(item => ({
    ...item,
    date: new Date().toISOString(),
    views: 0,
    comments: 0
}));

const content = `export const searchIndex = ${JSON.stringify(updatedIndex, null, 4)};\n`;
fs.writeFileSync('./src/searchData.js', content);
console.log('Updated searchData.js');
