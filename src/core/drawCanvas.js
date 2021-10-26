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


function getPaletteColor(idx) {
  if (idx !== -1) {
    // 0 ~ 330 deg, 15 ~ 345 deg
    return`hsl(${(30*(idx%12) + 15*(Math.floor(idx/12)%2))%360}, 82%, 56%)`;
  } else {
    return "#000";
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
  let colorCounter = new Array(guildData.blockAuthors.length).fill(0);

  // Draw Counter
  cData = containerDatas.counter;
  cUtil.drawRect(ctx, {
    color: "#222",
    position: cData.position,
    size: cData.size
  });
  let conutAlpha = 0.5;
  const countToDisplay = (guildData.count+"").padStart(8, "0");
  for (let i = 0; i < 8; i++) {
    const txt = countToDisplay[i];
    if (txt !== "0") conutAlpha = 1;
    cUtil.drawText(ctx, {
      color: "#fff",
      fontSize: cData.size.height,
      alpha: conutAlpha,
      position: {
        x: cData.size.width*(0.15 + 0.7*(i/8)),
        y: cData.position.y
      },
      text: txt,
      maxWidth: cData.size.width,
      bold: true
    });
  }


  // Draw blocks
  cData = containerDatas.blockBoard;
  const blockSize = cData.size.width / guildData.boardSize;
  for (let y = 0; y < guildData.boardSize; y++) {
    const posY = cData.position.y + cData.size.height * y / guildData.boardSize;
    for (let x = 0; x < guildData.boardSize; x++) {
      const idx = x + y * guildData.boardSize;
      const posX = cData.position.x + cData.size.width * x / guildData.boardSize;
      const paletteIdx = guildData.blockAuthors[idx] ?? -1;
      colorCounter[paletteIdx]++;
      cUtil.drawRect(ctx, {
        color: getPaletteColor(paletteIdx),
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

  // Draw Stats
  cData = containerDatas.userStats;
  cUtil.drawRect(ctx, {
    color: "#222",
    position: cData.position,
    size: cData.size
  });
  for (let i = 0; i < guildData.countMemberCache.length; i++) {
    const data = guildData.countMemberCache[i];
    const paletteIdx = guildData.blockPalette.findIndex(e => e === data.id);

    const width = cData.size.width * 0.8;
    const height = cData.size.height / 5;
    const posX = cData.position.x + cData.size.width * 0.1;
    const posY = cData.position.y + cData.size.height * (1 * (i / 5));

    // Palette color
    cUtil.drawRect(ctx, {
      color: getPaletteColor(paletteIdx),
      size: {
        width: width/40,
        height: height
      },
      position: {x: posX - width/30, y: posY}
    })

    // Nickname
    cUtil.drawText(ctx, {
      text: data.name,
      color: data.color,
      bold: true,
      fontSize: height/5,
      maxWidth: width,
      position: {x: posX, y: posY},
    });

    // Count
    cUtil.drawText(ctx, {
      text: colorCounter[paletteIdx],
      color: "#ddd",
      bold: true,
      fontSize: height/5*4,
      maxWidth: width,
      position: {x: posX, y: posY + height/5},
    });
  }

  
  return canvas;
}

export default drawCanvas;
