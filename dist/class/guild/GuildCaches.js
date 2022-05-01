import Guild from "./Guild.js";
export default class GuildCaches {
    constructor(app, config) {
        this.config = config;
        this.app = app;
        this.cache = {};
    }
    getConnectedChannels() {
        return Object.values(this.cache)
            .map(guild => guild.connectedChannel)
            .filter(channel => channel !== null);
    }
    async fetchGuild(id) {
        const guildData = await this.app.saveManager.loadGuild(id);
        const guild = new Guild(this.app, this, guildData);
        this.cache[id] = guild;
        return guild;
    }
    async getGuild(id) {
        if (this.cache.hasOwnProperty(id)) {
            return this.cache[id];
        }
        else {
            return await this.fetchGuild(id);
        }
    }
    getAllCachedGuild() {
        const guilds = [];
        for (const id in this.cache) {
            const guild = this.cache[id];
            guilds.push(guild);
        }
        return guilds;
    }
    async saveAllGuild() {
        for (const id in this.cache) {
            await this.saveGuild(id);
        }
    }
    async saveGuild(id) {
        const guild = this.cache[id];
        const result = await this.app.saveManager.saveGuild(id, guild.data) &&
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
