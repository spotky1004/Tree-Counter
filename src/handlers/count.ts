import discordCooldownFormat from "../util/discordCooldownFormat.js";
import parseExpression, { ExpressionValueType } from "../util/client/parseExpression.js";
import type Guild from "../class/guild/Guild.js";
import type Discord from "discord.js";

/**
 * Return value is [countSuccess, countCorrect, countValue]
 */
export default async function countHandler(message: Discord.Message, guildCache: Guild): Promise<[boolean, boolean, number]> {
  let countValue: number;
  let valueType: ExpressionValueType;
  if (guildCache.hasFeature("expression-count")) {
    [countValue, valueType] = parseExpression(message.content);
  } else {
    [countValue, valueType] = [parseInt(message.content), "message"];
  }

  const nextCount = guildCache.nextCount;
  
  const member = message.member;
  const countCorrect =
    nextCount === Math.round(countValue) ||
    (
      guildCache.hasFeature("short-count") &&
      nextCount%100 !== 0 &&
      nextCount.toString().slice(-3) === countValue.toString().slice(-3)
    );

  let countSuccess = false;
  if (member && countCorrect) {
    const timeLeft = await guildCache.count(member.id, member.displayName, message, valueType === "expression");
    if (timeLeft > 0) {
      message.author.send(`Cooldown!\n${discordCooldownFormat(new Date().getTime(), timeLeft)}`).catch(e => e);
      countSuccess = false;
    } else {
      countSuccess = true;
    }
  }
  return [countSuccess, countCorrect, countValue];
}
