import { searchLexical } from "./lexical.js";

const results = await searchLexical({
    mailboxId: "f79372f2-4c0f-49c2-b464-33f367dc46bb",
    query: "interview",
    threadId: "5127c6e1-32ea-4d8f-8508-e2f9a569344f",
    limit: 10,
});

console.log(results);

process.exit(0);
