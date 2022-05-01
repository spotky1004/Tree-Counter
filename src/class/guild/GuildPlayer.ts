import getColorByNumber from "../../util/getColorByNumber.js";
import type App from "../App.js";
import type Guild from "./Guild.js";

export interface GuildPlayerData {
  id: string;
  name: string;
  contributeCount: number;
  playerIdx: number;
  lastCountStemp: number;
  isMod: boolean;
}

export default class GuildPlayer {
  // @ts-ignore
  private app: App;
  // @ts-ignore
  private guild: Guild;
  data: GuildPlayerData;
  lastActive: number;
  color: string;

  constructor(app: App, guild: Guild, data: GuildPlayerData) {
    this.app = app;
    this.guild = guild;
    this.data = data;
    this.lastActive = new Date().getTime();
    this.color = getColorByNumber(this.data.playerIdx);
  }

  count() {
    this.data.contributeCount++;
    this.data.lastCountStemp = new Date().getTime();
    this.lastActive = new Date().getTime();
  }
}
