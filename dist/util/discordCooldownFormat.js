export default function discordCooldownFormat(currentTime, leftTime) {
    const timestamp = Math.floor((currentTime + leftTime) / 1000);
    return `<t:${timestamp}:f> (**${(leftTime / 1000).toFixed(2)}s** left)`;
}
