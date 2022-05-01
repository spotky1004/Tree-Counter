import { SlashCommandBuilder } from "@discordjs/builders";
import * as milestones from "../../data/milestones.js";
const commandName = "milestones";
const slashCommand = new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("See all privous milestones");
const commandData = {
    isModCommand: false,
    ephemeral: false,
    slashCommand,
    commandName,
    handler: async ({ guildCache, interaction }) => {
        if (!guildCache.hasFeature("command-milestones")) {
            await interaction.editReply("Command locked!");
            return true;
        }
        let toSend = "";
        const milestoneNr = guildCache.milestoneNr;
        for (let i = 0; i <= milestoneNr; i++) {
            const milestone = milestones.getMilestone(i);
            toSend += `\`${milestone.countGoal.toString().padStart(8, " ")}\` - ${milestone.name}\n`;
        }
        await interaction.editReply(toSend).catch(e => e);
        return true;
    },
};
export default commandData;
