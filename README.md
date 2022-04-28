# Spotkys Discord Bot Template
* This repository was created to make it easier to build my own bots
* This project uses "mongodb" module (with MongoDB Cloud)

## Features
* Caches [Guild](https://github.com/spotky1004/spotkys-discord-bot-template/blob/main/src/class/GuildCaches.ts) and [Users](https://github.com/spotky1004/spotkys-discord-bot-template/blob/main/src/class/User.ts) data to manage easily
* Easy to get Slahs Command parameters with [getSlashParams](https://github.com/spotky1004/spotkys-discord-bot-template/blob/main/src/util/getSlashParams.ts) util function
* [Easy to handle Slash Command](https://github.com/spotky1004/spotkys-discord-bot-template/blob/main/src/commands/common/connectchannel.ts)
* [Easy to add random trivia](https://github.com/spotky1004/spotkys-discord-bot-template/blob/main/src/util/getRandomTrivia.ts)
* Has [Logger](https://github.com/spotky1004/spotkys-discord-bot-template/blob/main/src/class/Logger.ts)
* [Separated common/mod commands](https://github.com/spotky1004/spotkys-discord-bot-template/tree/main/src/commands)

## More things
* Can add Logger types [here](https://github.com/spotky1004/spotkys-discord-bot-template/blob/main/src/typings/LogTypings.ts)
* Create .env.development and .env.production with [sample](https://github.com/spotky1004/spotkys-discord-bot-template/blob/main/env/.env.sample)
* Start bot with `npm run start-dev` and `npm run start` to run in development env and production env, respectively
* Add command names [command name enum](https://github.com/spotky1004/spotkys-discord-bot-template/blob/main/src/commands/index.ts) to make it work