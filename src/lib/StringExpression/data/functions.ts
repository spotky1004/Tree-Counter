import type StringExpression from "../StringExpression.js";
import type Variables from "../Variables.js";

// type AvaiableTypes = number | string | number[] | string[];
type Func = (this: Variables<any>, ...args: any[]) => any;
const funcs: Map<string, [func: Func, argsCount: number]> = new Map();
function addFunc(name: string, func: Func) {
  const argsCount = 0; // TODO
  funcs.set(name, [func, argsCount]);
}

export function getAllFuncName() {
  return [...funcs.keys()];
}
export function getFuncArgsCount(name: string) {
  const funcData = funcs.get(name);
  if (typeof funcData === "undefined") throw Error("This function does not exist.");
  const [, argsCount] = funcData;
  return argsCount;
}
export function calcFunc(name: string, variables: Variables<any>, ...args: any[]) {
  const funcData = funcs.get(name);
  if (!funcData) throw Error("This function does not exist.");
  const [func, argsCount] = funcData;
  if (argsCount > args.length) throw Error(`This function recives minimum of ${argsCount} arguments.\n But recived ${args.length}.`);
  return func.call(variables, ...args);
}

// important functions
addFunc("val", (v) => v);
// operators
addFunc("%", (a, b) => a % b);
addFunc("+", (a, b) => a + b);
addFunc("-", (a, b) => a - b);
addFunc("*", (a, b) => a * b);
addFunc("/", (a, b) => a / b);
addFunc("^", (a, b) => a ** b);
// math functions
addFunc("minus", (x) => -x);
addFunc("min", (a, b) => Math.min(a, b));
addFunc("max", (a, b) => Math.max(a, b));
addFunc("sqrt", (a) => Math.sqrt(a));
addFunc("round", (x) => Math.round(x));
addFunc("abs", (x) => Math.abs(x));
addFunc("sign", (x) => Math.sign(x));
addFunc("sin", (x) => Math.sin(x));
addFunc("cos", (x) => Math.cos(x));
addFunc("tan", (x) => Math.tan(x));
addFunc("atan2", (y, x) => Math.atan2(y, x));
// complex math functions
addFunc("rand", () => Math.random());
addFunc("randr", (a, b) => a + (Math.random()) * (b - a));
addFunc("randint", (a, b) => Math.floor(a + (Math.random()) * (b - a)));
addFunc("rands", (n) => Array.from({ length: Number(n) }, () => Math.random()));
addFunc("sum", (...args) => {
  if (args.length === 1 && Array.isArray(args[0])) {
    args = args[0];
  }
  return args.reduce((a, b) => a + b, typeof args[0] === "string" ? "" : 0)
});
// type changers
addFunc("number", (v) => Number(v));
addFunc("string", (v) => String(v));
addFunc("bigint", (v) => BigInt(v));
// compare
addFunc("eq", (a, b) => a === b);
addFunc("gt", (a, b) => a > b);
addFunc("lt", (a, b) => a < b);
addFunc("gte", (a, b) => a >= b);
addFunc("lte", (a, b) => a <= b);
// bool
addFunc("and", (...v) => v.every(v => v == true));
addFunc("or", (...v) => !!v.find(v => v == true));
addFunc("not", (a) => !a);
// if
addFunc("if", (s, a) => s ? a : undefined);
addFunc("ifelse", (s, a, b) => s ? a : b);
addFunc("fif", function (s, a: StringExpression) {
  return s ? a.eval([], this) : undefined;
});
addFunc("fifelse", function (s, a: StringExpression, b: StringExpression) {
  return s ? a.eval([], this) : b.eval([], this);
});
// array
addFunc("arr", (...args) => args);
addFunc("arrget", (arr, i) => Array.isArray(arr) ? arr[i] : undefined);
addFunc("arrset", (arr, i, value) => Array.isArray(arr) ? (arr[i] = value) : undefined);
addFunc("len", (arr) => arr.length);
addFunc("map", function (arr: any[], callback: StringExpression) {
  return arr.map((v, i) => callback.eval([v, i], this));
});
addFunc("reduce", function (arr: any[], callback: StringExpression, initialValue: any) {
  return arr.reduce((a, b, i) => callback.eval([a, b, i], this), initialValue)
});
// string
addFunc("strtoarr", (str) => str.split(""));
addFunc("arrtostr", (arr) => Array.isArray(arr) ? arr.join("") : "")
addFunc("tocharcode", (char) => typeof char === "string" ? char.charCodeAt(0) : -1);
addFunc("tocharcodes", (str) => typeof str === "string" ? str.split("").map(v => v.charCodeAt(0)) : -1);
addFunc("fromcharcode", (code) => typeof code === "number" ? String.fromCharCode(code) : "");
addFunc("fromcharcodes", (codes) => Array.isArray(codes) ? codes.map(v => String.fromCharCode(v)) : "");
