import {GeminiEmbeddingProvider} from './gemini.js';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
}

const provider = new GeminiEmbeddingProvider(apiKey);

const embedding =  await provider.embed("This is a test string to generate an embedding for.");

console.log("Embedding generated:", embedding);
console.log("Embedding length:", embedding.length);