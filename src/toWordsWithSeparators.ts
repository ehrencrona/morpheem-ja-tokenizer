import {
  isJapaneseSeparator,
  isJapaneseSuffix,
  isKatakana,
  tokenizeJapanese,
} from "./kuromoji";

export interface WordPair {
  word: string;
  /** null for separators (punctuation, digits, Latin-containing unknowns etc.) */
  lemma: string | null;
}

/**
 * Tokenizes into the same word strings as toWordsWithSeparators, with the lemma
 * of each word attached. Having both come from the same pass guarantees that
 * word strings and lemmas can never get misaligned.
 */
export function toWordPairs(sentence: string): WordPair[] {
  const tokens = tokenizeJapanese(sentence);

  const result: WordPair[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (
      result.length &&
      isJapaneseSuffix(token) &&
      // ケーキだった - it thinks だ is a verb ending
      !isKatakana(result[result.length - 1].word)
    ) {
      // the merged word keeps the lemma of its base token
      result[result.length - 1].word += token.surface_form;
    } else {
      result.push({
        word: token.surface_form,
        lemma: isJapaneseSeparator(token)
          ? null
          : token.word_type == "UNKNOWN"
            ? token.surface_form
            : token.basic_form,
      });
    }
  }

  return result;
}

export function toWordsWithSeparators(sentence: string): string[] {
  return toWordPairs(sentence).map(({ word }) => word);
}
