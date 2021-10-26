import Discord from 'discord.js';
import { load, save } from './src/core/saveload.js';
import * as config from './config.js';
import drawCanvas from './src/core/drawCanvas.js';

/**
 * @typedef {object} countingMessageData
 * @property {Discord.Message} message
 * @property {boolean} inactive
 */
/** @type {Object.<string, countingMessageData>} */
const countingMessageData = {};
const client = new Discord.Client({
  intents: [ "GUILDS", "GUILD_MESSAGES" ],
  partials: [ "CHANNEL", "USER" ]
});
/** @type {Discord.TextChannel} */
let attachLogChannel = null;

client.on("ready", async () => {
  console.log("bot ready");
  await client.channels.fetch("902044346403155979")
    .then(ch => attachLogChannel = ch);
});

client.on("messageCreate", async (message) => {
  // Load save
  const userId = message.author.id;
  const guildId = message.guildId;
  const userSave = load("USER", userId);
  const guildSave = load("GUILD", guildId);
  const currentCount = guildSave.count;

  if (
    message.member && message.member.permissions.has("ADMINISTRATOR") &&
    message.content === "setTreeCountChannel"
  ) {
    guildSave.countingChannelId = message.channelId;
    save(message.guildId, guildSave);
    message.channel.send("Done!");
    return;
  }

  // System exceptions
  if (
    guildSave.countingChannelId !== message.channelId ||
    message.author.bot
  ) return;

  // Parse message
  const nextCount = parseInt(message.content);

  // Count exceptions
  if (isNaN(nextCount)) {
    if (typeof countingMessageData[guildId] !== "undefined") {
      countingMessageData[guildId].inactive = true;
    }
    return;
  } else if (
    currentCount >= nextCount ||
    nextCount > currentCount + userSave.level
  ) {
    await message.author.send(`Next count range is ${currentCount + 1} ~ ${currentCount + userSave.level}`)
      .catch(err => err);
  } else if (
    guildSave.lastCount.userId === userId &&
    guildSave.lastCount.timestemp + 10_000 > new Date().getTime()
  ) {
    await message.author.send(`You can count again in \`${(10_000 + (guildSave.lastCount.timestemp - new Date().getTime()))/1000}sec\` (or after other person counted)`)
      .catch(err => err);
  } else {
    // Change varables
    guildSave.count = nextCount;
    if (!guildSave.blockPalette.includes(userId)) {
      guildSave.blockPalette.push(userId);
    }
    let paletteIdx = guildSave.blockPalette.findIndex(e => e === userId);
    guildSave.blockAuthors.push(paletteIdx);
    if (guildSave.blockAuthors.length > guildSave.boardSize**2) {
      guildSave.boardSize++;
    }
    guildSave.lastCount = {
      userId,
      timestemp: new Date().getTime()
    };
    const displayHexColor = message.member.displayHexColor;
    guildSave.countMemberCache.unshift({
      name: message.member.displayName,
      color: displayHexColor !== "#000000" ? displayHexColor : "#ffffff",
      id: userId,
      paletteIdx
    });
    guildSave.countMemberCache = guildSave.countMemberCache.slice(0, 5);
    for (let i = guildSave.countMemberCache.length-1; i >= 1; i--) {
      let data = guildSave.countMemberCache[i];
      if (data.id === userId || data.id === "id") guildSave.countMemberCache.splice(i, 1);
    }
  
    // Save savedata
    save(userId, userSave);
    save(guildId, guildSave);
  
    if (
      typeof countingMessageData[guildId] === "undefined" ||
      countingMessageData[guildId].inactive === true
    ) {
      const counterMessage = await message.channel.send("```\nloading...```")
        .catch(err => err);
      if (!counterMessage) return;
      countingMessageData[guildId] = {
        message: counterMessage,
        inactive: false
      }
    }
    
    // Update Message
    const mainImg = new Discord.MessageAttachment(drawCanvas(guildSave, userId).toBuffer(), `main_${guildId}.png`);
    let imageLogMsg = await attachLogChannel.send({ files: [mainImg] });
    let imageUrl = imageLogMsg.attachments.first().url;
    await countingMessageData[guildId].message.edit({
      content: "** **",
      embeds: [
        {
          image: {
            url: imageUrl,
          },
        }
      ]
    })
      .catch(err => err);
    // imageLogMsg.delete();
  }

  message.delete()
    .catch(e => e);
});

client.login(config.token);
