import GuildPlayerCaches from "./GuildPlayerCaches.js";
import GuildCanvas from "./GuildCanvas.js";
import Discord from "discord.js";
import * as milestones from "../../data/milestones.js";
import type GuildCaches from "./GuildCaches.js";
import type App from "../App.js";

export interface GuildData {
  id: string;
  count: number;
  pixels: number[];
  lastCounts: {
    playerIdx: number;
    timestamp: number;
    color: string;
  }[];
  playerCount: number;
  playerIds: string[];
  ranking: { playerIdx: number; count: number; }[];
  /** "-1" means connected channel doesn't exists */
  countingChannelId: string;
  isModServer: boolean;
}

export default class Guild {
  app: App;
  canvas: GuildCanvas;
  guildCaches: GuildCaches;
  guildPlayerCaches: GuildPlayerCaches;
  data: GuildData;
  connectedChannel: Discord.GuildTextBasedChannel | null;
  private message: Discord.Message | null;
  countMessages: { playerIdx: number, content: string }[];
  milestoneNr: number;
  private unlockedFeatures: milestones.UnlockableFeatures[];
  lastActive: number;

  constructor(app: App, guildCaches: GuildCaches, data: GuildData) {
    this.app = app;
    this.canvas = new GuildCanvas(this);
    this.guildCaches = guildCaches;
    this.guildPlayerCaches = new GuildPlayerCaches(app, this, { cacheLifespan: 30*60_000 });
    this.data = data;
    this.connectedChannel = null;
    this.message = null;
    this.countMessages = [];
    this.milestoneNr = -1;
    this.unlockedFeatures = [];
    this.lastActive = new Date().getTime();

    this.data.pixels.splice(this.data.count);
    this.updateMilestone();
  }

  // Discord
  async connectChannelWithInteraction(interaction: Discord.CommandInteraction) {
    if (!(interaction.inGuild() && interaction.guild && interaction.channel)) return false;

    const author = await interaction.guild?.members.fetch(interaction.user.id);
    const channel = interaction.channel;

    if (typeof author === "undefined") {
      await interaction.editReply({
        content: "An unknown error occurred while connecting..."
      });
      return true;
    }
    if (!author?.permissions.has("MANAGE_CHANNELS")) {
      await interaction.editReply({
        content: "MANAGE_CHANNELS permission is required to use this command!"
      });
      return true;
    }
    if (channel.type !== "GUILD_TEXT" && channel.type !== "GUILD_PUBLIC_THREAD") {
      await interaction.editReply({
        content: "Channel must be Text channel!"
      });
      return true;
    }

    if (
      this.connectedChannel !== null
    ) {
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

  async connectChannel(channel: Discord.GuildTextBasedChannel) {
    try {
      this.data.countingChannelId = channel.id;
      this.connectedChannel = channel;
  
      await this.canvas.update();
    } catch (e) {
      this.data.countingChannelId = "-1";
      this.connectedChannel = null;
    }
  }

  async updateMessage() {
    if (!this.connectedChannel) return false;

    let messageOptions: Discord.MessageOptions;
    const image = this.canvas.getImage();
    if (typeof image !== "undefined") {
      const attachment = new Discord.MessageAttachment(image, "canvas.png")
      messageOptions = {
        content: "** **",
        files: [attachment]
      };
    } else {
      messageOptions = {
        content: `\`\`\`css\nWelcome to Tree Counter!\nCurrent Count: [${this.data.count.toString().padStart(8, "0")}]\n\`\`\``
      };
    }
    if (
      this.message === null ||
      this.message.deleted
    ) {
      this.message = await this.connectedChannel.send(messageOptions).catch(e => e);
    } else {
      await this.message.edit(messageOptions).catch(e => e);
    }

    return true;
  }

  disconnectMessage() {
    this.message = null;
  }

  // Count
  get nextCount() {
    return this.data.count + 1;
  }

  get countCooldown() {
    let cooldown = 10_000;
    if (this.hasFeature("reduce-cooldown-1")) cooldown -= 4_000;
    if (this.hasFeature("reduce-cooldown-2")) cooldown -= 3_000;
    if (this.hasFeature("reduce-cooldown-3")) cooldown -= 1_500;
    return cooldown;
  }

  /**
   * Return value is cooldown left
   */
  async count(playerId: string, playerName: string, message: Discord.Message, logMessage: boolean) {
    const playerCache = await this.guildPlayerCaches.getGuildPlayer(playerId, playerName);
    const playerIdx = playerCache.data.playerIdx;

    const lastCount = this.data.lastCounts[0];
    const cooldownLeft = this.countCooldown + playerCache.data.lastCountStemp - new Date().getTime();
    if (
      lastCount &&
      lastCount.playerIdx === playerIdx &&
      cooldownLeft > 0
    ) {
      return cooldownLeft;
    }
    
    this.data.pixels[this.data.count] = playerIdx;
    this.data.count++;
    this.updateMilestone();
    const prevLastCountsIdx = this.data.lastCounts.findIndex(lastCount => lastCount.playerIdx === playerIdx);
    const color = message.member?.displayHexColor;
    if (prevLastCountsIdx === -1) {
      this.data.lastCounts.unshift({
        playerIdx,
        color: color && color !== "#000000" ? color : "#ffffff",
        timestamp: new Date().getTime()
      });
      this.data.lastCounts.splice(5);
    } else {
      const data = this.data.lastCounts.splice(prevLastCountsIdx, 1)[0];
      data.color = color && color !== "#000000" ? color : "#ffffff";
      this.data.lastCounts.unshift(data);
    }
    this.countMessages.unshift({
      playerIdx,
      content: message.content
    });
    this.countMessages.splice(10);
    await this.canvas.update();

    playerCache.count();
    const rankingIdx = this.data.ranking.findIndex(data => data.playerIdx === playerIdx);
    if (rankingIdx === -1) {
      this.data.ranking.push({
        count: playerCache.data.contributeCount,
        playerIdx
      });
    } else {
      this.data.ranking[rankingIdx].count = playerCache.data.contributeCount;
    }
    this.data.ranking.sort((a, b) => b.count - a.count);
    this.app.logger.addLog("Count", {
      guildId: this.data.id,
      text: logMessage ? message.content : (this.data.count-1).toString(),
      userId: playerId
    });

    this.lastActive = new Date().getTime();
    this.updateMessage();
    return 0;
  }

  updateMilestone() {
    let newMilestoneNr = milestones.getMilestoneNr(this.data.count);
    if (this.milestoneNr !== newMilestoneNr) {
      this.milestoneNr = newMilestoneNr;
      this.unlockedFeatures = milestones.getUnlockedFeatures(newMilestoneNr);
    }
  }

  hasFeature(feature: milestones.UnlockableFeatures) {
    return this.unlockedFeatures.includes(feature);
  }
}
