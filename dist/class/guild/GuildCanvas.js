import Canvas from "../util/Canvas.js";
import getColorByNumber from "../../util/getColorByNumber.js";
import * as CanvasUIDatas from "../../data/canvasUIDatas.js";
import * as milestones from "../../data/milestones.js";
import commaNumber from "comma-number";
export default class GuildCanvas {
    constructor(guild) {
        this.guild = guild;
        this.canvasStage = 0;
        this.size = null;
        this.canvas = null;
        this.uiDatas = null;
        this.prevPixelGridSize = -1;
    }
    async update() {
        const canvasStage = CanvasUIDatas.getCanvasStage(this.guild);
        if (this.canvasStage !== canvasStage) {
            this._repaint();
            this.canvasStage = canvasStage;
            this.size = CanvasUIDatas.getCanvasSize(canvasStage);
            this.uiDatas = CanvasUIDatas.getUIDatas(this.size, canvasStage);
            this.canvas = new Canvas({
                bgColor: "#222",
                size: this.size
            });
        }
        if (this.guild.hasFeature("display-counter"))
            this.updateCounter();
        if (this.guild.hasFeature("display-pixels"))
            this.updatePixels();
        if (this.guild.hasFeature("display-player-status"))
            await this.updatePlayerStatus();
        if (this.guild.hasFeature("display-milestone"))
            this.updateMilestone();
        if (this.guild.hasFeature("display-count-messages"))
            await this.updateCountMessages();
    }
    _repaint() {
        this.canvasStage = 0;
        this.size = null;
        this.canvas = null;
        this.uiDatas = null;
        this.prevPixelGridSize = -1;
    }
    async repaint() {
        this._repaint();
        await this.update();
    }
    getImage() {
        if (this.canvas === null)
            return undefined;
        return this.canvas.getImage();
    }
    getUIData(name) {
        if (this.uiDatas === null)
            return null;
        return this.uiDatas[name];
    }
    clearUIDataRange(uiData) {
        if (this.canvas === null)
            return;
        this.canvas.clearRange(uiData.x, uiData.y, uiData.width, uiData.height);
    }
    updateCounter() {
        if (this.canvas === null)
            return;
        const uiData = this.getUIData("counter");
        if (uiData === null)
            return;
        this.clearUIDataRange(uiData);
        // Counter
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
                    y: uiData.y + uiData.height * (1 / 2 - 1 / 24)
                },
                textBaseline: "middle"
            });
        }
        // PixelStatus
        if (this.prevPixelGridSize !== -1 && this.guild.hasFeature("pixels-status")) {
            const pixelGridSize = this.prevPixelGridSize;
            const pixelDiff = (pixelGridSize + 1) ** 2 - pixelGridSize ** 2;
            const pixelLeftToNextSize = (pixelGridSize + 1) ** 2 - this.guild.data.count;
            const progress = 1 - (pixelLeftToNextSize - pixelDiff) / pixelDiff;
            const color = getColorByNumber(this.guild.data.pixels.slice(-1)[0]);
            this.canvas.fillStyle = color;
            this.canvas.alpha = 0.5;
            this.canvas.fillRect({
                x: uiData.x,
                y: uiData.y + uiData.height * (1 - 1 / 10),
                width: uiData.width,
                height: uiData.height / 20,
            });
            this.canvas.alpha = 1;
            this.canvas.fillRect({
                x: uiData.x,
                y: uiData.y + uiData.height * (1 - 1 / 10),
                width: uiData.width * progress,
                height: uiData.height / 20,
            });
            this.canvas.fillText({
                position: {
                    x: uiData.x + uiData.width / 2,
                    y: uiData.y + uiData.height * (1 - 1 / 10),
                },
                font: "SpaceMono-Regular",
                fontSize: uiData.height / 7,
                text: `${pixelGridSize}² (${pixelLeftToNextSize - pixelDiff}/${pixelDiff})`,
                maxWidth: uiData.width / 3,
                textAlign: "center",
                textBaseline: "bottom"
            });
        }
    }
    fillPixel(idx, pixelSize, color, pixelsUIData, isSeparatorPixel = false) {
        if (this.canvas === null)
            return;
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
        if (this.canvas === null)
            return;
        const uiData = this.getUIData("pixels");
        if (uiData === null)
            return;
        const count = this.guild.data.count;
        const pixelGridSize = Math.ceil(Math.sqrt(Math.max(1, count)));
        this.canvas.initCanvasAttributes();
        const pixels = this.guild.data.pixels;
        const pixelSize = Math.min(uiData.width, uiData.height) / pixelGridSize;
        if (pixelGridSize !== this.prevPixelGridSize) {
            // Repaint pixels
            this.prevPixelGridSize = pixelGridSize;
            this.clearUIDataRange(uiData);
            for (let y = 0; y < pixelGridSize; y++) {
                for (let x = 0; x < pixelGridSize; x++) {
                    const idx = x + y * pixelGridSize;
                    let color;
                    if (idx > count - 1) {
                        color = "#000";
                    }
                    else {
                        color = this.guild.hasFeature("pixel-color") ? getColorByNumber(pixels[idx]) : "#fff";
                    }
                    this.fillPixel(idx, pixelSize, color, uiData);
                }
            }
        }
        else {
            // Fill lastest pixel
            const idx = pixels.length - 1;
            const color = this.guild.hasFeature("pixel-color") ? getColorByNumber(pixels[idx]) : "#fff";
            this.fillPixel(idx, pixelSize, color, uiData);
        }
    }
    async updatePlayerStatus() {
        var _a;
        if (this.canvas === null)
            return;
        const uiData = this.getUIData("playerStatus");
        if (uiData === null)
            return;
        this.clearUIDataRange(uiData);
        const playerStatuses = this.guild.data.lastCounts;
        const maxDisplay = this.guild.hasFeature("extend-player-status") ? 5 : 3;
        const width = uiData.width;
        const posX = uiData.x;
        for (let i = 0; i < Math.min(playerStatuses.length, maxDisplay); i++) {
            const height = uiData.height / maxDisplay;
            const posY = uiData.y + uiData.height * (i / maxDisplay);
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
                maxWidth: width * 0.8,
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
                maxWidth: width * 0.8,
                position: {
                    x: posX + width / 15,
                    y: posY + height / 5
                }
            });
        }
    }
    async updateCountMessages() {
        if (this.canvas === null)
            return;
        const uiData = this.getUIData("countMessages");
        if (uiData === null)
            return;
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
    updateMilestone() {
        if (this.canvas === null)
            return;
        const uiData = this.getUIData("milestone");
        if (uiData === null)
            return;
        this.clearUIDataRange(uiData);
        const count = this.guild.data.count;
        const milestoneNr = milestones.getMilestoneNr(count);
        const prevMilestone = milestones.getMilestone(milestoneNr);
        const nextMilestone = milestones.getMilestone(milestoneNr + 1);
        const progress = (count - prevMilestone.countGoal) / (nextMilestone.countGoal - prevMilestone.countGoal);
        const color = `hsl(${progress * 360}, 55%, 80%)`;
        // Progress bar
        this.canvas.fillStyle = "#fff2";
        this.canvas.fillRect({
            x: uiData.x,
            y: uiData.y,
            width: uiData.width,
            height: uiData.height / 4
        });
        this.canvas.fillStyle = color;
        this.canvas.fillRect({
            x: uiData.x,
            y: uiData.y,
            width: uiData.width * Math.min(1, progress),
            height: uiData.height / 4
        });
        // Texts
        this.canvas.fillText({
            text: `Milestone #${milestoneNr + 1}: ${nextMilestone.name} (${(progress * 100).toFixed(3)}%)`,
            font: "SpaceMono-Regular",
            fontSize: uiData.height / 1.2,
            maxWidth: uiData.width / 3,
            position: {
                x: uiData.x + uiData.width / 2,
                y: uiData.y + uiData.height / 4
            },
            bold: true,
            textAlign: "center"
        });
        this.canvas.fillText({
            text: `${commaNumber(prevMilestone.countGoal)} <`,
            font: "SpaceMono-Regular",
            fontSize: uiData.height / 1.2,
            maxWidth: uiData.width / 3,
            position: {
                x: uiData.x + uiData.width / 40,
                y: uiData.y + uiData.height / 4
            },
            textAlign: "left"
        });
        this.canvas.fillText({
            text: `< ${commaNumber(nextMilestone.countGoal)}`,
            font: "SpaceMono-Regular",
            fontSize: uiData.height / 1.2,
            maxWidth: uiData.width / 3,
            position: {
                x: uiData.x + uiData.width * (1 - 1 / 40),
                y: uiData.y + uiData.height / 4
            },
            textAlign: "right"
        });
    }
}
