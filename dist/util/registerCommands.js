;
export default async function registerCommands(options) {
    const guild = options.client.guilds.cache.get(options.guildId);
    if (guild) {
        for (const command of options.commands) {
            await guild.commands.create(command).catch(e => e);
        }
    }
}
