import getColorByNumber from "../../util/getColorByNumber.js";
export default class GuildPlayer {
    constructor(app, guild, data) {
        this.app = app;
        this.guild = guild;
        this.data = data;
        this.lastActive = new Date().getTime();
        this.color = getColorByNumber(this.data.playerIdx);
    }
    count() {
        this.data.contributeCount++;
        this.data.lastCount = new Date().getTime();
        this.lastActive = new Date().getTime();
    }
}
