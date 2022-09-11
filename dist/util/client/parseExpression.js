import parseStringVariables from "../../lib/StringExpression/util/parseStringVariables.js";
export default function parseExpression(str) {
    let value;
    let type;
    try {
        value = parseStringVariables("ans=" + str, ";").get("ans");
        type = "expression";
    }
    catch (e) {
        console.log(e);
        value = parseInt(str);
        type = "message";
    }
    return [Number(value), type];
}
