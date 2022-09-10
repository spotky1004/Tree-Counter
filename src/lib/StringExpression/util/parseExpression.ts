import parseQuotes from "./parseQuotes.js";
import matchOne from "./matchOne.js";

export type ExpressionChunk = [string, ...(number | string)[]];
export type ExpressionCode = [variableNames: string[], expressionStr: string];
export type ParsedExpression = [parsedExpression: ExpressionChunk[], codes: ExpressionCode[]];
type FunctionData = [name: string, ...params: string[]];

// Lookup
// #i: ith value
// @i: ith chunk
// Ci: itn code
// Fi: ith function

// string starts with S

export default function parseStringExpression(str: string, maxLoop: number=1000): ParsedExpression {
  if (str.length === 0) throw Error("Expression length must be 1 or longer.");

  let loopLeft = maxLoop;
  function didLoop() {
    loopLeft--;
    if (loopLeft < 0) throw Error("This expression is too complex.\nChange StringExpression.MAX_LOOP to higher to parse more complex expression.");
  }

  // Parse expression codes
  const codes: ExpressionCode[] = [];
  const codeCheckRegexp = /{(?: )*\(([A-Za-z][A-Za-z0-9]*(?: )*|(?:[A-Za-z][A-Za-z0-9]*(?: )*,(?: )*)+(?:[A-Za-z][A-Za-z0-9]*(?: )*))?\)(?: )*=>(?: )*([^}]+)(?: )*}/;
  const codeGetRegexp = /^{(?: )*\(([A-Za-z][A-Za-z0-9]*(?: )*|(?:[A-Za-z][A-Za-z0-9]*(?: )*,(?: )*)+(?:[A-Za-z][A-Za-z0-9]*(?: )*))?\)(?: )*=>(?: )*(.+)(?: )*}$/;
  while (true) {
    didLoop();
    if (str.match(codeCheckRegexp) === null) break;
    let bracketsLevel = 0;
    let beginPos = -1;
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if (char === "{") {
        if (beginPos === -1) {
          beginPos = i;
        }
        bracketsLevel++;
      } else if (char === "}") {
        bracketsLevel--;
        if (bracketsLevel < 0) throw Error(`Invaild brackets pair. (at ${i})`);
        if (bracketsLevel === 0) {
          const codeStr = str.slice(beginPos, i+1);
          const variableNameStr = matchOne(codeStr, codeGetRegexp, 1) ?? "";
          const expressionStr = matchOne(codeStr, codeGetRegexp, 2);
          if (
            typeof variableNameStr === "undefined" ||
            typeof expressionStr === "undefined"
          ) throw Error("Unknown parse error. (001)");
          const variableNames = variableNameStr.replace(/ /g, "").split(",");
          const prevLoop = loopLeft;
          const loopUsed = prevLoop - loopLeft;
          loopLeft -= loopUsed;
          str = str.replace(codeStr, `C${codes.length}`);
          codes.push([variableNames, expressionStr]);
        }
      }
    }
  }

  // Fix -function (-1 * function)
  const minusFunctionNameRegexp = /(?<!#[A-Za-z0-9]*)-([A-Za-z0-9]+)(?=[A-Za-z0-9]*\()/;
  while (true) {
    const match = matchOne(str, minusFunctionNameRegexp, 1);
    if (typeof match === "undefined") break;
    str = str.replace(minusFunctionNameRegexp, `-1*` + match);
    didLoop();
  }

  // Parse string, numbers, variables and function names
  const values: (number | string)[] = [];
  // strings
  try {
    const [replaced, stringValues] = parseQuotes(str);
    str = replaced;
    values.push(...stringValues.map(s => `S${s}`));
  } catch (e) {
    throw e;
  }
  // Fix -string (-1 * function)
  const minusStringRegexp = /(?<!#[0-9]*)-(#[0-9]+)/;
  while (true) {
    const match = matchOne(str, minusStringRegexp, 1);
    if (typeof match === "undefined") break;
    str = str.replace(minusStringRegexp, `-1*` + match);
    didLoop();
  }
  // numbers
  const numberRegexp = /(?<!(?:\$|#|[A-Za-z])\d*)\d+(?:\.\d+)?(?:e\d+)?(?!\d*(?:\(|[A-Za-z]))/
  while (true) {
    const match = matchOne(str, numberRegexp);
    if (typeof match === "undefined") break;
    str = str.replace(numberRegexp, `#${values.length}`);
    values.push(Number(match));
    didLoop();
  }
  // variables
  const invaildVariableRegexp1 = /\$[0-9][A-Za-z0-9]*/;
  if (invaildVariableRegexp1.test(str)) {
    const match = str.match(invaildVariableRegexp1);
    throw Error(`Variable name '${match}' is invaild.\nVariable name must starts with alphabet.`);
  }
  // const invaildVariableRegexp2 = /\$[A-Za-z/0-9]*[^A-Za-z/0-9]+[A-Za-z/0-9]*/;
  // if (invaildVariableRegexp2.test(str)) {
  //   const match = str.match(invaildVariableRegexp2);
  //   throw Error(`Variable name '${match}' is invaild.\nOnly alphabet and number is allowed in variable name.`);
  // }
  const varialbesRegexp = /\$[A-Za-z][A-Za-z0-9]*/;
  while (true) {
    const match = matchOne(str, varialbesRegexp);
    if (typeof match === "undefined") break;
    str = str.replace(varialbesRegexp, `#${values.length}`);
    values.push(match);
    didLoop();
  }
  // function names
  const functionNameRegexp = /(?<!#[A-Za-z0-9]*)[A-Za-z0-9]+(?=[A-Za-z0-9]*\()/;
  while (true) {
    const match = matchOne(str, functionNameRegexp);
    if (typeof match === "undefined") break;
    str = str.replace(functionNameRegexp, `#${values.length}`);
    values.push(match);
    didLoop();
  }

  // Check the expression is vaild
  str = str.replace(/( |\t|\n)/g, "");
  // double variable
  const invaildTestRegexp1 = /#\d+#\d+/;
  if (invaildTestRegexp1.test(str)) {
    const invaildGetRegexp = /#(\d+)#(\d+)/;
    const idx1 = Number(matchOne(str, invaildGetRegexp, 1));
    const idx2 = Number(matchOne(str, invaildGetRegexp, 2));
    if (
      typeof idx1 === "undefined" ||
      typeof idx2 === "undefined"
    ) throw Error("Unknown parse error. (002)");
    throw Error(`Parse error between '${values[idx1]}' and '${values[idx2]}'.`);
  }
  // remaining strings
  const invaildTestRegexp2 = /(?<!#[A-Za-z0-9]*)[A-Za-z0-9]+/g;
  if (invaildTestRegexp2.test(str)) {
    const invaildExceptionRegexp = /C\d+/;
    const match = str.match(invaildTestRegexp2);
    if (match === null) throw Error("Unknown parse error. (003)");
    const filtered = match.filter(m => !invaildExceptionRegexp.test(m));
    if (filtered.length > 0) throw Error(`Parse error at '${match}'.`);
  }
  // barcat match
  let testBracketsLevel = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === "(") {
      testBracketsLevel++;
    } else if (char === ")") {
      testBracketsLevel--;
      if (testBracketsLevel < 0) throw Error(`Invaild brackets pair. (at ${i})`);
    }
  }
  if (testBracketsLevel !== 0) throw Error("There is one or more unterminated brackets.");

  // Parse functions
  const functions: FunctionData[] = [];
  const functionExistTestRegexp = /#\d+\(/;
  const functionBeginTestRegexp = /^#\d+\(/;
  const functionNameIdxRegexp = /^#(\d+)\(/;
  const functionParamsRegexp = /^#\d+\((.*)\)$/;
  funcLoop: while (true) {
    didLoop();
    if (!functionExistTestRegexp.test(str)) break;
    let bracketsLevel = 0;
    let beginPos = -1;
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      const sliced = str.slice(i);
      if (functionBeginTestRegexp.test(sliced)) {
        beginPos = i;
        bracketsLevel = 0;
      }
      if (char === "(") {
        bracketsLevel++;
      } else if (char === ")") {
        bracketsLevel--;
        if (bracketsLevel === 0) {
          const funcStr = str.slice(beginPos, i+1);
          str = str.replace(funcStr, `F${functions.length}`);
          const funcNameIdx = matchOne(funcStr, functionNameIdxRegexp, 1);
          if (typeof funcNameIdx === "undefined") throw Error("Unknown parse error. (004)");
          const funcName = values[Number(funcNameIdx)];
          if (typeof funcName === "number") throw Error("Unknown parse error. (005)");
          const params = matchOne(funcStr, functionParamsRegexp, 1);
          if (typeof params === "undefined") throw Error("Unknown parse error. (006)");
          const splitedParams = params.split(",");
          functions.push([funcName, ...splitedParams]);
          continue funcLoop;
        }
      }
    }
    if (bracketsLevel !== 0) throw Error("There is one or more unterminated brackets.");
  }

  // Parse expression
  const parsed: ExpressionChunk[] = [];
  const operatorPriorities = [
    ["^"],
    ["*", "/"],
    ["+", "-"],
    ["%"]
  ];
  const operatorRegexps: RegExp[] = operatorPriorities.map(ops => new RegExp(`((?:#|@|F|C)\\d+)(${ops.map(op => "\\" + op).join("|")})((?:#|@|F|C)\\d+)`));
  const parseEndRegexp = /^@\d+$/;
  const invaildTestRegexp3 = new RegExp(`(?:${operatorPriorities.flat().map(op => `\\${op}`).join("|")})$`);
  const minusFixCheckRegexp = /-#\d+/;
  parseExpression(str);
  function parseExpression(str: string): number {
    if (invaildTestRegexp3.test(str)) throw Error(`Syntax error (at '${str.slice(-1)}')`);
    while (true) {
      if (!str.includes("(")) {
        parsePart(str);
        break;
      }
      didLoop();
      let beginPos = -1;
      for (let i = 0; i < str.length; i++) {
        didLoop();
        const char = str[i];
        if (char === "(") {
          beginPos = i;
        } else if (char === ")") {
          if (beginPos !== -1) {
            const part = str.slice(beginPos+1, i);
            const point = parsePart(part);
            const pointStr = `@${point}`;
            str = str.replace(`(${part})`, pointStr);
            i -= `(${part})`.length - pointStr.length;
            beginPos = -1;
          } else {
            i = -1;
          }
        }
      }
      if (parseEndRegexp.test(str)) break;  
    }
    return parsed.length - 1;
  }
  function parsePart(part: string) {
    let didParse = false;
    exprLoop: while (true) {
      for (const regexp of operatorRegexps) {
        didLoop();
        if (!regexp.test(part)) continue;
        didParse = true;
        const operatorPart = matchOne(part, regexp);
        const operator = matchOne(part, regexp, 2);
        const val1point = matchOne(part, regexp, 1);
        const val2point = matchOne(part, regexp, 3);
        if (
          typeof operatorPart === "undefined" ||
          typeof operator === "undefined" ||
          typeof val1point === "undefined" ||
          typeof val2point === "undefined"
        ) throw Error("Unknown parse error. (007)");
        const vals = [
          val1point.startsWith("#") ? values[Number(val1point.slice(1))] : val1point,
          val2point.startsWith("#") ? values[Number(val2point.slice(1))] : val2point
        ];
        const point = parseOperator(operator, vals[0], vals[1]);
        part = part.replace(operatorPart, `@${point}`);
        continue exprLoop;
      }
      if (!didParse) {
        const val = part.startsWith("#") ? values[Number(part.slice(1))] : part;
        if (typeof val === "string" && minusFixCheckRegexp.test(val)) {
          parseOperator("minus", values[Number(val.slice(2))]);
        } else {
          parseOperator("val", val);
        }
        part = part.replace(part, ``);
      }
      didLoop();
      break;
    }
    return parsed.length - 1;
  }
  function parseOperator(operator: string, ...vals: (string | number)[]): number {
    didLoop();
    // Check function
    for (let i = 0; i < vals.length; i++) {
      const val = vals[i];
      if (
        typeof val !== "string" ||
        !val.startsWith("F")
      ) continue;
      const point = parseFunction(functions[Number(val.slice(1))]);
      // replace val to point
      vals[i] = `@${point}`;
    }
    parsed.push([operator, ...vals]);
    return parsed.length - 1;
  }
  function parseFunction(functionData: FunctionData) {
    let [funcName, ...funcParams] = functionData;
    funcParams = funcParams.filter(v => v !== "");
    const points = funcParams.map(param => parseExpression(param));
    parsed.push([funcName, ...points.map(p => `@${p}`)]);
    return parsed.length - 1;
  }

  return [parsed, codes];
}
