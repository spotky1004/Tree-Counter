import fs from "fs";
import path from "path";
import getPath from "./getPath.js";

interface ReadScriptsOptions {
  dirname: string;
  /** Default: ".js" */
  extension?: string;
  /** Default: [] */
  ignore?: string[];
}

const { __dirname } = getPath(import.meta.url);

export default async function readModules(options: ReadScriptsOptions) {
  const { dirname, extension=".js", ignore=[] } = options;

  const fileNames = fs.readdirSync(path.join(dirname))
    .filter(fileName => fileName.endsWith(extension) && !ignore.includes(fileName));
  
  const modules: {[filename: string]: any} = {};
  for (const fileName of fileNames) {
    const relativePath = "./" + path.relative(__dirname, path.join(dirname, fileName));
    modules[fileName.slice(0, -extension.length)] = await import(relativePath);
  }
  return modules;
}
