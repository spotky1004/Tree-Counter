import parseStringVariables from "../../lib/StringExpression/util/parseStringVariables.js";

export type ExpressionValueType = "message" | "expression";

export default function parseExpression(str: string): [number, ExpressionValueType] {
  let value: any;
  let type: ExpressionValueType;

  try {
    const splitedStr = str.split(";");
    const newStr = splitedStr.slice(1).concat(["dontDoInjectPls=" + splitedStr[splitedStr.length-1]]).join(";");
    console.log(newStr);
    value = parseStringVariables(newStr, ";").get("dontDoInjectPls");
    type = "expression";
  } catch (e) {
    console.log(e);
    value = parseInt(str);
    type = "message";
  }

  return [Number(value), type];
}
