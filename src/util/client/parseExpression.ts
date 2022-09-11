import parseStringVariables from "../../lib/StringExpression/util/parseStringVariables.js";

export type ExpressionValueType = "message" | "expression";

export default function parseExpression(str: string): [number, ExpressionValueType] {
  let value: any;
  let type: ExpressionValueType;

  try {
    value = parseStringVariables("ans=" + str, ";").get("ans");
    type = "expression";
  } catch {
    value = parseInt(str);
    type = "message";
  }

  return [Number(value), type];
}
