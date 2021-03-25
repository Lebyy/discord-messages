<p align="center"><a href="https://nodei.co/npm/discord-messages/"><img src="https://nodei.co/npm/discord-messages.png"></a></p>
<p align="center"><img src="https://img.shields.io/npm/v/discord-messages"> <img src="https://img.shields.io/github/repo-size/Lebyy/discord-messages"> <img src="https://img.shields.io/npm/l/discord-messages"> <img src="https://img.shields.io/github/contributors/Lebyy/discord-messages"> <img src="https://img.shields.io/github/package-json/dependency-version/Lebyy/discord-messages/mongoose"> <a href="https://discord.gg/pndumb6J3t"><img src="https://discordapp.com/api/guilds/815261972450115585/widget.png" alt="Discord server - https://discord.gg/pndumb6J3t"/></a> <a href="https://discord-messages.js.org"><img src="https://img.shields.io/badge/Documentation-Click%20here-blue" alt="Documentation - https://discord-messages.js.org"/></a></p>

# Discord-Messages
- A lightweight and easy to use messages framework for discord bots, uses MongoDB.
- If you need help feel free to join our <a href="https://discord.gg/pndumb6J3t">discord server</a> to talk and help you with your code.
- If you encounter any of those fell free to open an issue in our <a href="https://github.com/Lebyy/discord-messages/issues">github repository</a>.
- TypeScript supported!

# Download & Update
You can download it from npm:
```cli
npm i discord-messages
```
You can update to a newer version to receive updates using npm.
```cli
npm update discord-messages
```

# Setting Up
First things first, we include the module into the project.
```js
const Messages = require("discord-messages");
```
After that, you need to provide a valid mongo database url, and set it. You can do so by:
```js
Messages.setURL("mongodb://..."); // You only need to do this ONCE per process.
```

# Examples
*Examples assume that you have setted up the module as presented in 'Setting Up' section.*
*Following examples assume that your `Discord.Client` is called `client`.*

*Following examples assume that your `client.on("message", message` is called `message`.*

*Following example contains isolated code which you need to integrate in your own command handler.*

*Following example assumes that you are able to write asynchronous code (use `await`).*

- **Adding a message to user's database for each Message sent**

```js
client.on("message", async (message) => {
  if (!message.guild) return;
  if (message.author.bot) return;

  const AddMessage = await Messages.appendMessage(message.author.id, message.guild.id, 1);
});
```
- **Rank Command**

```js
const target = message.mentions.users.first() || message.author; // Grab the target.

const user = await Messages.fetch(target.id, message.guild.id); // Selects the target from the database.

if (!user) return message.channel.send("Seems like this user does not any messages so far..."); // If there isnt such user in the database, we send a message in general.

message.channel.send(`> **${target.tag}** currently has ${user.data.messages} message(s).`); // We show the message(s) count.
```

- **Leaderboard Command**

```js
const rawLeaderboard = await Messages.fetchLeaderboard(message.guild.id, 10); // We grab top 10 users with most message(s) in the current server.

if (rawLeaderboard.length < 1) return reply("Nobody's in leaderboard yet.");

const leaderboard = await Messages.computeLeaderboard(client, rawLeaderboard, true); // We process the leaderboard.

const lb = leaderboard.map(e => `${e.position}. ${e.username}#${e.discriminator}\nMessages Count: ${e.messages}`); // We map the outputs.

message.channel.send(`**Leaderboard**:\n\n${lb.join("\n\n")}`);
```

*Is time for you to get creative..*

# Methods
**createUser**

Creates an entry in database for that user if it doesnt exist.
```js
Messages.createUser(<UserID - String>, <GuildID - String>);
```
- Output:
```
Promise<Object>
```
**deleteUser**

If the entry exists, it deletes it from database.
```js
Messages.deleteUser(<UserID - String>, <GuildID - String>);
```
- Output:
```
Promise<Object>
```
**appendMessage**

It adds a specified amount of messages to the current amount of messages for that user, in that guild. It creates a new user with that amount of messages, if there is no entry for that user. 
```js
Messages.appendMessage(<UserID - String>, <GuildID - String>, <Amount - Integer>);
```
- Output:
```
Promise<Boolean>
```
**setMessage**

It sets the messages to a specified amount and re-calculates the level.
```js
Messages.setMessages(<UserID - String>, <GuildID - String>, <Amount - Integer>);
```
- Output:
```
Promise<Boolean/Object>
```
**fetch**

Retrives selected entry from the database, if it exists.
```js
Messages.fetch(<UserID - String>, <GuildID - String>, <FetchPosition - Boolean>);
```
- Output:
```
Promise<Object>
```
**subtractMessages**

It removes a specified amount of messages to the current amount of messages for that user, in that guild.
```js
Messages.subtractMessages(<UserID - String>, <GuildID - String>, <Amount - Integer>);
```
- Output:
```
Promise<Boolean/Object>
```
**resetGuild**

It deletes the entire guild's data.
```js
Messages.resetGuild(<GuildID - String>);
```
- Output:
```
Promise<Boolean/Object>
```
**fetchLeaderboard**

It gets a specified amount of entries from the database, ordered from higgest to lowest within the specified limit of entries.
```js
Messages.fetchLeaderboard(<GuildID - String>, <Limit - Integer>);
```
- Output:
```
Promise<Array [Objects]>
```
**computeLeaderboard**

It returns a new array of object that include messages, guild id, user id, leaderboard position, username and discriminator.
```js
Messages.computeLeaderboard(<Client - Discord.js Client>, <Leaderboard - fetchLeaderboard output>, <fetchUsers - boolean, disabled by default>);
```
- Output:
```
Promise<Array [Objects]>
```

# Enjoying Discord-Messages?
Consider donating: https://www.buymeacoffee.com/lebyydev
Thanks 😊

# Credits
- [Discord-XP](https://github.com/MrAugu/discord-xp) Discord-Messages wouldn't exist without them! Consider to check out Discord-XP package aswell and star the repo!
