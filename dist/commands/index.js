import path from "path";
import getPath from "../util/getPath.js";
import readModules from "../util/readModules.js";
const { __dirname } = getPath(import.meta.url);
const commonCommandNameEnum = {
    "setchannel": 0,
    "evaluate": 1,
    "milestones": 2,
    "ranking": 3,
    "serverranking": 4,
    "nextcount": 5,
};
const commonCommands = Object.fromEntries(Object.entries(await readModules({
    dirname: path.join(__dirname, "common")
})).map(([key, mod]) => [key, mod.default]));
const modCommandNameEnum = {
    "setcount": 0,
    "syncuserstatus": 1,
};
const modCommands = Object.fromEntries(Object.entries(await readModules({
    dirname: path.join(__dirname, "mod")
})).map(([key, mod]) => [key, mod.default]));
export { commonCommands, modCommands };
export const commandJSON = {
    commonCommands: Object.values(commonCommands).map(commandData => commandData.slashCommand.toJSON()),
    modCommands: Object.values(modCommands).map(commandData => commandData.slashCommand.toJSON()),
};
