import fs from "fs";
import path from "path";
import getPath from "./getPath.js";
const { __dirname } = getPath(import.meta.url);
export default async function readModules(options) {
    const { dirname, extension = ".js", ignore = [] } = options;
    const fileNames = fs.readdirSync(path.join(dirname))
        .filter(fileName => fileName.endsWith(extension) && !ignore.includes(fileName));
    const modules = {};
    for (const fileName of fileNames) {
        const relativePath = "./" + path.relative(__dirname, path.join(dirname, fileName));
        modules[fileName.slice(0, -extension.length)] = await import(relativePath);
    }
    return modules;
}
