import env from "./env.js";
env();
import Discord from "discord.js";
import App from "./class/App.js";
import { commandJSON } from "./commands/index.js";
import registerCommands from "./util/command/registerCommands.js";
import { data as dataCollection, log as logCollection } from "./db.js";
import * as handlers from "./handlers/index.js";
import getRandomTrivia from "./util/getRandomTrivia.js";


const TOKEN = process.env.TOKEN as string;
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
  config: {
  },
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
      modCommands: commandJSON.modCommands
    });
  } catch (e) { console.log(e); }
  console.log("Ready!");
});

client.on("guildCreate", async (guild) => {
  try {
    registerCommands({
      token: TOKEN,
      clientId: process.env.CLIENT_ID as string,
      guildId: guild.id,
      commands: commandJSON.commonCommands
    });
  } catch {}
});

client.on("messageCreate", async (message) => {
  try {
    if (message.author.id === client.user?.id) return;
    if (message.inGuild()) {
      const guildCache = await app.guildCaches.getGuild(message.guild.id);
      if (
        guildCache.connectedChannel === null &&
        guildCache.data.countingChannelId === message.channelId
      ) {
        guildCache.connectedChannel = message.channel;
      }
      const connectedChannel = guildCache.connectedChannel;
      if (
        connectedChannel !== null &&
        connectedChannel.id === message.channelId
      ) {
        const [countSuccess, countCorrect, countValue] = await handlers.count(message, guildCache);
        if (countSuccess) {
          if (countValue%100 === 0) {
            const emoties = ["🎉", "⭐", "👀", "🌠", "🌟", "🏆", "👍", "🌲"];
            const toReact = emoties[Math.floor(emoties.length * Math.random())];
            await message.react(toReact).catch(e => e);
            guildCache.disconnectMessage();
          } else if (Number.isInteger(Math.sqrt(countValue)) && guildCache.hasFeature("display-pixels")) {
            await message.react("🟩").catch(e => e);
            guildCache.disconnectMessage();
          } else {
            await message.delete().catch(e => e);
          }
        } else {
          if (!isNaN(countValue)) {
            if (!countCorrect) {
              message.channel.send(`=> \`${countValue}\`\nNext: \`${guildCache.nextCount}\``);
              guildCache.disconnectMessage();
            } else {
              await message.delete().catch(e => e);
            }
          }
        }
      }
    }
  } catch (e) { console.log(e); }
});

client.on("interactionCreate", async (interaction) => {
  try {
    if (interaction.isCommand()) {
      const isCommandVaild = handlers.command(app, interaction);
      if (!isCommandVaild) {
        await interaction.reply({ content: "Invaild command", ephemeral: true });
      }
    }
  }  catch (e) { console.log(e); }
});

setInterval(() => {
  app.save();
  app.updateGuildRanking();
  if (client.user) {
    getRandomTrivia;
    // getRandomTrivia({ app, client })
    client.user.setActivity("Big update! Please invite again with the button under. (after kick)", {
      type: "WATCHING"
    });
  }
}, 10_000);

client.login(TOKEN);
