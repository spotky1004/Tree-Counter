import Decimal from "../../../../lib/Decimal.js";
import isFunction from "../util/isFunction.js";
const funcs = new Map();
function addFunc(name, func) {
    const argsCount = 0; // TODO
    funcs.set(name, [func, argsCount]);
}
export function getAllFuncName() {
    return [...funcs.keys()];
}
export function getFuncArgsCount(name) {
    const funcData = funcs.get(name);
    if (typeof funcData === "undefined")
        throw Error("This function does not exist.");
    const [, argsCount] = funcData;
    return argsCount;
}
export function calcFunc(name, variables, ...args) {
    const funcData = funcs.get(name);
    if (!funcData)
        throw Error("This function does not exist.");
    const [func, argsCount] = funcData;
    if (argsCount > args.length)
        throw Error(`This function recives minimum of ${argsCount} arguments.\n But recived ${args.length}.`);
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
    return args.reduce((a, b) => a + b, typeof args[0] === "string" ? "" : 0);
});
// type changers
addFunc("number", (v) => Number(v));
addFunc("string", (v) => String(v));
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
addFunc("xor", (a, b) => a ^ b);
// if
addFunc("if", (s, a) => s ? a : undefined);
addFunc("ifelse", (s, a, b) => s ? a : b);
addFunc("fif", function (s, a) {
    return s ? a.eval([], this) : undefined;
});
addFunc("fifelse", function (s, a, b) {
    return s ? a.eval([], this) : b.eval([], this);
});
// array
addFunc("arr", (...args) => args);
addFunc("arrget", (arr, i) => Array.isArray(arr) && !isNaN(Number(i)) ? arr[i] : undefined);
addFunc("arrset", (arr, i, value) => Array.isArray(arr) && !isNaN(Number(i)) ? (arr[i] = value) : undefined);
addFunc("len", (arr) => arr.length);
addFunc("map", function (arr, callback) {
    return arr.map((v, i) => callback.eval([v, i], this));
});
addFunc("reduce", function (arr, callback, initialValue) {
    return arr.reduce((a, b, i) => callback.eval([a, b, i], this), initialValue);
});
// string
addFunc("strtoarr", (str) => str.split(""));
addFunc("arrtostr", (arr) => Array.isArray(arr) ? arr.join("") : "");
addFunc("tocharcode", (char) => typeof char === "string" ? char.charCodeAt(0) : -1);
addFunc("tocharcodes", (str) => typeof str === "string" ? str.split("").map(v => v.charCodeAt(0)) : -1);
addFunc("fromcharcode", (code) => typeof code === "number" ? String.fromCharCode(code) : "");
addFunc("fromcharcodes", (codes) => Array.isArray(codes) ? codes.map(v => String.fromCharCode(v)) : "");
// Decimal.js
const avaiablDKeys = ["abs", "acos", "acosh", "add", "asin", "asinh", "atan", "atanh", "atan2", "cbrt", "ceil", "clamp", "clone", "cos", "cosh", "div", "exp", "floor", "hypot", "isDecimal", "ln", "log", "log2", "log10", "max", "min", "mod", "mul", "noConflict", "pow", "random", "round", "set", "sign", "sin", "sinh", "sqrt", "sub", "sum", "tan", "tanh", "trunc", "precision", "rounding", "minE", "maxE", "toExpNeg", "toExpPos", "modulo", "crypto", " ", "ROUND_UP", "ROUND_DOWN", "ROUND_CEIL", "ROUND_FLOOR", "ROUND_HALF_UP", "ROUND_HALF_DOWN", "ROUND_HALF_EVEN", "ROUND_HALF_CEIL", "ROUND_HALF_FLOOR", "EUCLID", "absoluteValue", "abs", "ceil", "comparedTo", "cmp", "clampedTo", "clamp", "cosine", "cos", "cubeRoot", "cbrt", "decimalPlaces", "dp", "dividedBy", "div", "dividedToIntegerBy", "divToInt", "equals", "eq", "floor", "greaterThan", "gt", "greaterThanOrEqualTo", "gte", "hyperbolicCosine", "cosh", "hyperbolicSine", "sinh", "hyperbolicTangent", "tanh", "inverseCosine", "acos", "inverseHyperbolicCosine", "acosh", "inverseHyperbolicSine", "asinh", "inverseHyperbolicTangent", "atanh", "inverseSine", "asin", "inverseTangent", "atan", "isFinite", "isInteger", "isInt", "isNaN", "isNegative", "isNeg", "isPositive", "isPos", "isZero", "lessThan", "lt", "lessThanOrEqualTo", "lte", "logarithm", "log", "minus", "sub", "modulo", "mod", "naturalExponential", "exp", "naturalLogarithm", "ln", "negated", "neg", "plus", "add", "precision", "sd", "round", "sine", "sin", "squareRoot", "sqrt", "tangent", "tan", "times", "mul", "toBinary", "toDecimalPlaces", "toDP", "toExponential", "toFixed", "toFraction", "toHexadecimal", "toHex", "toJSON", "toNearest", "toNumber", "toOctal", "toPower", "pow", "toPrecision", "toSignificantDigits", "toSD", "toString", "truncated", "trunc", "valueOf", "d", "digits", "e", "exponent", "s", "sign"];
addFunc("D", (x) => new Decimal(x));
addFunc("Decimal", (x) => new Decimal(x));
addFunc("Dmethod", (key, ...params) => {
    if (!avaiablDKeys.includes(key)) return throw Error("Invalid method.");
    const method = Decimal[key];
    if (!isFunction(method)) {
        return method;
    }
    // @ts-ignore
    return Decimal[key](...params);
});
addFunc("Dcalc", (a, key, ...params) => {
    if (!avaiablDKeys.includes(key)) return throw Error("Invalid function.");
    const method = a[key];
    if (!isFunction(method)) {
        return method;
    }
    // @ts-ignore
    return a[key](...params);
});
