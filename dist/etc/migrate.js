import { data as newCollection } from "../db.js";
let oldCollection;
const oldCollectionCursor = oldCollection.find({});
while (true) {
    const document = await oldCollectionCursor.next();
    if (document === null)
        break;
    const guildId = document._id;
    const data = JSON.parse(document.savedata);
    if (typeof data.countingChannelId !== "string")
        continue;
    console.time(guildId);
    const playerPixels = Array(data.blockPalette.length).fill(0);
    for (let i = 0; i < data.blockAuthors.length; i++) {
        playerPixels[data.blockAuthors[i]]++;
    }
    const newGuildData = {
        id: guildId,
        countingChannelId: data.countingChannelId,
        pixels: data.blockAuthors,
        count: data.count,
        lastCounts: [],
        playerCount: data.blockPalette.length,
        playerIds: data.blockPalette,
        ranking: [],
        isModServer: false,
    };
    await newCollection.updateOne({ _id: `g_${guildId}` }, { $set: newGuildData }, { upsert: true });
    for (let i = 0; i < data.blockPalette.length; i++) {
        const count = playerPixels[i];
        const playerId = newGuildData.playerIds[i];
        const newPlayerData = {
            id: playerId,
            name: "",
            contributeCount: count,
            playerIdx: i,
            lastCountStemp: 0,
            isMod: false,
        };
        await newCollection.updateOne({ _id: `g_${guildId}_u_${playerId}` }, { $set: newPlayerData }, { upsert: true });
    }
    console.timeEnd(guildId);
}
console.log("done");
