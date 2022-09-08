import { SlashCommandBuilder } from "@discordjs/builders";
import getSlashParams from "../../util/getSlashParams.js";
import * as CanvasUIDatas from "../../data/canvasUIDatas.js";
import { getUnlockedFeatures } from "../../data/milestones.js";
import type { CommandData } from "../../typings/Command.js";

const commandName = "setcount";
const slashCommand = new SlashCommandBuilder()
  .setName(commandName)
  .setDescription("[MOD COMMAND] set count")
  .addIntegerOption(option =>
    option
      .setName("count")
      .setDescription("count to set")
      .setRequired(true)
  );

const commandData: CommandData<typeof commandName> = {
  isModCommand: true,
  ephemeral: false,
  slashCommand,
  commandName,
  handler: async ({ guildCache, interaction }) => {
    const params = getSlashParams(interaction, {
      count: { type: "integer" }
    });
    if (params.count > 100_000) {
      return false;
    }

    guildCache.data.count = params.count;
    guildCache.data.pixels.splice(guildCache.data.count);
    for (let i = 0; i < guildCache.data.count; i++) {
      if (typeof guildCache.data.pixels[i] === "undefined") {
        guildCache.data.pixels[i] = -1;
      }
    }

    guildCache.updateMilestone();
    console.log(`Done!\nMilestone#: ${guildCache.milestoneNr}\nCanvas Stage: ${CanvasUIDatas.getCanvasStage(guildCache)}\nFeatures: \`[${getUnlockedFeatures(guildCache.milestoneNr).join(", ")}]\``);
    await interaction.editReply(`Done!\nMilestone#: ${guildCache.milestoneNr}\nCanvas Stage: ${CanvasUIDatas.getCanvasStage(guildCache)}\nFeatures: \`[${getUnlockedFeatures(guildCache.milestoneNr).join(", ")}]\``);
    
    guildCache.disconnectMessage();
    await guildCache.canvas.repaint();
    await guildCache.updateMessage();
    return true;
  },
};

export default commandData;
