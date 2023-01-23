import discordCooldownFormat from "../util/discordCooldownFormat.js";
import parseExpression from "../util/client/parseExpression.js";
/**
 * Return value is [countSuccess, countCorrect, countValue]
 */
export default async function countHandler(message, guildCache) {
    let countValue;
    let valueType;
    if (guildCache.hasFeature("expression-count")) {
        [countValue, valueType] = parseExpression(message.content);
    }
    else {
        [countValue, valueType] = [parseInt(message.content), "message"];
    }
    const nextCount = guildCache.nextCount;
    const member = message.member;
    const countCorrect = nextCount === Math.round(countValue) ||
        (guildCache.hasFeature("short-count") &&
            nextCount % 100 !== 0 &&
            nextCount.toString().slice(-3) === countValue.toString().slice(-3));
    if (guildCache.hasFeature("short-count") && nextCount % 100 !== countValue % 100) {
        countValue = nextCount;
    }
    let countSuccess = false;
    if (member && countCorrect) {
        const timeLeft = await guildCache.count(member.id, member.displayName, message, valueType === "expression");
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
