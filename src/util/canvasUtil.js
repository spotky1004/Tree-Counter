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
 * @typedef {object} bcFillReactOptions
 * @property {string} color
 * @property {Size} size
 * @property {Coordinate} position
 * @property {number} [alpha]
 */
/**
 * @param {bcFillReactOptions} options 
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
