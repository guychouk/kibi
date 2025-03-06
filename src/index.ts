import chokidar from 'chokidar';
import dotenv from 'dotenv';
dotenv.config();

import { indexFile } from './indexer';

const directoryToWatch = './data';

const collectionName = process.argv[2];
if (!collectionName) {
    console.error('Please provide a Qdrant collection name as an argument');
    process.exit(1);
}

const watcher = chokidar.watch(directoryToWatch, { persistent: true });

watcher.on('add', (filePath) => {
    console.log(`❗File added: ${filePath}`);
    indexFile(filePath, collectionName);
});

console.log(`Watching for new files in the ${directoryToWatch} directory...`);
