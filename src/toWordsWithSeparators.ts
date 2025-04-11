import { isJapaneseSuffix, isKatakana, tokenizeJapanese } from "./kuromoji";

export function toWordsWithSeparators(sentence: string): string[] {
  const tokens = tokenizeJapanese(sentence);

  const result: string[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (
      result.length &&
      isJapaneseSuffix(token) &&
      // ケーキだった - it thinks だ is a verb ending
      !isKatakana(result[result.length - 1])
    ) {
      result[result.length - 1] += token.surface_form;
    } else {
      result.push(token.surface_form);
    }
  }

  return result;
}
