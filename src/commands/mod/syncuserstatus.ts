import { SlashCommandBuilder } from "@discordjs/builders";
import type { CommandData } from "../../typings/Command.js";

const commandName = "syncuserstatus";
const slashCommand = new SlashCommandBuilder()
  .setName(commandName)
  .setDescription("[MOD COMMAND] sync user status; use this after /setcount");

const commandData: CommandData<typeof commandName> = {
  isModCommand: true,
  ephemeral: false,
  slashCommand,
  commandName,
  handler: async ({ guildCache, interaction }) => {
    const playerIds = guildCache.data.playerIds;
    const playerCounts: number[] = Array(playerIds.length).fill(0);
    const pixels = guildCache.data.pixels;
    for (const pixel of pixels) {
      playerCounts[pixel]++;
    }
    
    for (const playerId of playerIds) {
      const guildPlayer = await guildCache.guildPlayerCaches.getGuildPlayer(playerId, null);
      const playerIdx = guildPlayer.data.playerIdx;
      const count = playerCounts[playerIdx];

      guildPlayer.data.contributeCount = count;
      const rankingData = guildCache.data.ranking.find(data => data.playerIdx === playerIdx);
      if (rankingData) {
        rankingData.count = count;
      }
    }
    guildCache.data.ranking.sort((a, b) => b.count - a.count);

    await interaction.editReply(`Done!\n\`${pixels.length}\` pixels\n\`${playerIds.length}\` players`);
    await guildCache.canvas.repaint();
    await guildCache.updateMessage();
    return true;
  },
};

export default commandData;
