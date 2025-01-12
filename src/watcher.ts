import chokidar from 'chokidar';
import { indexFile } from './indexer';

const watchDirectory = (path: string, collection: string) => {
  const watcher = chokidar.watch(path, { persistent: true });

  watcher.on('add', (filePath) => {
    console.log(`File added: ${filePath}`);
    indexFile(filePath, collection);
  });
};

export { watchDirectory };
