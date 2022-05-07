import * as commands from "../commands/index.js";
import type App from "../class/App.js";
import type Discord from "discord.js";
import type { CommandHandlerOptions } from "../typings/Command.js";

/**
 * Return value is commandName is vaild
 */
export default async function commandHandler(app: App, interaction: Discord.CommandInteraction) {
  if (
    !interaction.inGuild() || !interaction.guild || !interaction.channel
  ) return false;

  const guildCache = await app.guildCaches.getGuild(interaction.guildId);
  const commandOptions: CommandHandlerOptions = {
    app,
    interaction,
    guildPlayerCache: await guildCache.guildPlayerCaches.getGuildPlayer(
      interaction.user.id,
      interaction.member.hasOwnProperty("displayName") ? (interaction.member as Discord.GuildMember).displayName : interaction.user.username
    ),
    guildCache
  };

  let result = false;
  if (isCommonCommandName(interaction.commandName)) {
    const commandToExecute = commands.commonCommands[interaction.commandName];
    await interaction.deferReply({ ephemeral: commandToExecute.ephemeral ?? true }).catch(e => e);
    result = await commandToExecute.handler(commandOptions);
  } else if (isModCommandName(interaction.commandName)) {
    if (
      commandOptions.guildCache.data.isModServer &&
      commandOptions.guildPlayerCache.data.isMod
    ) {
      const commandToExecute = commands.modCommands[interaction.commandName];
      await interaction.deferReply({ ephemeral: commandToExecute.ephemeral ?? true }).catch(e => e);
      result = await commandToExecute.handler(commandOptions);
    } else {
      await interaction.reply("Missing permission!");
      result = true;
    }
  } else {
    await interaction.reply({
      content: "Inviald command!",
      ephemeral: true
    }).catch(e => e);
  }

  if (!result) {
    await interaction.editReply({
      content: "Unknown error occured!"
    }).catch(e => e);
  }
  return result;
}

type CommonCommandName = typeof commands["commonCommands"][keyof typeof commands["commonCommands"]]["commandName"];
type ModCommandName = typeof commands["modCommands"][keyof typeof commands["modCommands"]]["commandName"];
const commandNames = {
  common: Object.keys(commands.commonCommands),
  mod: Object.keys(commands.modCommands)
};
function isCommonCommandName(commandName: string): commandName is CommonCommandName {
  return commandNames.common.includes(commandName);
}
function isModCommandName(commandName: string): commandName is ModCommandName {
  return commandNames.mod.includes(commandName);
}
