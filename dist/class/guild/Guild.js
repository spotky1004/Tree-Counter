import GuildPlayerCaches from "./GuildPlayerCaches.js";
import GuildCanvas from "./GuildCanvas.js";
import Discord from "discord.js";
export default class Guild {
    constructor(app, guildCaches, data) {
        this.app = app;
        this.canvas = new GuildCanvas(this, {});
        this.guildCaches = guildCaches;
        this.guildPlayerCaches = new GuildPlayerCaches(app, this, { cacheLifespan: 30 * 60000 });
        this.data = data;
        this.connectedChannel = null;
        this.message = null;
        this.countMessages = [];
        this.lastActive = new Date().getTime();
    }
    async connectChannelWithInteraction(interaction) {
        var _a;
        if (!(interaction.inGuild() && interaction.guild && interaction.channel))
            return false;
        const author = await ((_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.members.fetch(interaction.user.id));
        const channel = interaction.channel;
        if (typeof author === "undefined") {
            await interaction.editReply({
                content: "An unknown error occurred while connecting..."
            });
            return true;
        }
        if (!(author === null || author === void 0 ? void 0 : author.permissions.has("MANAGE_CHANNELS"))) {
            await interaction.editReply({
                content: "MANAGE_CHANNELS permission is required to use this command!"
            });
            return true;
        }
        if (channel.type !== "GUILD_TEXT") {
            await interaction.editReply({
                content: "Channel must be Text channel!"
            });
            return true;
        }
        if (this.connectedChannel !== null) {
            this.connectedChannel.send("Disconnected").catch(e => e);
        }
        await this.connectChannel(channel);
        await interaction.editReply({
            content: "Done!"
        });
        this.app.logger.addLog("Connect", {
            userId: interaction.user.id,
            channelId: interaction.channelId,
            guildId: interaction.guildId,
        });
        return true;
    }
    async connectChannel(channel) {
        this.data.countingChannelId = channel.id;
        this.connectedChannel = channel;
        await this.canvas.update();
        this.updateMessage();
    }
    async updateMessage() {
        if (!this.connectedChannel)
            return false;
        const attachment = new Discord.MessageAttachment(this.canvas.getImage(), "canvas.png");
        const messageOptions = {
            content: "** **",
            files: [attachment]
        };
        if (this.message === null ||
            this.message.deleted) {
            this.message = await this.connectedChannel.send(messageOptions).catch(e => e);
        }
        else {
            await this.message.edit(messageOptions).catch(e => e);
        }
        return true;
    }
    get nextCount() {
        return this.data.count + 1;
    }
    disconnectMessage() {
        this.message = null;
    }
    async count(playerId, playerName, message) {
        var _a, _b, _c, _d;
        const playerCache = await this.guildPlayerCaches.getGuildPlayer(playerId, playerName);
        const playerIdx = playerCache.data.playerIdx;
        const cooldownLeft = 10000 + playerCache.lastActive - new Date().getTime();
        if (cooldownLeft > 0) {
            return cooldownLeft;
        }
        this.data.count++;
        this.data.pixels.push(playerIdx);
        const prevLastCountsIdx = this.data.lastCounts.findIndex(lastCount => lastCount.playerIdx === playerIdx);
        if (prevLastCountsIdx === -1) {
            this.data.lastCounts.unshift({
                playerIdx,
                color: (_b = (_a = message.member) === null || _a === void 0 ? void 0 : _a.displayHexColor) !== null && _b !== void 0 ? _b : "#ffffff",
                timestamp: new Date().getTime()
            });
            this.data.lastCounts.splice(5);
        }
        else {
            const data = this.data.lastCounts.splice(prevLastCountsIdx, 1)[0];
            data.color = (_d = (_c = message.member) === null || _c === void 0 ? void 0 : _c.displayHexColor) !== null && _d !== void 0 ? _d : "#ffffff";
            this.data.lastCounts.unshift(data);
        }
        this.countMessages.unshift({
            playerIdx,
            content: message.content
        });
        this.countMessages.splice(10);
        await this.canvas.update();
        playerCache.count();
        if (!this.data.ranking.find(data => data.playerIdx === playerIdx)) {
            this.data.ranking.push({
                count: playerCache.data.contributeCount,
                playerIdx
            });
        }
        this.data.ranking.sort((a, b) => b.count - a.count);
        this.app.logger.addLog("Count", {
            guildId: this.data.id,
            text: message.content,
            userId: playerId
        });
        this.lastActive = new Date().getTime();
        this.updateMessage();
        return 0;
    }
}
