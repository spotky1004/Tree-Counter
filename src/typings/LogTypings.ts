export interface CountLogSchema {
  type?: "Count";
  time?: number;
  text: string;
  userId: string;
  guildId: string;
}
export interface ConnectLogSchema {
  type?: "Connect";
  time?: number;
  userId: string;
  guildId: string;
  channelId: string;
}

export interface LogSchemas {
  "Count": CountLogSchema;
  "Connect": ConnectLogSchema;
}
export type AnyLogSchema = LogSchemas[keyof LogSchemas];