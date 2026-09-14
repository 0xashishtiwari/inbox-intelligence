import { GoogleGenAI } from '@google/genai';
import type { EmbeddingProvider } from './provider.js';

export class GeminiEmbeddingProvider implements EmbeddingProvider {

    private readonly client: GoogleGenAI;

    constructor(apiKey: string) {
        this.client = new GoogleGenAI({ apiKey });
    }

    async embed(text: string): Promise<number[]> {

        const response = await this.client.models.embedContent({
            model: "gemini-embedding-2",
            contents: text,
            config: {
                outputDimensionality: 1536
            }
        })
        const values = response.embeddings?.[0]?.values;

        if (!values) {
            throw new Error("No embedding values returned from Gemini API");
        }

        return values;
    }

}