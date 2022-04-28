import GuildCaches from "./guild/GuildCaches.js";
import SaveManager, { Collection } from "./SaveManager.js";
import Logger from "./Logger.js";

interface AppConfig {
  
}
interface AppOptions {
  config: AppConfig;
  collections: {
    data: Collection;
    log: Collection;
  };
}

export default class App {
  config: AppConfig;
  guildCaches: GuildCaches;
  saveManager: SaveManager;
  logger: Logger;
  saving: boolean;

  constructor(options: AppOptions) {
    this.config = options.config;
    this.guildCaches = new GuildCaches(this, { cacheLifespan: 2*3600_000 });
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
    if (this.saving) return;
    this.saving = true;

    await this.guildCaches.saveAllGuild();
    await this.logger.save();

    this.saving = false;
  }
}
