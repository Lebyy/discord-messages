const Discord = require("discord.js");
const serialize = require("serialize-javascript");
const { EventEmitter } = require("events");
const {} = require("./Constants.js");
const MessagesManager = require("./Manager.js");
class User extends EventEmitter {
  constructor(manager, options) {
    super();
    this.manager = manager;
    this.client = manager.client;
    this.userId = options.userId;
    this.guildId = options.guildId;
    this.messages = options.data.messages;
    this.levelingData = options.data.levelingData;
    this.options = options.data;
  }

  get guild() {
    return this.client.guilds.cache.get(this.guildId);
  }

  get user() {
    return this.client.users.cache.get(this.userId);
  }

  get data() {
    const baseData = {
      userId: this.userId,
      guildId: this.guildId,
      data: {
        messages: this.messages,
        levelingData: this.levelingData,
      },
    };
    return baseData;
  }

  edit(options = {}) {
    return new Promise(async (resolve, reject) => {
      if (
        typeof options.newMessages === "object" &&
        Array.isArray(options.newMessages.channels) &&
        Number.isInteger(options.newMessages.total)
      )
        this.messages = options.newMessages;
      if (
        typeof options.newLevelingData === "object" &&
        Number.isInteger(options.newLevelingData.xp) &&
        Number.isInteger(options.newLevelingData.level)
      )
        this.levelingData = options.newLevelingData;
      await this.manager.editUser(this.userId, this.guildId, this.data);
      resolve(this);
    });
  }
}
module.exports = User;
