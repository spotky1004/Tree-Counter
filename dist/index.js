import env from "./env.js";
env();
import Discord from "discord.js";
import App from "./class/App.js";
import { commandJSON } from "./commands/index.js";
import registerCommands from "./registerCommands.js";
import { data as dataCollection, log as logCollection } from "./db.js";
import * as handlers from "./handlers/index.js";
import getRandomTrivia from "./util/getRandomTrivia.js";
const TOKEN = process.env.TOKEN;
const client = new Discord.Client({
    intents: [
        "GUILD_MESSAGES",
        "GUILD_MEMBERS",
        "GUILD_INTEGRATIONS",
        "GUILD_PRESENCES",
        "GUILDS"
    ],
});
const app = new App({
    config: {},
    collections: {
        data: dataCollection,
        log: logCollection
    },
});
client.on("ready", async () => {
    try {
        await handlers.ready({
            app,
            client,
            commonCommands: commandJSON.commonCommands,
            modCommands: commandJSON.modCommands,
            token: TOKEN
        });
    }
    catch (e) {
        console.log(e);
    }
    console.log("Ready!");
});
client.on("guildCreate", async (guild) => {
    try {
        registerCommands({
            clientId: process.env.CLIENT_ID,
            guildId: guild.id,
            commands: commandJSON.commonCommands,
            token: TOKEN
        });
    }
    catch (_a) { }
});
client.on("messageCreate", async (message) => {
    var _a;
    try {
        if (message.author.id === ((_a = client.user) === null || _a === void 0 ? void 0 : _a.id))
            return;
        if (message.inGuild()) {
            const guildCache = await app.guildCaches.getGuild(message.guild.id);
            const connectedChannel = guildCache.connectedChannel;
            if (connectedChannel !== null &&
                connectedChannel.id === message.channelId) {
                const result = await handlers.count(message, guildCache);
                if (result[0]) {
                    await message.delete().catch(e => e);
                }
                else {
                    if (!isNaN(result[1])) {
                        message.channel.send(`= ${result[1]}\nNext: \`${guildCache.nextCount}\``);
                    }
                    guildCache.disconnectMessage();
                }
            }
        }
    }
    catch (e) {
        console.log(e);
    }
});
client.on("interactionCreate", async (interaction) => {
    try {
        if (interaction.isCommand()) {
            const isCommandVaild = handlers.command(app, interaction);
            if (!isCommandVaild) {
                await interaction.reply({ content: "Invaild command", ephemeral: true });
            }
        }
    }
    catch (e) {
        console.log(e);
    }
});
setInterval(() => {
    app.save();
    if (client.user) {
        getRandomTrivia;
        client.user.setActivity(getRandomTrivia({ app, client }), {
            type: "WATCHING"
        });
    }
}, 10000);
client.login(TOKEN);
