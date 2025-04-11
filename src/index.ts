import { initializeKuromoji } from "./kuromoji";
import { lemmatizeJapaneseSentences } from "./lemmatize";
import { z } from "zod";
import { toWordsWithSeparators } from "./toWordsWithSeparators";

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

console.log(`Starting server on port ${port}...`);

initializeKuromoji();

Bun.serve({
  routes: {
    // Static routes
    "/healthcheck": new Response("OK"),

    "/to-word-strings": async (req) => {
      const { text } = z
        .object({
          text: z.string(),
        })
        .parse(await req.json());

      const wordStrings = toWordsWithSeparators(text);

      console.log(`tokenize "${text}" -> ${wordStrings.join(", ")}`);

      return new Response(JSON.stringify({ segments: wordStrings }), {
        headers: {
          "Content-Type": "application/json",
        },
      });
    },

    "/lemmatize": async (req) => {
      const { sentences, onError } = z
        .object({
          sentences: z.array(z.string()),
          onError: z.enum(["throw", "useword", "returnempty"]).optional(),
        })
        .parse(await req.json());

      const lemmatized = await lemmatizeJapaneseSentences(sentences, {
        onError,
      });

      for (const i of sentences.keys()) {
        const sentence = sentences[i];
        const lemmatizedSentence = lemmatized[i];

        console.log(
          `lemmatize "${sentence}" -> ${lemmatizedSentence.join(", ")}`
        );
      }

      return new Response(JSON.stringify(lemmatized), {
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
  },

  error: (error) => {
    console.error("Error:", error);
    return new Response("Internal Server Error: " + error.toString(), {
      status: 500,
    });
  },

  // (optional) fallback for unmatched routes:
  // Required if Bun's version < 1.2.3
  fetch(req) {
    return new Response("Not Found", { status: 404 });
  },

  port,
});
