import Guild from "./Guild.js";
import Discord from "discord.js";
import type App from "../App.js";

interface GuildCachesConfig {
  cacheLifespan: number;
}

export default class GuildCaches {
  config: GuildCachesConfig;
  app: App;
  private cache: { [id: string]: Guild };

  constructor(app: App, config: GuildCachesConfig) {
    this.config = config;
    this.app = app;
    this.cache = {};
  }

  getConnectedChannels() {
    return Object.values(this.cache)
      .map(guild => guild.connectedChannel)
      .filter(channel => channel !== null) as Discord.TextChannel[];
  }

  private async fetchGuild(id: string) {
    const guildData = await this.app.saveManager.loadGuild(id);
    const guild = new Guild(this.app, this, guildData);
    this.cache[id] = guild;
    return guild;
  }

  async getGuild(id: string) {
    if (this.cache.hasOwnProperty(id)) {
      return this.cache[id];
    } else {
      return await this.fetchGuild(id);
    }
  }

  async saveAllGuild() {
    for (const id in this.cache) {
      await this.saveGuild(id);
    }
  }

  async saveGuild(id: string) {
    const guild = this.cache[id];
    const result =
      await this.app.saveManager.saveGuild(id, guild.data) &&
      await guild.guildPlayerCaches.saveAllGuildPlayer();
    if (new Date().getTime() - guild.lastActive > this.config.cacheLifespan) {
      delete this.cache[id];
    }
    return result;
  }

  get size() {
    return Object.keys(this.cache).length;
  }
}
