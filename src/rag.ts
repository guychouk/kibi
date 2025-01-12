import OpenAI from 'openai';
import { QdrantClient } from '@qdrant/js-client-rest';

const SYSTEM_PROMPT = `
You are a highly knowledgeable and concise assistant. You have access to context from relevant documents and must answer user queries by synthesizing the provided information. Focus on directly answering the user's question using the most relevant details from the documents. If multiple documents are equally relevant, combine their insights. Avoid repeating unnecessary details and clearly indicate when the available information is insufficient to answer the query fully.
`;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const qdrant = new QdrantClient({
  host: process.env.QDRANT_HOST,
  port: Number(process.env.QDRANT_PORT),
});

const queryRAG = async (query: string, collection: string) => {
  // Convert query to embedding
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: query,
  });
  const embedding = embeddingResponse.data[0].embedding;

  // Perform similarity search in Qdrant
  const results = await qdrant.search(collection, {
    vector: embedding,
    limit: 3,
  });

  console.log(results);
  const formattedResults = results
  .map((result, index) => {
    const snippet = result.payload?.content || "No snippet available.";
    return `${index + 1}. "${snippet}"`;
  })
  .join('\n');

  console.log(formattedResults);
  // Use OpenAI to generate a response
  const chatResponse = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Here are the top three relevant documents:\n${formattedResults}\n\nQuery: ${query}` },
    ],
    max_tokens: 150,
  });

  return chatResponse.choices[0].message.content;
};

export { queryRAG };
