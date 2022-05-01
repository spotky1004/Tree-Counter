import deepcopy from "deepcopy";
import App, { AppData } from "./App.js";
import type mongodb from "mongodb";
import type { GuildData } from "./guild/Guild.js";
import type { GuildPlayerData } from "./guild/GuildPlayer.js";

export type Collection = mongodb.Collection<mongodb.Document>;

const getGuildDocumentId = (id: string) => `g_${id}`;
const getGuildPlayerDocumentId = (guildId: string, id: string) => `g_${guildId}_u_${id}`;

class SaveManager {
  app: App;
  collection: Collection;

  constructor(app: App, collection: Collection) {
    this.app = app;
    this.collection = collection;
  }

  private async getDocumnet<T extends object>(id: string, defaultData: T) {
    const gotDocument = await this.collection.findOne({ _id: id });
    let data = deepcopy(defaultData);
    if (gotDocument !== null) {
      const gotDocumnetWithoutId: Omit<typeof gotDocument, "_id"> = gotDocument;
      delete gotDocumnetWithoutId.id;
      data = {...data, ...gotDocumnetWithoutId};
    }
    return data;
  }

  private async updateDocument(id: string, data: {[key: string]: any}) {
    const result = await this.collection.updateOne(
      { _id: id },
      { $set: data },
      { upsert: true }
    );
    return result.acknowledged;
  }

  async loadAppData() {
    const defaultData: AppData = {
      guildRanking: []
    };
    return await this.getDocumnet("app", defaultData);
  }

  async saveAppData() {
    return await this.updateDocument("app", this.app.data);
  }

  async loadGuild(id: string) {
    const defaultData: GuildData = {
      id,
      countingChannelId: "-1",
      pixels: [],
      count: 0,
      lastCounts: [],
      playerCount: 0,
      playerIds: [],
      ranking: [],
      isModServer: false,
    };
    return await this.getDocumnet(getGuildDocumentId(id), defaultData);
  }

  async saveGuild(id: string, data: GuildData) {
    return await this.updateDocument(getGuildDocumentId(id), data);
  }

  async loadGuildPlayer(guildId: string, id: string) {
    const defaultData: GuildPlayerData = {
      id,
      name: "",
      contributeCount: 0,
      playerIdx: -1,
      lastCountStemp: 0,
      isMod: false,
    };
    return await this.getDocumnet(getGuildPlayerDocumentId(guildId, id), defaultData);
  }

  async saveGuildPlayer(guildId: string, id: string, data: GuildPlayerData) {
    return await this.updateDocument(getGuildPlayerDocumentId(guildId, id), data);
  }
}

export default SaveManager;
