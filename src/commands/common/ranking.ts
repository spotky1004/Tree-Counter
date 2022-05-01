import { SlashCommandBuilder } from "@discordjs/builders";
import type { CommandData } from "../../typings/Command.js";

const commandName = "ranking";
const slashCommand = new SlashCommandBuilder()
  .setName(commandName)
  .setDescription("See server ranking");

const commandData: CommandData<typeof commandName> = {
  isModCommand: false,
  ephemeral: false,
  slashCommand,
  commandName,
  handler: async ({ guildCache, interaction }) => {
    if (!guildCache.hasFeature("command-ranking")) {
      await interaction.editReply("This command is locked, count more to unlock this!");
      return true;
    }
    let toSend = ">>> ";
    const ranking = guildCache.data.ranking;
    for (let i = 0; i < Math.min(25, ranking.length); i++) {
      const rankingData = ranking[i];
      const guildPlayer = await guildCache.guildPlayerCaches.getGuildPlayerByIdx(rankingData.playerIdx);
      const name = guildPlayer ? guildPlayer.data.name : "-";
      const percent = (rankingData.count/guildCache.data.count*100).toFixed(2);
      toSend += `\`${(i+1).toString().padStart(1, " ")}.\` \`${rankingData.count.toString().padStart(8, " ")}\` (${name}, ${percent}%)\n`;
    }
    await interaction.editReply(toSend.slice(0, 1900)).catch(e => e);
    guildCache.disconnectMessage();
    return true;
  },
};

export default commandData;
