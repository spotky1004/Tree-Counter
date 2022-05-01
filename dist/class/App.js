import GuildCaches from "./guild/GuildCaches.js";
import SaveManager from "./SaveManager.js";
import Logger from "./Logger.js";
export default class App {
    constructor(options) {
        this.config = options.config;
        this.guildCaches = new GuildCaches(this, { cacheLifespan: 2 * 3600000 });
        this.saveManager = new SaveManager(this, options.collections.data);
        this.logger = new Logger(this, options.collections.log);
        this.data = {};
        this.saving = false;
        this.init();
    }
    async init() {
        this.data = await this.saveManager.loadAppData();
        return true;
    }
    updateGuildRanking() {
        const guilds = this.guildCaches.getAllCachedGuild();
        for (const guild of guilds) {
            const rankingIdx = this.data.guildRanking.findIndex(g => g.id === guild.data.id);
            if (rankingIdx === -1) {
                this.data.guildRanking.push({
                    id: guild.data.id,
                    count: guild.data.count
                });
            }
            else {
                this.data.guildRanking[rankingIdx].count = guild.data.count;
            }
        }
        this.data.guildRanking.sort((a, b) => b.count - a.count);
    }
    async save() {
        if (this.saving)
            return;
        this.saving = true;
        await this.saveManager.saveAppData();
        await this.guildCaches.saveAllGuild();
        await this.logger.save();
        this.saving = false;
    }
}
