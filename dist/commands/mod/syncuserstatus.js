import { SlashCommandBuilder } from "@discordjs/builders";
const commandName = "syncuserstatus";
const slashCommand = new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("[MOD COMMAND] sync user status; use this after /setcount");
const commandData = {
    isModCommand: true,
    ephemeral: false,
    slashCommand,
    commandName,
    handler: async ({ guildCache, interaction }) => {
        const playerIds = guildCache.data.playerIds;
        const playerCounts = Array(playerIds.length).fill(0);
        const pixels = guildCache.data.pixels;
        for (const pixel of pixels) {
            playerCounts[pixel]++;
        }
        for (const playerId of playerIds) {
            const guildPlayer = await guildCache.guildPlayerCaches.getGuildPlayer(playerId, null);
            guildPlayer.data.contributeCount = playerCounts[guildPlayer.data.playerIdx];
        }
        await interaction.editReply(`Done!\n\`${pixels.length}\` pixels\n\`${playerIds.length}\` players`);
        await guildCache.canvas.repaint();
        await guildCache.updateMessage();
        return true;
    },
};
export default commandData;
