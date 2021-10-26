import fs from "fs";

const USER_DEFAULT_SAVE = {
  totalCount: 0,
  level: 1,
  exp: 0
};
const GUILD_DEFAULT_SAVE = {
  countingChannelId: null,
  count: 0,
  boardSize: 1,
  blockAuthors: [],
  blockPalette: [],
  lastCount: {
    userId: null,
    timestemp: null
  }
};
const DEFAULT_SAVE = {
  "USER": USER_DEFAULT_SAVE,
  "GUILD": GUILD_DEFAULT_SAVE
};
Object.freeze(DEFAULT_SAVE);

/**
 * @typedef {DEFAULT_SAVE} Savedata 
 * @typedef {USER_DEFAULT_SAVE} UserSavedata
 * @typedef {GUILD_DEFAULT_SAVE} GuildSavedata
 */

/**
 * @param {string} id
 * @param {Savedata} savedata
 */
export function save(id, savedata) {
  fs.writeFileSync(`./saveData/${id}.json`, JSON.stringify(savedata), (err) => {if (err) throw err;})
}

/**
 * @param {T} type
 * @param {string} id 
 * @returns {Savedata[T]}
 * @template {keyof typeof Savedata} T
 */
export function load(type, id) {
  const SAVEDATA_PATH = `./saveData/${id}.json`;
  const saveExists = fs.existsSync(SAVEDATA_PATH);

  /** @type {Savedata[T]} */
  let savedata;
  if (saveExists) {
    savedata = JSON.parse(fs.readFileSync(SAVEDATA_PATH));
  } else {
    savedata = {};
  }
  savedata = mergeObject(savedata, DEFAULT_SAVE[type]);
  return savedata;
}



function mergeObject(target, source) {
  target = target ?? {};
  for (const i in source) {
    if (Array.isArray(source[i])) {
      target[i] = target[i] ?? [];
      mergeArray(target[i], source[i]);
    } else if (source[i] === null) {
      target[i] = target[i] ?? source[i];
    } else if (typeof source[i] === "object") {
      target[i] = mergeObject(target[i], source[i]);
    } else {
      target[i] = source[i].constructor(target[i] ?? source[i]);
    }
  }
  return target;
}
function mergeArray(target, source) {
  for (let i = 0, l = source.length; i < l; i++) {
    if (Array.isArray(source[i])) {
      mergeArray(target[i], source[i]);
    } else if (source[i] === null) {
      target[i] = target[i] ?? source[i];
    } else if (typeof source[i] === "object") {
      target[i] = mergeObject(target[i], source[i]);
    } else {
      target[i] = source[i].constructor(target[i] ?? source[i]);
    }
  }
  return target;
}
