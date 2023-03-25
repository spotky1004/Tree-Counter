import parseStringVariables from "../../lib/StringExpression/util/parseStringVariables.js";

export type ExpressionValueType = "message" | "expression";

export default function parseExpression(str: string): [number, ExpressionValueType] {
  let value: any;
  let type: ExpressionValueType;

  try {
    const splitedStr = str.split(";");
    const newStr = splitedStr.slice(1).concat(["dontDoInjectPls=" + splitedStr[0]]).join(";");
    value = parseStringVariables(newStr, ";").get("dontDoInjectPls");
    if (
      typeof value === "undefined" ||
      value === null
    ) {
      throw new Error("Value cannot be undefined");
    }
    type = "expression";
  } catch {
    value = parseInt(str);
    type = "message";
  }

  return [Number(value), type];
}
