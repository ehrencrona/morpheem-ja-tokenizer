import { IpadicFeatures } from "kuromoji";
import { getJapaneseTokenizer, isSeparator } from "./kuromoji";

export function tokenizeJapanese(text: string) {
  const tokenizer = getJapaneseTokenizer();

  const tokens = tokenizer.tokenize(text);

  const i = tokens.findIndex(
    (token, i) =>
      token.surface_form == "だっ" && tokens[i + 1].surface_form == "た"
  );

  if (i >= 0) {
    tokens.splice(i, 2, {
      word_id: 0,
      word_type: "KNOWN",
      word_position: i + 1,
      surface_form: "だった",
      pos: "助動詞",
      pos_detail_1: "*",
      pos_detail_2: "*",
      pos_detail_3: "*",
      conjugated_type: "",
      conjugated_form: "",
      basic_form: "です",
      reading: "ダッタ",
      pronunciation: "ダッタ",
    });
  }

  return tokens;
}

let loggedSuffixes = new Set<string>();

export function isJapaneseSuffix(token: IpadicFeatures) {
  if (["こ", "ます"].includes(token.basic_form)) {
    return true;
  }

  if (["いる", "方", "です", "くださる", "時"].includes(token.basic_form)) {
    return false;
  }

  if (token.pos == "助動詞") {
    if (!loggedSuffixes.has(token.basic_form)) {
      console.log(token.basic_form + " is a suffix (助動詞)");
      loggedSuffixes.add(token.basic_form);
    }

    return true;
  }

  // "te" in "shite" or "re" in "sareru", respectively
  if (
    (token.pos_detail_1 == "接続助詞" || token.pos_detail_1 == "接尾") &&
    // さん in names, 性 as in 可能性, 証 in 学生証
    token.pos != "名詞"
  ) {
    if (!loggedSuffixes.has(token.basic_form)) {
      console.log(token.basic_form + ` is an ending (${token.pos})`);
      loggedSuffixes.add(token.basic_form);
    }

    return true;
  }

  // "teru". if you don't exclude nouns, it thinks 点 is a suffix.
  // verbs are things like なさる and くれる
  if (
    token.pos_detail_1 == "非自立" &&
    token.pos != "名詞" &&
    token.pos != "動詞"
  ) {
    if (!loggedSuffixes.has(token.basic_form)) {
      console.log(token.basic_form + ` is a suffix (${token.pos})`);
      loggedSuffixes.add(token.basic_form);
    }

    return true;
  }

  return false;
}

export function isJapaneseSeparator(token: IpadicFeatures) {
  return (
    token.pos === "記号" ||
    (token.word_type == "UNKNOWN" &&
      isSeparator(token.surface_form, { code: "ja" })) ||
    token.surface_form == "％" ||
    token.surface_form.match(/^[０-９]+/)
  );
}
