import registerCommands, { RegisterCommandsOptions } from "../registerCommands.js";
import type Discord from "discord.js";
import type App from "../class/App";

interface ReadyHandlerOptions {
  client: Discord.Client<boolean>,
  token: string,
  commonCommands: RegisterCommandsOptions["commands"],
  modCommands: RegisterCommandsOptions["commands"],
  app: App
}

export default async function readyHandler(options: ReadyHandlerOptions) {
  const { client, token, commonCommands, modCommands, app } = options;
  
  const guilds = await client.guilds.fetch();
  guilds.each(async (guild) => {
    const guildId = guild.id;
    const guildCache = await app.guildCaches.getGuild(guildId);

    let commandsToRegister = commonCommands;
    if (guildCache.data.isModServer) {
      commandsToRegister = commandsToRegister.concat(modCommands);
    }
    registerCommands({
      clientId: process.env.CLIENT_ID as string,
      guildId,
      commands: commandsToRegister,
      token
    });

    if (guildCache.data.countingChannelId !== "-1") {
      const channel = await client.channels.fetch(guildCache.data.countingChannelId);
      if (channel !== null && channel.type === "GUILD_TEXT") {
        guildCache.connectChannel(channel);
      }
    }
  });
}
