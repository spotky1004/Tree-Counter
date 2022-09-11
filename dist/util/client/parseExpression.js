import parseStringVariables from "../../lib/StringExpression/util/parseStringVariables.js";
export default function parseExpression(str) {
    let value;
    let type;
    try {
        const splitedStr = str.split(";");
        const newStr = splitedStr.slice(1).concat(["dontDoInjectPls=" + splitedStr[splitedStr.length - 1]]).join(";");
        console.log(newStr);
        value = parseStringVariables(newStr, ";").get("dontDoInjectPls");
        type = "expression";
    }
    catch (e) {
        console.log(e);
        value = parseInt(str);
        type = "message";
    }
    return [Number(value), type];
}
