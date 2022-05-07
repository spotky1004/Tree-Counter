import { SlashCommandBuilder } from "@discordjs/builders";
import type { CommandData } from "../../typings/Command.js";

const commandName = "nextcount";
const slashCommand = new SlashCommandBuilder()
  .setName(commandName)
  .setDescription("Displays next count");

const commandData: CommandData<typeof commandName> = {
  isModCommand: false,
  ephemeral: false,
  slashCommand,
  commandName,
  handler: async ({ guildCache, interaction }) => {
    await interaction.editReply(`Next count is \`${guildCache.nextCount}\``).catch(e => e);
    return true;
  },
};

export default commandData;
