import { SlashCommandBuilder } from "@discordjs/builders";
import * as milestones from "../../data/milestones.js";
import type { CommandData } from "../../typings/Command.js";

const commandName = "milestones";
const slashCommand = new SlashCommandBuilder()
  .setName(commandName)
  .setDescription("See all privous milestones");

const commandData: CommandData<typeof commandName> = {
  isModCommand: false,
  ephemeral: false,
  slashCommand,
  commandName,
  handler: async ({ guildCache, interaction }) => {
    if (!guildCache.hasFeature("command-milestones")) {
      await interaction.editReply("This command is locked, count more to unlock this!");
      return true;
    }
    let toSend = "";
    const milestoneNr = guildCache.milestoneNr;
    for (let i = 0; i <= milestoneNr; i++) {
      const milestone = milestones.getMilestone(i);
      toSend += `\`${milestone.countGoal.toString().padStart(8, " ")}\` - ${milestone.name}\n`;
    }
    await interaction.editReply(toSend).catch(e => e);
    guildCache.disconnectMessage();
    return true;
  },
};

export default commandData;
