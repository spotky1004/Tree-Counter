const unlockableFeaturesEnum = [
    "display-counter", "canvas-stage-1", "display-pixels", "canvas-stage-2", "display-player-status",
    "canvas-stage-3", "display-milestone", "canvas-stage-4", "pixel-color", "expression-count",
    "display-count-messages", "canvas-stage-5", "highlight-player-pixel", "command-milestones", "command-evaluate",
    "extend-player-status", "command-ranking", "reduce-cooldown-1", "pixels-status", "command-serverranking",
    "reduce-cooldown-2", "short-count", "highter-resolution", "canvas-stage-6", "reduce-cooldown-3",
    "prestige??"
];
const milestones = [
    // 0
    {
        countGoal: 0,
        unlockedFeatures: [],
        name: "Start"
    },
    // 1
    {
        countGoal: 25,
        unlockedFeatures: ["display-counter", "canvas-stage-1"],
        name: "Display counter"
    },
    // 2
    {
        countGoal: 75,
        unlockedFeatures: ["display-pixels", "canvas-stage-2"],
        name: "Display pixels"
    },
    // 3
    {
        countGoal: 150,
        unlockedFeatures: ["pixel-color"],
        name: "Pixel color"
    },
    // 4
    {
        countGoal: 250,
        unlockedFeatures: ["display-player-status", "canvas-stage-3"],
        name: "Recent player status"
    },
    // 5
    {
        countGoal: 500,
        unlockedFeatures: ["display-milestone", "canvas-stage-4"],
        name: "Display milestone bar"
    },
    // 6
    {
        countGoal: 750,
        unlockedFeatures: ["expression-count"],
        name: "Can count with expression"
    },
    // 7
    {
        countGoal: 1000,
        unlockedFeatures: ["display-count-messages", "canvas-stage-5"],
        name: "Display recent count messages",
    },
    // 8
    {
        countGoal: 1500,
        unlockedFeatures: ["command-milestones"],
        name: "Unlock /milestones command"
    },
    // 9
    {
        countGoal: 2250,
        unlockedFeatures: ["extend-player-status"],
        name: "Extended recent player status(3 -> 5)"
    },
    // 10
    {
        countGoal: 3500,
        unlockedFeatures: ["command-evaluate"],
        name: "Unlock /evaluate command"
    },
    // 11
    {
        countGoal: 5000,
        unlockedFeatures: ["command-ranking"],
        name: "Unlock /ranking command"
    },
    // 12
    {
        countGoal: 6500,
        unlockedFeatures: ["reduce-cooldown-1"],
        name: "Reduce cooldown by 4s (10s -> 6s)"
    },
    // 13
    {
        countGoal: 8000,
        unlockedFeatures: ["pixels-status"],
        name: "Display pixels status"
    },
    // 14
    {
        countGoal: 10000,
        unlockedFeatures: ["command-serverranking"],
        name: "Unlock /serverranking command"
    },
    // 15
    {
        countGoal: 15000,
        unlockedFeatures: ["reduce-cooldown-2"],
        name: "Reduce cooldown by 3s (6s -> 3s)"
    },
    // 16
    {
        countGoal: 20000,
        unlockedFeatures: ["short-count"],
        name: "Can count with last 3-digits (Except for 100s)"
    },
    // 17
    {
        countGoal: 30000,
        unlockedFeatures: ["highter-resolution", "canvas-stage-6"],
        name: "Highter image resolution (w*2, h*2)"
    },
    // 18
    {
        countGoal: 40000,
        unlockedFeatures: ["prestige??"],
        name: "Soon"
    },
    // 19
    {
        countGoal: 50000,
        unlockedFeatures: ["reduce-cooldown-3"],
        name: "Reduce cooldown by 1.5s (3s -> 1.5s)"
    },
    // 20
    {
        countGoal: 99999999,
        unlockedFeatures: [],
        name: "Overflow"
    },
];
const milestoneCountGoals = [];
const milestoneUnlockedFeatures = [];
const milestoneNames = [];
for (const milestoneItem of milestones) {
    const { countGoal, unlockedFeatures, name } = milestoneItem;
    milestoneCountGoals.push(countGoal);
    milestoneUnlockedFeatures.push(unlockedFeatures);
    milestoneNames.push(name);
}
export function getMilestoneNr(count) {
    let nr = -1;
    for (; nr < milestones.length - 1; nr++) {
        if (count < milestoneCountGoals[nr + 1])
            break;
    }
    return nr;
}
export function getUnlockedFeatures(milestoneNr) {
    const unlocked = [];
    for (let i = 0; i <= milestoneNr; i++) {
        unlocked.push(...milestoneUnlockedFeatures[i]);
    }
    return unlocked;
}
export function getMilestone(milestoneNr) {
    milestoneNr = Math.max(0, Math.min(milestoneNr, milestones.length - 1));
    return milestones[milestoneNr];
}
export function getNextMilestone(count) {
    const milestoneNr = getMilestoneNr(count);
    let milestone;
    if (milestoneNr < milestones.length) {
        milestone = milestones[milestoneNr + 1];
    }
    else {
        milestone = milestones[milestones.length - 1];
    }
    return Object.assign({}, milestone);
}
