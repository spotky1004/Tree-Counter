import { SlashCommandBuilder } from "@discordjs/builders";
const commandName = "serverranking";
const slashCommand = new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("Show global ranking");
const commandData = {
    isModCommand: false,
    ephemeral: false,
    slashCommand,
    commandName,
    handler: async ({ app, guildCache, interaction }) => {
        if (!guildCache.hasFeature("command-serverranking")) {
            await interaction.editReply("This command is locked, count more to unlock this!");
            return true;
        }
        let toSend = ">>> ";
        const ranking = app.data.guildRanking;
        for (let i = 0; i < Math.min(25, ranking.length); i++) {
            const rankingData = ranking[i];
            if (rankingData.count < 10000)
                continue;
            const name = rankingData.id === guildCache.data.id ? "here" : `${rankingData.id}`;
            toSend += `\`${(i + 1).toString().padStart(1, " ")}.\` \`${rankingData.count.toString().padStart(8, " ")}\` (${name})\n`;
        }
        await interaction.editReply(toSend.slice(0, 1900)).catch(e => e);
        return true;
    },
};
export default commandData;
