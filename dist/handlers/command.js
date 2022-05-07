import * as commands from "../commands/index.js";
/**
 * Return value is commandName is vaild
 */
export default async function commandHandler(app, interaction) {
    var _a, _b;
    if (!interaction.inGuild() || !interaction.guild || !interaction.channel)
        return false;
    const guildCache = await app.guildCaches.getGuild(interaction.guildId);
    const commandOptions = {
        app,
        interaction,
        guildPlayerCache: await guildCache.guildPlayerCaches.getGuildPlayer(interaction.user.id, interaction.member.hasOwnProperty("displayName") ? interaction.member.displayName : interaction.user.username),
        guildCache
    };
    let result = false;
    if (isCommonCommandName(interaction.commandName)) {
        const commandToExecute = commands.commonCommands[interaction.commandName];
        await interaction.deferReply({ ephemeral: (_a = commandToExecute.ephemeral) !== null && _a !== void 0 ? _a : true }).catch(e => e);
        result = await commandToExecute.handler(commandOptions);
    }
    else if (isModCommandName(interaction.commandName)) {
        if (commandOptions.guildCache.data.isModServer &&
            commandOptions.guildPlayerCache.data.isMod) {
            const commandToExecute = commands.modCommands[interaction.commandName];
            await interaction.deferReply({ ephemeral: (_b = commandToExecute.ephemeral) !== null && _b !== void 0 ? _b : true }).catch(e => e);
            result = await commandToExecute.handler(commandOptions);
        }
        else {
            await interaction.reply("Missing permission!");
            result = true;
        }
    }
    else {
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
const commandNames = {
    common: Object.keys(commands.commonCommands),
    mod: Object.keys(commands.modCommands)
};
function isCommonCommandName(commandName) {
    return commandNames.common.includes(commandName);
}
function isModCommandName(commandName) {
    return commandNames.mod.includes(commandName);
}
