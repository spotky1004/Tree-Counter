import parseStringVariables from "../../lib/StringExpression/util/parseStringVariables.js";
export default function parseExpression(str) {
    let value;
    let type;
    console.log(str);
    try {
        value = parseStringVariables(str, ";");
        type = "expression";
    }
    catch (_a) {
        value = parseInt(str);
        type = "message";
    }
    return [Number(value), type];
}
