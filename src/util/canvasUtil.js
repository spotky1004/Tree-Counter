import Canvas from "canvas";
Canvas.registerFont("./src/font/SpaceMono-Regular.ttf", {family: "SpaceMono"});
Canvas.registerFont("./src/font/SourceHanSansHWK-VF.ttf", {family: "SourceHanSansHWK-VF"});

/**
 * @typedef {object} Coordinate
 * @property {number} x
 * @property {number} y
 */
/**
 * @typedef {object} Size
 * @property {number} width
 * @property {number} height
 */

export function resetCanvasSetting(ctx) {
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
}

/**
 * @typedef {object} DrawRectOptions
 * @property {string} color
 * @property {Size} size
 * @property {Coordinate} position
 * @property {number} [alpha]
 */
/**
 * @param {Canvas.CanvasRenderingContext2D} ctx
 * @param {DrawRectOptions} options 
 */
export function drawRect(ctx, options) {
  resetCanvasSetting(ctx);
  ctx.fillStyle = options.color;
  ctx.globalAlpha = options.alpha ?? 1;
  ctx.fillRect(
    Math.ceil(options.position.x),
    Math.ceil(options.position.y),
    Math.ceil(options.size.width),
    Math.ceil(options.size.height)
  );
}

/**
 * @typedef {object} DrawTextOptions
 * @property {string} text
 * @property {string} color
 * @property {number} fontSize
 * @property {number} [maxWidth]
 * @property {Coordinate} position
 * @property {boolean} [bold]
 * @property {boolean} [useGlobalFont]
 * @property {number} [alpha]
 */
/**
 * @param {Canvas.CanvasRenderingContext2D} ctx
 * @param {DrawTextOptions} options 
 */
export function drawText(ctx, options) {
  resetCanvasSetting(ctx);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  ctx.fillStyle = options.color;
  ctx.globalAlpha = options.alpha ?? 1;
  ctx.font = `${options.fontSize/1.4}px "${options.useGlobalFont ? "SourceHanSansHWK-VF" : "SpaceMono"}"` + (options.bold ? " bold" : "");

  ctx.fillText(
    options.text,
    options.position.x,
    options.position.y,
    options.maxWidth
  )
}
