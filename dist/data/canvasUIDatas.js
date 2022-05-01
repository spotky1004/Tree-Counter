const uiNamesEnum = {
    "counter": 0,
    "milestone": 1,
    "pixels": 2,
    "playerStatus": 3,
    "countMessages": 4,
};
const getUIRatioFunctions = [
    // Stage 0: nothing
    () => ({
        milestone: null,
        counter: null,
        pixels: null,
        playerStatus: null,
        countMessages: null,
    }),
    // Stage 1: "counter"
    () => ({
        milestone: null,
        counter: { x: 0, y: 0, width: 1, height: 1 },
        pixels: null,
        playerStatus: null,
        countMessages: null,
    }),
    // Stage 2: "counter" | "pixels"
    (aspectRatio) => ({
        milestone: null,
        counter: { x: 0, y: 0, width: 1, height: 1 - 1 / aspectRatio },
        pixels: { x: 0, y: 1 - 1 / aspectRatio, width: 1, height: 1 / aspectRatio },
        playerStatus: null,
        countMessages: null,
    }),
    // Stage 3: "counter" | "pixels" | "playerStatus"
    (aspectRatio) => ({
        milestone: null,
        counter: { x: 0, y: 0, width: 1, height: 0.2 },
        pixels: { x: 0, y: 0.2, width: 0.8 / aspectRatio, height: 0.8 },
        playerStatus: { x: 0.8 / aspectRatio, y: 0.2, width: 1 - 0.8 / aspectRatio, height: 0.8 },
        countMessages: null,
    }),
    // Stage 4: "milestone" | "counter" | "pixels" | "playerStatus"
    (aspectRatio) => ({
        milestone: { x: 0, y: 0, width: 1, height: 0.03 },
        counter: { x: 0, y: 0.03, width: 1, height: 0.17 },
        pixels: { x: 0, y: 0.2, width: 0.8 / aspectRatio, height: 0.8 },
        playerStatus: { x: 0.8 / aspectRatio, y: 0.2, width: 1 - 0.8 / aspectRatio, height: 0.8 },
        countMessages: null,
    }),
    // Stage 5: "milestone" | "counter" | "pixels" | "playerStatus" | "countMessages"
    (aspectRatio) => ({
        milestone: { x: 0, y: 0, width: 1, height: 0.04 },
        counter: { x: 0, y: 0.04, width: 1, height: 0.21 },
        pixels: { x: 0, y: 0.25, width: 0.75 / aspectRatio, height: 0.75 },
        playerStatus: { x: 0.75 / aspectRatio, y: 0.25, width: (1 - 0.75 / aspectRatio) * 2 / 5, height: 0.75 },
        countMessages: { x: 0.75 / aspectRatio + (1 - 0.75 / aspectRatio) * 2 / 5, y: 0.25, width: (1 - 0.75 / aspectRatio) * 3 / 5, height: 0.75 },
    }),
    // Stage 6: "milestone" | "counter" | "pixels" | "playerStatus" | "countMessages"
    (aspectRatio) => ({
        milestone: { x: 0, y: 0, width: 1, height: 0.04 },
        counter: { x: 0, y: 0.04, width: 1, height: 0.21 },
        pixels: { x: 0, y: 0.25, width: 0.75 / aspectRatio, height: 0.75 },
        playerStatus: { x: 0.75 / aspectRatio, y: 0.25, width: (1 - 0.75 / aspectRatio) * 2 / 5, height: 0.75 },
        countMessages: { x: 0.75 / aspectRatio + (1 - 0.75 / aspectRatio) * 2 / 5, y: 0.25, width: (1 - 0.75 / aspectRatio) * 3 / 5, height: 0.75 },
    }),
];
const canvasSizes = [
    // Stage 0
    {
        width: 0,
        height: 0
    },
    // Stage 1
    {
        width: 1200,
        height: 150,
    },
    // Stage 2
    {
        width: 600,
        height: 700
    },
    // Stage 3
    {
        width: 1200,
        height: 800
    },
    // Stage 4
    {
        width: 1200,
        height: 830
    },
    // Stage 5
    {
        width: 1450,
        height: 800
    },
    // Stage 6
    {
        width: 2900,
        height: 1600
    }
];
export function getCanvasStage(guildCache) {
    if (guildCache.hasFeature("canvas-stage-6")) {
        return 6;
    }
    else if (guildCache.hasFeature("canvas-stage-5")) {
        return 5;
    }
    else if (guildCache.hasFeature("canvas-stage-4")) {
        return 4;
    }
    else if (guildCache.hasFeature("canvas-stage-3")) {
        return 3;
    }
    else if (guildCache.hasFeature("canvas-stage-2")) {
        return 2;
    }
    else if (guildCache.hasFeature("canvas-stage-1")) {
        return 1;
    }
    return 0;
}
export function getCanvasSize(stage) {
    const canvasSize = canvasSizes[stage];
    if (typeof canvasSize === "undefined")
        throw new Error("Invaild stage!");
    return canvasSize;
}
export function getUIDatas(size, stage) {
    const getUIRatioFunction = getUIRatioFunctions[stage];
    if (typeof getUIRatioFunction === "undefined")
        throw new Error("Invaild stage!");
    const aspectRatio = Math.max(size.width / size.height, size.height / size.width);
    const uiRatio = getUIRatioFunction(aspectRatio);
    const uiDatas = {};
    let uiName;
    for (uiName in uiNamesEnum) {
        let uiData = uiRatio[uiName];
        if (uiData !== null) {
            uiData = Object.assign({}, uiData);
            uiData.x *= size.width;
            uiData.y *= size.height;
            uiData.width *= size.width;
            uiData.height *= size.height;
        }
        uiDatas[uiName] = uiData;
    }
    return uiDatas;
}
