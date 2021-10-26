import Canvas from 'canvas';
import * as cUtil from '../util/canvasUtil.js';



function getCanvasPosition(x, y) {
  return {
    x: canvasWidth * x,
    y: canvasHeight * y
  }
}



const canvasHeight = 600/0.75;
const canvasWidth = canvasHeight*1.5;

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
const CONTAINER_SIZES = {
  counter: {width: 1, height: 0.2},
  blockBoard: {width: 0.75/(canvasWidth/canvasHeight), height: 0.75},
  userStats: {width: 1-(0.75/(canvasWidth/canvasHeight)), height: 0.75}
};
console.log(CONTAINER_SIZES, canvasHeight, canvasWidth, canvasWidth*CONTAINER_SIZES.blockBoard.width, canvasHeight*0.75);

const computedContainerSizes = {};
/** @type {Record<keyof typeof CONTAINER_SIZES, Coordinate>} */
const computedContainerPositions = {};
let curPos = {x: 0, y: 0};
for (const partName in CONTAINER_SIZES) {
  let size = {
    width: canvasWidth * CONTAINER_SIZES[partName].width,
    height: canvasHeight * CONTAINER_SIZES[partName].height
  };
  computedContainerSizes[partName] = {...size};
  computedContainerPositions[partName] = {...curPos};
  curPos.x += Math.ceil(size.width);
  if (curPos.x >= canvasWidth) {
    curPos.x = 0;
    curPos.y += Math.ceil(size.height);
  }
}

/**
 * @typedef {object} ContainerData
 * @property {Size} size
 * @property {Coordinate} position
 */
/** @type {Record<keyof typeof CONTAINER_SIZES, ContainerData>} */
const containerDatas = {};
for (const partName in CONTAINER_SIZES) {
  containerDatas[partName] = {
    size: computedContainerSizes[partName],
    position: computedContainerPositions[partName]
  }
}



/**
 * @param {import("./saveload.js").GuildSavedata} guildData 
 */
function drawCanvas(guildData) {
  // Init canvas
  const canvas = Canvas.createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext('2d');
  /** @type {ContainerData!} */
  let cData = null; // ContainerData

  // Draw Counter
  cData = containerDatas.counter;
  cUtil.drawRect(ctx, {
    color: "#111",
    position: cData.position,
    size: cData.size
  });

  // Draw blocks
  cData = containerDatas.blockBoard;
  const blockSize = cData.size.width / guildData.boardSize;
  for (let y = 0; y < guildData.boardSize; y++) {
    const posY = cData.position.y + cData.size.height * y / guildData.boardSize;
    for (let x = 0; x < guildData.boardSize; x++) {
      const idx = x + y * guildData.boardSize;
      const posX = cData.position.x + cData.size.width * x / guildData.boardSize;
      const paletteIdx = guildData.blockAuthors[idx] ?? -1;
      let paletteColor;
      if (paletteIdx !== -1) {
        // 0 ~ 330 deg, 15 ~ 345 deg
        paletteColor = `hsl(${(30*(paletteIdx%12) + 15*(Math.floor(paletteIdx/12)%2))%360}, 82%, 56%)`;
      } else {
        paletteColor = "#000";
      }
      cUtil.drawRect(ctx, {
        color: paletteColor,
        position: {x: posX, y: posY},
        size: {width: blockSize, height: blockSize}
      });

      if ((x+y)%2 === 1) {
        cUtil.drawRect(ctx, {
          color: "#fff",
          alpha: 0.08,
          position: {x: posX, y: posY},
          size: {width: blockSize, height: blockSize}
        });
      }
    }
  }

  // Draw Side
  cData = containerDatas.userStats;
  cUtil.drawRect(ctx, {
    color: "#111",
    position: cData.position,
    size: cData.size
  });
  
  return canvas;
}

export default drawCanvas;
