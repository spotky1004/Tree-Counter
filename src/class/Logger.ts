import type App from "./App.js";
import type mongodb from "mongodb";
import type { AnyLogSchema, LogSchemas } from "../typings/LogTypings.js";

type LogCursorDocument<T, U extends object | never> = ({ _id: T } & U)[];
type LogCursorFn<T, U extends object | never> = (count: number) => Promise<LogCursorDocument<T, U> | null>;

type Collection = mongodb.Collection<mongodb.Document>;

export default class Logger {
  app: App;
  collection: Collection;
  loggingIdx: number | null;
  toLog: AnyLogSchema[];

  constructor(app: App, collection: Collection) {
    this.app = app;
    this.collection = collection;
    this.loggingIdx = null;
    this.toLog = [];

    this.setLoggingIdx();
  }

  private async setLoggingIdx() {
    const gotDocument = await this.collection.findOne({ _id: "loggingIdx" });

    if (gotDocument !== null) {
      this.loggingIdx = gotDocument.idx;
    } else {
      this.loggingIdx = 0;
    }
  }

  async save() {
    if (this.loggingIdx === null) return;
    
    for (const cache of this.toLog) {
      let result = await this.saveLog(cache, this.loggingIdx);
      if (result) {
        this.loggingIdx++;
      }
    }
    await this.collection.updateOne(
      { _id: "loggingIdx" },
      { $set: { idx: this.loggingIdx } },
      { upsert: true }
    );
    this.toLog = [];
  }

  private async saveLog(toLog: AnyLogSchema, idx: number | string) {
    if (idx === null) return false;

    await this.collection.updateOne(
      { _id: idx.toString() },
      { $set: toLog },
      { upsert: true }
    );
    return true;
  }

  addLog<T extends keyof LogSchemas>(type: T, toLog: LogSchemas[T]) {
    toLog = {
      ...toLog,
      type,
      time: new Date().getTime()
    };
    this.toLog.push(toLog);
  }

  // @ts-ignore
  private createLogCursor(filter: mongodb.Filter<mongodb.Document>) {
    const findCursor = this.collection.find(filter);
    return async function(count: number) {
      if (!(await findCursor.hasNext())) return null;
      let datas = [];
      for (let i = 0; i < count; i++) {
        const next = await findCursor.next();
        if (next === null) break;
        datas.push(next);
      }
      if (datas.length > 0) {
        return datas;
      } else {
        return null;
      }
    } as unknown as LogCursorFn<string, never>;
  }
}
