const LOOP_LIMIT = 300;
export default class StringExpression {
    constructor(expression) {
        this.rawExpression = expression;
        this.expression = StringExpression.parseExpression(expression);
        this.isVaild = this.expression !== false;
    }
    static parseExpression(expression) {
        var _a;
        let loops = 0;
        if (!expression.match(/^([A-z0-9()$+\-*/%\^,\.]|\s|\"([^"]|\")+\"|\'([^']|\')+\')+$/) ||
            expression.match(/^(\s|[A-z0-9])+$/))
            return false;
        // replace strings
        const replacedStrings = (_a = expression.match(/"(\\\\|\\"|[^"])*"/g)) !== null && _a !== void 0 ? _a : [];
        let stringIdx = 0;
        expression = expression.replace(/"(\\\\|\\"|[^"])*"/g, () => { return `"${stringIdx++}"`; });
        expression = "(" + expression.replace(/\s/g, "") + ")";
        // Find Minus
        while (true) {
            loops++;
            if (loops > LOOP_LIMIT)
                return false;
            const isMinusExist = expression.match(/(\(|[+\-*/&^,])-([^,)+\-*/&^]+)/) !== null;
            if (!isMinusExist)
                break;
            expression = expression.replace(/(\(|[+\-*/&^,])-([^,)+\-*/&^]+)/g, "$1minus($2)");
        }
        // Find mathFunctions
        expression = expression.replace(/((?<![$"]|\w|\s)(?:[a-z][a-z0-9]*)(?![$"]|\w|\s))/g, "{$1}");
        let searchingFunctions = [];
        for (let i = 0; i < expression.length; i++) {
            let char = expression[i];
            if (char === "}") {
                searchingFunctions.push(0);
            }
            else if (char === "(") {
                if (searchingFunctions.includes(0)) {
                    expression = expression.slice(0, i) + "<" + expression.slice(i + 1);
                }
                searchingFunctions = searchingFunctions.map(v => v + 1);
            }
            else if (char === ")") {
                searchingFunctions = searchingFunctions.map(v => v - 1);
                if (searchingFunctions.includes(0)) {
                    expression = expression.slice(0, i) + ">" + expression.slice(i + 1);
                    searchingFunctions.splice(searchingFunctions.findIndex(v => v === 0), 1);
                }
            }
            searchingFunctions = [...new Set(searchingFunctions)];
        }
        // Fix mathFunction
        const replacedArguments = [];
        let replaceArgumentsIdx = 0;
        while (expression.includes("<")) {
            loops++;
            if (loops > LOOP_LIMIT)
                return false;
            expression = expression.replace(/<([^<>]*)>/g, (_, g1) => {
                replacedArguments.push(g1.replace(/((?:\[[^[\]]+\]|[^,])+)/g, "($1)"));
                return `[ReplacedArg#${replaceArgumentsIdx++}]`;
            });
        }
        while (true) {
            loops++;
            if (loops > LOOP_LIMIT)
                return false;
            const isReplacedArgumentExist = expression.match(/\[ReplacedArg#(\d+)\]/g);
            if (isReplacedArgumentExist === null)
                break;
            expression = expression.replace(/\[ReplacedArg#(\d+)\]/g, (_, g1) => "(" + replacedArguments[g1] + ")");
        }
        // TODO: Fix double bracket
        // while (expression.match(/\(\([^()]+\)\)/)) {
        //   expression = expression.replace(/\((\([^()]+\))\)/g, "$1")
        // }
        let parts = [];
        while (true) {
            loops++;
            if (loops > LOOP_LIMIT)
                return false;
            let part = null;
            if (expression.match(/{[^{}]+}\([^()]*\)/)) {
                part = expression.match(/({[^{}]+})\(([^()]*)\)/).slice(1).join("");
                expression = expression.replace(/{[^{}]+}\([^()]*\)/, `p${parts.length}`);
            }
            else if (expression.match(/\(([^()]*)\)/)) {
                part = expression.match(/\(([^()]*)\)/)[1];
                expression = expression.replace(/\(([^()]*)\)/, `p${parts.length}`);
            }
            if (!part)
                break;
            parts.push(part);
        }
        let parsedExpression = [];
        let idxConnected = [];
        for (let i = 0; i < parts.length; i++) {
            /** @type {string} */
            const part = parts[i];
            if (part.includes("{")) {
                const funcName = part.match(/{([^{}]+)}/)[1];
                const funcArgs = part.match(/[^},]+/g).slice(1)
                    .map(v => v.startsWith("p") ? idxConnected[+v.slice(1)] : v);
                idxConnected.push(parsedExpression.length);
                parsedExpression.push([funcName, ...funcArgs]);
            }
            else {
                let splited = part.split(/([+\-/*%\^])/);
                let sorted = [];
                while (splited.length > 0 && !(splited.length === 1 && typeof splited[0] === "number")) {
                    loops++;
                    if (loops > LOOP_LIMIT)
                        return false;
                    let idxToPull = splited.findIndex(v => "^".includes(v + ""));
                    if (idxToPull === -1)
                        idxToPull = splited.findIndex(v => "*/".includes(v + ""));
                    if (idxToPull === -1)
                        idxToPull = splited.findIndex(v => "-+%".includes(v + ""));
                    if (idxToPull === -1) {
                        if (splited.length === 1) {
                            sorted.push([typeof splited[0] === "string" && splited[0].startsWith("p") ? idxConnected[+splited[0].slice(1)] : splited[0]]);
                            splited.splice(0, 1);
                        }
                        else {
                            return false;
                        }
                    }
                    let sortedPart = splited.splice(idxToPull - 1, 3);
                    if (typeof sortedPart[0] === "undefined")
                        break;
                    if (typeof sortedPart[0] === "string" && sortedPart[0].startsWith("p"))
                        sortedPart[0] = idxConnected[+sortedPart[0].slice(1)];
                    if (typeof sortedPart[2] === "string" && sortedPart[2].startsWith("p"))
                        sortedPart[2] = idxConnected[+sortedPart[2].slice(1)];
                    sorted.push([sortedPart[1], sortedPart[0], sortedPart[2]]);
                    splited = splited.slice(0, idxToPull - 1)
                        .concat([parsedExpression.length + sorted.length - 1])
                        .concat(splited.slice(idxToPull - 1));
                }
                parsedExpression.push(...sorted);
                idxConnected.push(parsedExpression.length - 1);
            }
        }
        // Restore replaced strings
        parsedExpression = parsedExpression.map(part => part.map(v => (v + "").startsWith('"') ? replacedStrings[+v.slice(1, -1)] : v));
        return parsedExpression;
    }
    static parseValue(value, tmps, variables) {
        if (typeof value === "string") {
            if (value.startsWith("$")) {
                return variables[value.slice(1)];
            }
            else if (value.startsWith("\"")) {
                return value.slice(1, -1);
            }
            else {
                return Number(value);
            }
        }
        else {
            return tmps[value];
        }
    }
    static calculatePart(part, tmps, variables) {
        let operator = part[0];
        let args = [];
        for (let i = 1; i < part.length; i++) {
            const p = part[i];
            args.push(StringExpression.parseValue(p, tmps, variables));
        }
        const func = StringExpression.funcs[operator];
        if (func)
            return func(args.map(v => +v));
        else
            return StringExpression.parseValue(operator, tmps, variables);
    }
    eval(variables = {}) {
        if (!this.expression || !this.isVaild)
            throw new Error("Cannot evaluate invaild expression");
        let tmps = [];
        for (let i = 0; i < this.expression.length; i++) {
            tmps[i] = StringExpression.calculatePart(this.expression[i], tmps, variables);
        }
        return tmps[this.expression.length - 1];
    }
}
StringExpression.funcs = {
    "+": ([x, y]) => x + y,
    "-": ([x, y]) => x - y,
    "*": ([x, y]) => x * y,
    "^": ([x, y]) => x ** y,
    "/": ([x, y]) => x / y,
    "%": ([x, y]) => x % y,
    "minus": ([x]) => -x,
    "abs": ([x]) => Math.abs(x),
    "pow": ([x, y]) => Math.pow(x, y),
    "sqrt": ([x]) => Math.sqrt(x),
    "sin": ([x]) => Math.sin(x * Math.PI / 180),
    "asin": ([x]) => Math.asin(x),
    "sinh": ([x]) => Math.sinh(x),
    "cos": ([x]) => Math.cos(x * Math.PI / 180),
    "acos": ([x]) => Math.acos(x),
    "cosh": ([x]) => Math.cosh(x),
    "tan": ([x]) => Math.tan(x * Math.PI / 180),
    "atan": ([x]) => Math.atan(x),
    "tanh": ([x]) => Math.tanh(x),
    "atan2": ([y, x]) => Math.atan2(y, x) / Math.PI * 180,
    "log": ([x, base]) => Math.log(x) / Math.log(base || Math.E),
    "log10": ([x]) => Math.log10(x),
    "sign": ([x]) => Math.sign(x),
    "round": ([x]) => Math.round(x),
    "floor": ([x]) => Math.floor(x),
    "ceil": ([x]) => Math.ceil(x),
    "min": (s) => Math.min(...s),
    "max": (s) => Math.max(...s),
    "rand": () => Math.random(),
    "randr": ([min, max]) => min + Math.random() * (max - min),
    "randbool": () => Math.floor(Math.random() * 2),
    "randsign": () => Math.floor(Math.random() * 2) * 2 - 1,
    "not": ([a]) => +(!a),
    "gt": ([a, b]) => +(a > b),
    "gte": ([a, b]) => +(a >= b),
    "lt": ([a, b]) => +(a < b),
    "lte": ([a, b]) => +(a <= b),
    "eq": ([a, b]) => +(a === b),
    "select": ([idx, ...v]) => {
        var _a;
        v = Array.isArray(v) ? v : [];
        return (_a = +v[Math.floor(idx % v.length)]) !== null && _a !== void 0 ? _a : 0;
    },
};
