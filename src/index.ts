import dotenv from 'dotenv';
dotenv.config();

import { watchDirectory } from './watcher';

const collectionName = process.argv[2];
const directoryToWatch = './data';

watchDirectory(directoryToWatch, collectionName);
