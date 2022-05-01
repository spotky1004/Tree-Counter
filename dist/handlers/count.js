import parseExpression from "../util/parseExpression.js";
import discordCooldownFormat from "../util/discordCooldownFormat.js";
/**
 * Return value is [countSuccess, countCorrect, countValue]
 */
export default async function countHandler(message, guildCache) {
    let countValue;
    if (guildCache.hasFeature("expression-count")) {
        countValue = parseExpression(message.content);
    }
    else {
        countValue = parseInt(message.content);
    }
    const nextCount = guildCache.nextCount;
    const member = message.member;
    const countCorrect = nextCount === Math.round(countValue) ||
        (guildCache.hasFeature("short-count") &&
            nextCount % 100 !== 0 &&
            nextCount.toString().slice(-3) === countValue.toString().slice(-3));
    let countSuccess = false;
    if (member && countCorrect) {
        const timeLeft = await guildCache.count(member.id, member.displayName, message);
        if (timeLeft > 0) {
            message.author.send(`Cooldown!\n${discordCooldownFormat(new Date().getTime(), timeLeft)}`).catch(e => e);
            countSuccess = false;
        }
        else {
            countSuccess = true;
        }
    }
    return [countSuccess, countCorrect, countValue];
}
