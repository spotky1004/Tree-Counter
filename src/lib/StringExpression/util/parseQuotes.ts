/**
 * Replace all strings to #i (i representes index)
 * and returns [replaced string, #i's values in array]
 */
export default function parseQuotes(str: string): [replaced: string, values: string[]] {
  let inQuote = false;
  let quoteStartPos = -1;
  /**
   * -1 = *nothing*,
   * 0 = ',
   * 1 = "
   */
  let quoteType = -1;
  let replaced = "";
  const values: string[] = [];
  for (let i = 0; i < str.length; i++) {
    const char = str[i];

    // Check the string is escape charactor
    if (char === "\\") {
      i++;
      replaced += char + (str[i + 1] ?? "");
      continue;
    }

    if (inQuote) {
      // Check if the string is quote close charactor
      if (
        (quoteType === 0 && char === "'") ||
        (quoteType === 1 && char === "\"")
      ) {
        inQuote = false;
        quoteType = -1;
        quoteStartPos = -1;
      } else {
        values[values.length - 1] += char;
      }
    } else {
      // Check if the string is quote open charactor
      if (char === "'" || char === "\"") {
        inQuote = true;
        quoteType = char === "'" ? 0 : 1;
        replaced += `#${values.length}`;
        quoteStartPos = i;
        values.push("");
      } else {
        replaced += char;
      }
    }
  }

  if (inQuote) {
    throw Error(`Quote must be closed (at ${quoteStartPos})`);
  }

  return [replaced, values];
}
