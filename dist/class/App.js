import GuildCaches from "./guild/GuildCaches.js";
import SaveManager from "./SaveManager.js";
import Logger from "./Logger.js";
export default class App {
    constructor(options) {
        this.config = options.config;
        this.guildCaches = new GuildCaches(this, { cacheLifespan: 2 * 3600000 });
        this.saveManager = new SaveManager(this, options.collections.data);
        this.logger = new Logger(this, options.collections.log);
        this.saving = false;
        this.init();
    }
    async init() {
        // init
        return true;
    }
    async save() {
        if (this.saving)
            return;
        this.saving = true;
        await this.guildCaches.saveAllGuild();
        await this.logger.save();
        this.saving = false;
    }
}
