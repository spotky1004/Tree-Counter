import { SlashCommandBuilder } from "@discordjs/builders";
const commandName = "setchannel";
const slashCommand = new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("Set Tree Counter channel");
const commandData = {
    isModCommand: false,
    ephemeral: false,
    slashCommand,
    commandName,
    handler: async ({ guildCache, interaction }) => {
        return await guildCache.connectChannelWithInteraction(interaction);
    },
};
export default commandData;
