import deepcopy from "deepcopy";
const getGuildDocumentId = (id) => `g_${id}`;
const getGuildPlayerDocumentId = (guildId, id) => `g_${guildId}_u_${id}`;
class SaveManager {
    constructor(app, collection) {
        this.app = app;
        this.collection = collection;
    }
    async getDocumnet(id, defaultData) {
        const gotDocument = await this.collection.findOne({ _id: id });
        let data = deepcopy(defaultData);
        if (gotDocument !== null) {
            const gotDocumnetWithoutId = gotDocument;
            delete gotDocumnetWithoutId.id;
            data = Object.assign(Object.assign({}, data), gotDocumnetWithoutId);
        }
        return data;
    }
    async updateDocument(id, data) {
        const result = await this.collection.updateOne({ _id: id }, { $set: data }, { upsert: true });
        return result.acknowledged;
    }
    async loadAppData() {
        const defaultData = {
            guildRanking: []
        };
        return await this.getDocumnet("app", defaultData);
    }
    async saveAppData() {
        return await this.updateDocument("app", this.app.data);
    }
    async loadGuild(id) {
        const defaultData = {
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
    async saveGuild(id, data) {
        return await this.updateDocument(getGuildDocumentId(id), data);
    }
    async loadGuildPlayer(guildId, id) {
        const defaultData = {
            id,
            name: "",
            contributeCount: 0,
            playerIdx: -1,
            lastCountStemp: 0,
            isMod: false,
        };
        return await this.getDocumnet(getGuildPlayerDocumentId(guildId, id), defaultData);
    }
    async saveGuildPlayer(guildId, id, data) {
        return await this.updateDocument(getGuildPlayerDocumentId(guildId, id), data);
    }
}
export default SaveManager;
