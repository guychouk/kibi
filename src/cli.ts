import { Command } from 'commander';
import dotenv from 'dotenv';

dotenv.config();
import { queryRAG } from './rag';
import { indexFile } from './indexer';
import fs from 'fs';
import readline from 'readline';
import { QdrantClient } from '@qdrant/js-client-rest';

const qdrant = new QdrantClient({
  host: process.env.QDRANT_HOST,
  port: Number(process.env.QDRANT_PORT),
});

const program = new Command();

program
  .name('kibi')
  .description('CLI for querying the RAG engine')
  .version('1.0.0')
  .argument('<query>', 'query to search')
  .argument('<collection>', 'collection to search in')
  .action(async (query, collection) => {
    const result = await queryRAG(query, collection);
    console.log(result);
  });

program
  .command('create-collection <name>')
  .description('Create a new collection in Qdrant')
  .action(async (name) => {
    try {
      await qdrant.createCollection(name, {
        vectors: { size: 1536, distance: 'Cosine' },
      });
      console.log(`Collection ${name} created successfully.`);
    } catch (error) {
      console.error(`Failed to create collection: ${(error as Error).message}`);
    }
  });

program
  .command('drop-collection <name>')
  .description('Drop a collection in Qdrant')
  .action(async (name) => {
    try {
      await qdrant.deleteCollection(name);
      console.log(`Collection ${name} dropped successfully.`);
    } catch (error) {
      console.error(`Failed to drop collection: ${(error as Error).message}`);
    }
  });

program
  .command('index-and-chat <directory> <collection>')
  .description('Index a directory and start a chat session')
  .action(async (directory, collection) => {
    try {
      const files = fs.readdirSync(directory);
      for (const file of files) {
        const filePath = `${directory}/${file}`;
        await indexFile(filePath, collection);
      }
      console.log(`Indexed files from ${directory} into collection ${collection}.`);

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      console.log('Chat session started. Type your message and press Enter.');

      rl.on('line', async (input) => {
        const response = await queryRAG(input, collection);
        console.log(`AI: ${response}`);
      });
    } catch (error) {
      console.error(`Error during indexing or chat: ${(error as Error).message}`);
    }
  });

program.parse(process.argv);
