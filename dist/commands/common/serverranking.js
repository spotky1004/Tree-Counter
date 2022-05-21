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
        let toSend = "```js\n";
        toSend += " NR |    COUNT |     MEMBER |                   ID |\n";
        const ranking = app.data.guildRanking;
        for (let i = 0; i < Math.min(25, ranking.length); i++) {
            if (toSend.length > 1900)
                continue;
            const rankingData = ranking[i];
            if (rankingData.count < 10000)
                continue;
            const name = rankingData.id === guildCache.data.id ? "here" : `${rankingData.id}`;
            toSend += (i + 1).toString().padStart(3, " ") + " | ";
            toSend += (rankingData.count + "").padStart(8, " ") + " | ";
            toSend += (rankingData.playerCount + "").padStart(10, " ") + " | ";
            toSend += name.padStart(20, " ") + " |\n";
        }
        toSend += "```";
        await interaction.editReply(toSend.slice(0, 1900)).catch(e => e);
        guildCache.disconnectMessage();
        return true;
    },
};
export default commandData;
