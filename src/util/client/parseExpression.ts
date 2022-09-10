import parseStringVariables from "../../lib/StringExpression/util/parseStringVariables.js";

export type ExpressionValueType = "message" | "expression";

export default function parseExpression(str: string): [number, ExpressionValueType] {
  let value: any;
  let type: ExpressionValueType;

  console.log(str);
  try {
    value = parseStringVariables(str, ";");
    type = "expression";
  } catch {
    value = parseInt(str);
    type = "message";
  }

  return [Number(value), type];
}
