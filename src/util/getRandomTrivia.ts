import type App from "../class/App";
import type { Client } from "discord.js"

interface TriviaOptions {
  app: App;
  client: Client<boolean>;
}

type TriviaItem = (options: TriviaOptions) => string;
const trivias: TriviaItem[] = [
  // Records
  ({ app }) => `Command has been executed ${app.logger.loggingIdx} times so far.`,

  // Current status
  ({ client }) => `Working on ${client.guilds.cache.size} servers!`,
  ({ client }) => `Uptime: ${((client.uptime ?? 0)/3600_000).toFixed(2)}h`,

  // Random
  ({ }) => `This text is being refreshed on every save. (10s)`,
];

export default function getRandomTrivia(options: TriviaOptions) {
  const triviaToDisplay = trivias[Math.floor(trivias.length*Math.random())];
  return triviaToDisplay(options);
} 
