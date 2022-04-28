import path from "path";
import canvas from "canvas";
canvas.registerFont(path.join("./resources/font", "SpaceMono-Regular.ttf"), { family: "SpaceMono-Regular" });
canvas.registerFont(path.join("./resources/font", "SourceHanSansHWK-VF.ttf"), { family: "SourceHanSansHWK-VF" });
export default class Canvas {
    constructor(config) {
        var _a, _b;
        this.config = config;
        this.canvas = canvas.createCanvas((_a = config.size.width) !== null && _a !== void 0 ? _a : 800, (_b = config.size.height) !== null && _b !== void 0 ? _b : 1200);
        this.ctx = this.canvas.getContext("2d");
        this.ctx.fillStyle = this.config.bgColor;
        this.ctx.fillRect(0, 0, config.size.width, config.size.height);
        this.initCanvasAttributes();
    }
    // Attribute
    initCanvasAttributes() {
        this.ctx.globalCompositeOperation = "source-over";
    }
    set alpha(value) {
        this.ctx.globalAlpha = value;
    }
    get alpha() {
        return this.ctx.globalAlpha;
    }
    set fillStyle(value) {
        this.ctx.fillStyle = value;
    }
    get fillStyle() {
        return this.ctx.fillStyle.toString();
    }
    // Draw
    clearRange(x, y, w, h) {
        this.ctx.fillStyle = this.config.bgColor;
        this.fillRect({
            x,
            y,
            width: w,
            height: h
        });
    }
    clear() {
        this.clearRange(0, 0, this.canvas.width, this.canvas.height);
    }
    fillRect(options) {
        this.ctx.fillRect(Math.ceil(options.x), Math.ceil(options.y), Math.ceil(options.width), Math.ceil(options.height));
    }
    fillText(options) {
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        this.ctx.font = `${options.fontSize / 1.4}px "${options.font}"` + (options.bold ? " bold" : "");
        this.ctx.fillText(options.text, options.position.x, options.position.y, options.maxWidth);
    }
    // etc
    getImage() {
        return this.canvas.toBuffer();
    }
}
