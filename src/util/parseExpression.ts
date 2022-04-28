import StringExpression from "../class/util/StringExpression.js";

const variableNameRegexp = /^[A-z][A-z0-9]{0,9}$/;

export default function parseExpression(str: string, variables: Record<string,any>={}): number {
  const [expressionStrExp, ...varialbesStrExp] = str.split(";");
  const expression = new StringExpression(expressionStrExp);
  let value: any;
  if (expression.isVaild) {
    for (let i = 0; i < varialbesStrExp.length; i++) {
      const [variableName, variableStrExp] = varialbesStrExp[i].replace(/[ \n\t]/g, "").split("=");
      if (!variableNameRegexp.test(variableName)) continue;
      variables[variableName] = parseExpression(variableStrExp, variables);
    }
    value = expression.eval(variables);
  } else {
    value = parseInt(str);
  }

  return Number(value);
}
