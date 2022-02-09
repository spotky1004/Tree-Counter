import Discord from 'discord.js';
import { load, save } from './src/util/saveload.js';
import drawCanvas from './src/util/drawCanvas.js';

(await import("dotenv")).config();

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
  console.log("[Tree-Counter] bot ready");
  client.user.setActivity({
    name: "Type \"treecounter\" to open help"
  });
  await client.channels.fetch("902044346403155979")
    .then(channel => {
      attachLogChannel = channel;
      channel.send("login!");
    });
});

client.on("messageCreate", async (message) => {
  // Load save
  const userId = message.author.id;
  const guildId = message.guildId;
  const userSave = await load("USER", userId);
  const guildSave = await load("GUILD", guildId);
  const currentCount = guildSave.count;

  if (message.member) {
    if (message.content === "setTreeCountChannel" && message.member.permissions.has("ADMINISTRATOR")) {
      guildSave.countingChannelId = message.channelId;
      await save(message.guildId, guildSave);
      message.channel.send(`Done!\nNext count: ${guildSave.count+1}`).catch(err => err);
      return;
    } else if (message.content === "viewTreeLeaderboard") {
      let leaderboardData = [];
      const counts = guildSave.blockAuthors.reduce((a, b) => {a[b]++; return a;}, new Array(guildSave.blockPalette.length).fill(0));
      for (let i = 0; i < guildSave.blockPalette.length; i++) {
        const userId = guildSave.blockPalette[i];
        const userCount = counts[i];
        leaderboardData.push([userId, userCount]);
      }
      leaderboardData.sort((a, b) => b[1]-a[1]);
      let leaderboardText = leaderboardData.map((data, idx) => `\`${(idx+1).toString().padStart(2, " ")}\` \`${data[1].toString().padStart(6, " ")}\` <@${data[0]}>`).slice(0, 40).join("\n");
  
      const leaderBoardEmbed = new Discord.MessageEmbed()
        .setTitle(`Leaderboard (max. 40, tot. ${leaderboardData.length})`)
        .setDescription(leaderboardText)
        .setColor("#ffe817");
  
      message.channel.send({
        embeds: [leaderBoardEmbed]
      }).catch(err => err);
      return;
    }
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
    message.delete().catch(e => e);
  } else if (
    guildSave.lastCount.userId === userId &&
    guildSave.lastCount.timestemp + 10_000 > new Date().getTime()
  ) {
    await message.author.send(`You can count again in \`${(10_000 + (guildSave.lastCount.timestemp - new Date().getTime()))/1000}sec\` (or after other person counted)`)
      .catch(err => err);
    message.delete().catch(e => e);
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
    for (let i = guildSave.countMemberCache.length-1; i >= 1; i--) {
      let data = guildSave.countMemberCache[i];
      if (data.id === userId || data.id === "id") guildSave.countMemberCache.splice(i, 1);
    }
    guildSave.countMemberCache = guildSave.countMemberCache.slice(0, 5);
  
    // Save savedata
    await save(userId, userSave);
    await save(guildId, guildSave);
  
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

    if (nextCount%100 !== 0) {
      message.delete().catch(e => e);
    } else {
      countingMessageData[guildId].inactive = true;
    }
  }
});

client.login(process.env["TOKEN_TREE_COUNTER_DEV"]);
