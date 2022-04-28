import Canvas from "../util/Canvas.js";
import getColorByNumber from "../../util/getColorByNumber.js";
const getdefaultSize = () => ({
    width: 1400,
    height: 800
});
const getUIRatios = (widthPerHeight) => ({
    counter: { x: 0, y: 0, width: 1, height: 0.2 },
    pixels: { x: 0, y: 0.2, width: 0.8 / widthPerHeight, height: 0.8 },
    playerStatus: { x: 0.8 / widthPerHeight, y: 0.2, width: (1 - 0.8 / widthPerHeight) * 2 / 5, height: 0.8 },
    countMessages: { x: 0.8 / widthPerHeight + (1 - 0.8 / widthPerHeight) * 2 / 5, y: 0.2, width: (1 - 0.8 / widthPerHeight) * 3 / 5, height: 0.8 },
});
export default class GuildCanvas {
    constructor(guild, config) {
        var _a;
        const size = (_a = config.size) !== null && _a !== void 0 ? _a : getdefaultSize();
        this.guild = guild;
        this.canvas = new Canvas({
            bgColor: "#222",
            size
        });
        this.uiDatas = GuildCanvas.getUIDatas(size);
        this.prevPixelGridSize = -1;
    }
    static getUIDatas(size) {
        const uiRatios = getUIRatios(size.width / size.height);
        const uiData = {};
        let uiName;
        for (uiName in uiRatios) {
            const uiRatio = uiRatios[uiName];
            uiRatio.x *= size.width;
            uiRatio.y *= size.height;
            uiRatio.width *= size.width;
            uiRatio.height *= size.height;
            uiData[uiName] = uiRatio;
        }
        return uiData;
    }
    async update() {
        this.updateCounter();
        this.updatePixels();
        await this.updatePlayerStatus();
        await this.updateCountMessages();
    }
    getImage() {
        return this.canvas.getImage();
    }
    getUIData(name) {
        return this.uiDatas[name];
    }
    clearUIDataRange(uiData) {
        this.canvas.clearRange(uiData.x, uiData.y, uiData.width, uiData.height);
    }
    updateCounter() {
        const uiData = this.getUIData("counter");
        this.clearUIDataRange(uiData);
        const count = String(this.guild.data.count).padStart(8, "0");
        this.canvas.alpha = 0.5;
        this.canvas.fillStyle = "#fff";
        for (let i = 0; i < 8; i++) {
            const text = count[i];
            if (text !== "0")
                this.canvas.alpha = 1;
            this.canvas.fillText({
                text,
                fontSize: uiData.height,
                font: "SpaceMono-Regular",
                position: {
                    x: uiData.x + uiData.width * (0.15 + 0.7 * (i / 8)),
                    y: uiData.y
                },
            });
        }
    }
    fillPixel(idx, pixelSize, color, pixelsUIData, isSeparatorPixel = false) {
        const pixelGridSize = this.prevPixelGridSize;
        const x = idx % pixelGridSize;
        const y = Math.floor(idx / pixelGridSize);
        this.canvas.fillStyle = color;
        this.canvas.fillRect({
            x: x * pixelSize + pixelsUIData.x,
            y: y * pixelSize + pixelsUIData.y,
            width: pixelSize,
            height: pixelSize
        });
        if (!isSeparatorPixel && (x + y) % 2 === 1) {
            this.fillPixel(idx, pixelSize, "#ffffff14", pixelsUIData, true);
        }
    }
    updatePixels() {
        const uiData = this.getUIData("pixels");
        const count = this.guild.data.count;
        const pixelGridSize = Math.ceil(Math.sqrt(Math.max(1, count)));
        this.canvas.initCanvasAttributes();
        const pixels = this.guild.data.pixels;
        const pixelSize = uiData.width / pixelGridSize;
        if (pixelGridSize !== this.prevPixelGridSize) {
            // Repaint pixels
            this.prevPixelGridSize = pixelGridSize;
            this.clearUIDataRange(uiData);
            for (let y = 0; y < pixelGridSize; y++) {
                for (let x = 0; x < pixelGridSize; x++) {
                    const idx = x + y * pixelGridSize;
                    this.fillPixel(idx, pixelSize, getColorByNumber(pixels[idx]), uiData);
                }
            }
        }
        else {
            // Fill lastest pixel
            const idx = pixels.length - 1;
            this.fillPixel(idx, pixelSize, getColorByNumber(pixels[idx]), uiData);
        }
    }
    async updatePlayerStatus() {
        var _a;
        const uiData = this.getUIData("playerStatus");
        this.clearUIDataRange(uiData);
        const playerStatuses = this.guild.data.lastCounts;
        const width = uiData.width;
        const posX = uiData.x;
        for (let i = 0; i < Math.min(playerStatuses.length, 5); i++) {
            const height = uiData.height / 5;
            const posY = uiData.y + uiData.height * (i / 5);
            const playerStatus = playerStatuses[i];
            const playerCache = await this.guild.guildPlayerCaches.getGuildPlayerByIdx(playerStatus.playerIdx);
            if (playerCache === null)
                continue;
            this.canvas.fillStyle = getColorByNumber(playerStatus.playerIdx);
            this.canvas.fillRect({
                x: posX + width / 30,
                y: posY,
                width: width / 40,
                height: height,
            });
            this.canvas.fillStyle = (_a = playerStatus.color) !== null && _a !== void 0 ? _a : "#ffffff";
            const rank = 1 + this.guild.data.ranking.findIndex(data => data.playerIdx === playerCache.data.playerIdx);
            this.canvas.fillText({
                font: "SourceHanSansHWK-VF",
                text: `${playerCache.data.name} | #${rank}`,
                fontSize: height / 5 * 1.3,
                maxWidth: width,
                position: {
                    x: posX + width / 15,
                    y: posY
                }
            });
            this.canvas.fillStyle = "#ffffff";
            this.canvas.fillText({
                font: "SpaceMono-Regular",
                text: playerCache.data.contributeCount.toString(),
                fontSize: height / 5 * 3.7,
                maxWidth: width,
                position: {
                    x: posX + width / 15,
                    y: posY + height / 5
                }
            });
        }
    }
    async updateCountMessages() {
        const uiData = this.getUIData("countMessages");
        this.canvas.fillStyle = "#272727";
        this.canvas.fillRect(uiData);
        const countMessages = this.guild.countMessages;
        this.canvas.fillStyle = "#fff";
        const width = uiData.width;
        const height = uiData.height / 10;
        for (let i = 0; i < Math.min(countMessages.length, 10); i++) {
            const posY = uiData.y + uiData.height * (i / 10);
            const countMessage = countMessages[i];
            const playerCache = await this.guild.guildPlayerCaches.getGuildPlayerByIdx(countMessage.playerIdx);
            if (playerCache === null)
                continue;
            this.canvas.fillText({
                font: "SourceHanSansHWK-VF",
                text: `${playerCache.data.name} | ${countMessage.content}`,
                fontSize: height / 2,
                maxWidth: width - width / 15 * 2,
                position: {
                    x: uiData.x + width / 15,
                    y: posY + height / 4
                }
            });
        }
    }
}
