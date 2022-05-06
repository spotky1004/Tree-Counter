import { SlashCommandBuilder } from "@discordjs/builders";
const commandName = "nextcount";
const slashCommand = new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("Displays next count");
const commandData = {
    isModCommand: false,
    ephemeral: false,
    slashCommand,
    commandName,
    handler: async ({ guildCache, interaction }) => {
        await interaction.editReply(`Next count is \`${guildCache.nextCount}\``);
        return true;
    },
};
export default commandData;
