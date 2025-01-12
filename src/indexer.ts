import OpenAI from 'openai';
import { QdrantClient } from '@qdrant/js-client-rest';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const qdrant = new QdrantClient({
  host: process.env.QDRANT_HOST,
  port: Number(process.env.QDRANT_PORT),
});

const indexFile = async (filePath: string, collection: string) => {
  const content = fs.readFileSync(filePath, 'utf-8');

  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: content,
  });
  const embedding = embeddingResponse.data[0].embedding;

  const fileName = filePath.split('/').pop();
  const fileMetadata = {
    fileName,
    filePath,
    content: content,
  };

  await qdrant.upsert(collection, {
    wait: true,
    points: [
      {
        id: uuidv4(),
        vector: embedding,
        payload: fileMetadata,
      },
    ],
  });
};

export { indexFile };
