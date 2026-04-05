import { filterUndefineds } from "./filterUndefineds";
import {
  isJapaneseSeparator,
  isJapaneseSuffix,
  isKatakana,
  isLatin,
  tokenizeJapanese,
} from "./kuromoji";

export async function lemmatizeJapaneseSentences(
  sentences: string[],
  {
    onError = "throw",
  }: {
    onError?: "useword" | "throw" | "returnempty";
  }
) {
  return sentences.map((sentence) => {
    let lastWord: string;

    return filterUndefineds(
      tokenizeJapanese(sentence).map((token) => {
        if (isJapaneseSeparator(token)) {
          return undefined;
        }

        if (isJapaneseSuffix(token)) {
          if (lastWord && !isKatakana(lastWord)) {
            return undefined;
          } else {
            return token.surface_form;
          }
        }

        lastWord = token.basic_form;

        if (token.word_type == "UNKNOWN") {
          if (isKatakana(token.surface_form) || isLatin(token.surface_form)) {
            return token.surface_form;
          }

          if (onError == "throw") {
            throw new Error(
              `Unknown word: ${token.surface_form} in sentence: ${sentence}`
            );
          } else if (onError == "useword") {
            lastWord = token.surface_form;
          } else if (onError == "returnempty") {
            return undefined;
          }
        }

        return lastWord;
      })
    );
  });
}
