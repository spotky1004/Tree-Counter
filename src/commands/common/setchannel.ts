import { SlashCommandBuilder } from "@discordjs/builders";
import type { CommandData } from "../../typings/Command.js";

const commandName = "setchannel";
const slashCommand = new SlashCommandBuilder()
  .setName(commandName)
  .setDescription("Set Tree Counter channel");

const commandData: CommandData<typeof commandName> = {
  isModCommand: false,
  ephemeral: false,
  slashCommand,
  commandName,
  handler: async ({ guildCache, interaction }) => {
    return await guildCache.connectChannelWithInteraction(interaction);
  },
};

export default commandData;
