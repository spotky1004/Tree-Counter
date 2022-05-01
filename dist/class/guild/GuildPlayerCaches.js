import GuildPlayer from "./GuildPlayer.js";
export default class GuildPlayerCaches {
    constructor(app, guild, config) {
        this.app = app;
        this.guild = guild;
        this.config = config;
        this.cache = {};
    }
    async fetchGuildPlayer(id, name) {
        const guildPalyerData = await this.app.saveManager.loadGuildPlayer(this.guild.data.id, id);
        if (name) {
            guildPalyerData.name = name;
        }
        if (guildPalyerData.playerIdx === -1) {
            guildPalyerData.playerIdx = this.guild.data.playerCount;
            this.guild.data.playerCount++;
            this.guild.data.playerIds.push(id);
        }
        const guildPlayer = new GuildPlayer(this.app, this.guild, guildPalyerData);
        this.cache[id] = guildPlayer;
        return guildPlayer;
    }
    async getGuildPlayer(id, name) {
        if (this.cache.hasOwnProperty(id)) {
            return this.cache[id];
        }
        else {
            return await this.fetchGuildPlayer(id, name);
        }
    }
    async getGuildPlayerByIdx(idx) {
        const id = this.guild.data.playerIds[idx];
        if (typeof id === "undefined")
            return null;
        return await this.getGuildPlayer(id, null);
    }
    async saveAllGuildPlayer() {
        for (const id in this.cache) {
            await this.saveGuildPlayer(id);
        }
    }
    async saveGuildPlayer(id) {
        const guildPlayer = this.cache[id];
        if (new Date().getTime() - guildPlayer.lastActive > this.config.cacheLifespan) {
            delete this.cache[id];
        }
        return await this.app.saveManager.saveGuildPlayer(this.guild.data.id, id, guildPlayer.data);
    }
}
