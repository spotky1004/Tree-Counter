import type Discord from "discord.js";
import type { SlashCommandBuilder } from "@discordjs/builders";

export interface RegisterCommandsOptions {
  client: Discord.Client;
  guildId: string;
  commands: ReturnType<SlashCommandBuilder["toJSON"]>[];
};

export default async function registerCommands(options: RegisterCommandsOptions) {
  const guild = options.client.guilds.cache.get(options.guildId);
  if (guild) {
    for (const command of options.commands) {
      await guild.commands.create(command as any).catch(e => e);
    } 
  }
}
