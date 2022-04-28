import parseExpression from "../util/parseExpression.js";
import discordCooldownFormat from "../util/discordCooldownFormat.js";
import type Guild from "../class/guild/Guild.js";
import type Discord from "discord.js";

export default async function countHandler(message: Discord.Message, guildCache: Guild): Promise<[boolean, number]> {
  const value = parseExpression(message.content);
  const nextCount = guildCache.nextCount;
  
  const member = message.member;
  if (member && nextCount === Math.round(value)) {
    const timeLeft = await guildCache.count(member.id, member.displayName, message);
    if (timeLeft > 0) {
      message.author.send(`Cooldown!\n${discordCooldownFormat(new Date().getTime(), timeLeft)}`).catch(e => e);
      return [true, value];
    } else {
      return [true, value];
    }
  }
  return [false, value];
}
