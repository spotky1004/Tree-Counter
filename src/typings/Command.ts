import type { SlashCommandBuilder } from "@discordjs/builders";
import type Discord from "discord.js";
import type App from "../class/App.js";

export interface CommandHandlerOptions {
  app: App;
  interaction: Discord.CommandInteraction;
  guildPlayerCache: undefined;
  guildCache: Awaited<ReturnType<App["guildCaches"]["getGuild"]>>;
}

export type CommandHandler = (options: CommandHandlerOptions) => Promise<boolean>;

export interface CommandData<T extends string> {
  isModCommand: boolean;
  slashCommand: SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
  commandName: T;
  handler: CommandHandler;
  ephemeral?: boolean;
}
