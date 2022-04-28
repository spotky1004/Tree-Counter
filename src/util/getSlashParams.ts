import type Discord from "discord.js";

const paramGetFunctions = {
  "boolean": "getBoolean",
  "channel": "getChannel",
  "integer": "getInteger",
  "member": "getMember",
  "mentionable": "getMentionable",
  "number": "getNumber",
  "role": "getRole",
  "string": "getString",
  "subcommand": "getSubcommand",
  "subcommandGroup": "getSubcommandGroup",
  "user": "getUser",
} as const;
type GetCommandParamReturnType<T extends typeof paramGetFunctions[keyof typeof paramGetFunctions]> = ReturnType<Discord.CommandInteraction["options"][T]>;

type ParamTypes = {[K in keyof typeof paramGetFunctions]: Exclude<GetCommandParamReturnType<typeof paramGetFunctions[K]>, null>};
type ParamTypeNames = keyof ParamTypes;
interface ParamOptions {
  type: ParamTypeNames;
  isRequired?: boolean;
}


export default function getSlashParams<T extends {[name: string]: ParamOptions}>(interaction: Discord.CommandInteraction, toGet: T) {
  const options = interaction.options;

  type Params = {[K in keyof T]: T[K]["isRequired"] extends true ? ParamTypes[T[K]["type"]] | null : ParamTypes[T[K]["type"]] };
  let params: Params = {} as Params;
  for (const name in toGet) {
    if (toGet.hasOwnProperty(name)) {
      const type = toGet[name].type as ParamTypeNames;
      const param = (options[paramGetFunctions[type]] as any)(name);
      params[name] = param as any;
    }
  }
  return params;
}
