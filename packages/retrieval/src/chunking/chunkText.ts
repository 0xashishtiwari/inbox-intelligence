const MAX_CHUNK_SIZE = 1200;

export function chunkText(text: string): string[] {
    const paragraphs = text
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);

    const chunks: string[] = [];
    let currentChunk = "";

    for (const paragraph of paragraphs) {
        // If this paragraph itself is larger than the limit,
        // split it into smaller pieces.
        if (paragraph.length > MAX_CHUNK_SIZE) {
            if (currentChunk) {
                chunks.push(currentChunk);
                currentChunk = "";
            }

            for (let i = 0; i < paragraph.length; i += MAX_CHUNK_SIZE) {
                chunks.push(
                    paragraph.slice(i, i + MAX_CHUNK_SIZE)
                );
            }

            continue;
        }

        if (!currentChunk) {
            currentChunk = paragraph;
            continue;
        }

        const candidate = `${currentChunk}\n\n${paragraph}`;

        if (candidate.length <= MAX_CHUNK_SIZE) {
            currentChunk = candidate;
        } else {
            chunks.push(currentChunk);
            currentChunk = paragraph;
        }
    }

    if (currentChunk) {
        chunks.push(currentChunk);
    }

    return chunks;
}