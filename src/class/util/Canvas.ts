import path from "path";
import canvas from "canvas";
canvas.registerFont(path.join("./resources/font", "SpaceMono-Regular.ttf"), {family: "SpaceMono-Regular"});
canvas.registerFont(path.join("./resources/font", "SourceHanSansHWK-VF.ttf"), {family: "SourceHanSansHWK-VF"});

interface Size {
  width: number;
  height: number;
}
interface CanvasConfig {
  size: Size;
  bgColor: string;
}

interface FillRectOptions {
  x: number;
  y: number;
  width: number;
  height: number;
}
type FontNames = "SourceHanSansHWK-VF" | "SpaceMono-Regular";
interface FillTextOptions {
  text: string;
  font: FontNames;
  position: {
    x: number;
    y: number;
  };
  fontSize: number;
  bold?: boolean;
  maxWidth?: number;
  textAlign?: canvas.CanvasRenderingContext2D["textAlign"];
  textBaseline?: canvas.CanvasRenderingContext2D["textBaseline"];
}

export default class Canvas {
  config: CanvasConfig;
  canvas: canvas.Canvas;
  private ctx: canvas.CanvasRenderingContext2D;

  constructor(config: CanvasConfig) {
    this.config = config;
    this.canvas = canvas.createCanvas(config.size.width ?? 800, config.size.height ?? 1200);
    this.ctx = this.canvas.getContext("2d");

    this.ctx.fillStyle = this.config.bgColor;
    this.ctx.fillRect(0, 0, config.size.width, config.size.height);
    this.initCanvasAttributes();
  }

  // Attribute
  initCanvasAttributes() {
    this.ctx.globalCompositeOperation = "source-over";
  }

  set alpha(value: number) {
    this.ctx.globalAlpha = value;
  }
  get alpha() {
    return this.ctx.globalAlpha;
  }

  set fillStyle(value: string) {
    this.ctx.fillStyle = value;
  }
  get fillStyle() {
    return this.ctx.fillStyle.toString();
  }

  // Draw
  clearRange(x: number, y: number, w: number, h: number) {
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

  fillRect(options: FillRectOptions) {
    this.ctx.fillRect(
      Math.ceil(options.x),
      Math.ceil(options.y),
      Math.ceil(options.width),
      Math.ceil(options.height)
    );
  }

  fillText(options: FillTextOptions) {
    this.ctx.textAlign = options.textAlign ?? "left";
    this.ctx.textBaseline = options.textBaseline ?? "top";
    this.ctx.font = `${options.fontSize/1.4}px "${options.font}"` + (options.bold ? " bold" : "");

    this.ctx.fillText(
      options.text,
      options.position.x,
      options.position.y,
      options.maxWidth
    );
  }

  // etc
  getImage() {
    return this.canvas.toBuffer();
  }
}
