import StringExpression from "../class/util/StringExpression.js";
const variableNameRegexp = /^[A-z][A-z0-9]{0,9}$/;
export default function parseExpression(str, variables = {}) {
    const [expressionStrExp, ...varialbesStrExp] = str.split(";");
    const expression = new StringExpression(expressionStrExp);
    let value;
    let type;
    if (expression.isVaild) {
        for (let i = 0; i < varialbesStrExp.length; i++) {
            const [variableName, variableStrExp] = varialbesStrExp[i].replace(/[ \n\t]/g, "").split("=");
            if (!variableNameRegexp.test(variableName))
                continue;
            const [result,] = parseExpression(variableStrExp, variables);
            variables[variableName] = result;
        }
        value = expression.eval(variables);
        type = "expression";
    }
    else {
        value = parseInt(str);
        type = "message";
    }
    return [Number(value), type];
}
