import deepcopy from "deepcopy";
const getGuildDocumentId = (id) => `g_${id}`;
// @ts-ignore 
const getGuildPlayerDocumentId = (id) => `g_${id}_u_${id}`;
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
    async loadGuildPlayer(id) {
        const defaultData = {
            id,
            name: "",
            contributeCount: 0,
            playerIdx: -1,
            lastCountStemp: 0,
        };
        return await this.getDocumnet(getGuildPlayerDocumentId(id), defaultData);
    }
    async saveGuildPlayer(id, data) {
        return await this.updateDocument(getGuildPlayerDocumentId(id), data);
    }
}
export default SaveManager;
