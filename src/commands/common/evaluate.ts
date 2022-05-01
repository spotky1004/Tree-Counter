import { SlashCommandBuilder } from "@discordjs/builders";
import parseExpression from "../../util/parseExpression.js";
import getSlashParams from "../../util/getSlashParams.js";
import type { CommandData } from "../../typings/Command.js";

const commandName = "evaluate";
const slashCommand = new SlashCommandBuilder()
  .setName(commandName)
  .setDescription("Evaluate expression")
  .addStringOption(option =>
    option
      .setName("expression")
      .setDescription("expression to evaluate")
      .setRequired(true)
  );

const commandData: CommandData<typeof commandName> = {
  isModCommand: false,
  ephemeral: false,
  slashCommand,
  commandName,
  handler: async ({ guildCache, interaction }) => {
    if (!guildCache.hasFeature("command-evaluate")) {
      await interaction.editReply("This command is locked, count more to unlock this!");
      return true;
    }
    const params = getSlashParams(interaction, {
      expression: { type: "string" }
    });
    const value = parseExpression(params.expression);
    await interaction.editReply(`\`${params.expression}\` => \`${value}\``).catch(e => e);
    guildCache.disconnectMessage();
    return true;
  },
};

export default commandData;
