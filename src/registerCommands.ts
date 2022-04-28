import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";

export interface RegisterCommandsOptions {
  token: string;
  clientId: string;
  guildId: string;
  commands: ReturnType<SlashCommandBuilder["toJSON"]>[];
};

export default function registerCommands(options: RegisterCommandsOptions) {
  const rest = new REST({ version: "9" }).setToken(options.token);

  rest.put(Routes.applicationGuildCommands(options.clientId, options.guildId), { body: options.commands })
    .then(() => console.log(`Register commands done to guild: ${options.guildId}`))
    .catch(() => console.log(`Register commands failed to guild: ${options.guildId}`));
}
