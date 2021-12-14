const { EventEmitter } = require("events");
const merge = require("deepmerge");
const { writeFile, readFile, access } = require("fs/promises");
const serialize = require("serialize-javascript");
const lodash = require("lodash");
const {
  defaultMessagesManagerOptions,
  defaultUserOptions,
  defaultConfigOptions,
} = require("./Constants.js");
const Config = require("./Config.js");
const User = require("./User.js");
const { config } = require("process");

class MessagesManager extends EventEmitter {
  constructor(client, options, init = true) {
    super();
    if (!client?.options)
      throw new Error(`Client is a required option. (val=${client})`);
    this.client = client;
    this.ready = false;
    this.users = [];
    this.configs = [];
    this.options = merge(defaultMessagesManagerOptions, options);
    if (init) this._init();
  }

  addMessages(userId, guildId, channelId, amount) {
    return new Promise(async (resolve, reject) => {
      if (!this.ready) {
        return reject("The manager is not ready yet.");
      }
      if (!userId) {
        return reject(`userId is not a valid user. (val=${userId})`);
      }
      if (!guildId) {
        return reject(`guildId is not a valid guild. (val=${guildId})`);
      }
      if (!channelId) {
        return reject(`channelId is not a valid channel. (val=${channelId})`);
      }
      if (!amount) {
        return reject(`amount is not a valid amount. (val=${amount})`);
      }
      let config = this.configs.find((g) => g.guildId === guildId);
      if (!config) {
        config = await this.createConfig(guildId);
      }
      const user = this.users.find(
        (u) => u.guildId === guildId && u.userId === userId
      );
      if (!user) {
        return reject(
          "No user found with Id " +
            userId +
            " in guild with Id" +
            guildId +
            "."
        );
      }
      const oldUser = lodash._.cloneDeep(user);
      let previousMessages;
      user.messages.channels.length <= 0
        ? (previousMessages = {
            channelId: channelId,
            messages: 0,
          })
        : user.messages.channels.find((chn) => chn.channelId === channelId)
        ? (previousMessages = user.messages.channels.find(
            (chn) => chn.channelId === channelId
          ))
        : (previousMessages = {
            channelId: channelId,
            messages: 0,
          });
      let index = user.messages.channels.indexOf(previousMessages);
      previousMessages.messages += amount;
      if (index === -1) user.messages.channels.push(previousMessages);
      else user.messages.channels[index] = previousMessages;
      user.messages.total = user.messages.channels.reduce(function (sum, data) {
        return sum + data.messages;
      }, 0);
      this.emit("userMessagesAdd", oldUser, user);
      if (config.levelingTrackingEnabled) {
        user.levelingData.xp += await config.xpAmountToAdd();
        user.levelingData.level = Math.floor(
          (await config.levelMultiplier()) * Math.sqrt(user.levelingData.xp)
        );
        this.emit("userXpAdd", oldUser, user);
        if (user.levelingData.level > oldUser.levelingData.level) {
          this.emit("userLevelUp", oldUser, user);
        }
      }
      await this.editUser(user.userId, user.guildId, user.data);
      resolve(true);
    });
  }

  subtractMessages(userId, guildId, channelId, amount) {
    return new Promise(async (resolve, reject) => {
      if (!this.ready) {
        return reject("The manager is not ready yet.");
      }
      if (!userId) {
        return reject(`userId is not a valid user. (val=${userId})`);
      }
      if (!guildId) {
        return reject(`guildId is not a valid guild. (val=${guildId})`);
      }
      if (!channelId) {
        return reject(`channelId is not a valid channel. (val=${channelId})`);
      }
      if (!amount) {
        return reject(`amount is not a valid amount. (val=${amount})`);
      }
      const user = this.users.find(
        (u) => u.guildId === guildId && u.userId === userId
      );
      if (!user) {
        return reject(
          "No user found with Id " +
            userId +
            " in guild with Id" +
            guildId +
            "."
        );
      }
      const oldUser = lodash._.cloneDeep(user);

      let previousMessages;
      user.messages.channels.length <= 0
        ? (previousMessages = {
            channelId: channelId,
            messages: 0,
          })
        : user.messages.channels.find((chn) => chn.channelId === channelId)
        ? (previousMessages = user.messages.channels.find(
            (chn) => chn.channelId === channelId
          ))
        : (previousMessages = {
            channelId: channelId,
            messages: 0,
          });
      let index = user.messages.channels.indexOf(previousMessages);
      previousMessages.messages -= amount;
      if (index === -1) user.messages.channels.push(previousMessages);
      else user.messages.channels[index] = previousMessages;
      this.emit("userMessagesSubtract", oldUser, user);
      await this.editUser(user.userId, user.guildId, user.data);
      resolve(true);
    });
  }

  createUser(userId, guildId, options) {
    return new Promise(async (resolve, reject) => {
      if (!this.ready) {
        return reject("The manager is not ready yet.");
      }
      options =
        options && typeof options === "object"
          ? merge(defaultUserOptions, options)
          : defaultUserOptions;
      if (!userId) {
        return reject(`userId is not a valid user. (val=${userId})`);
      }
      if (!guildId) {
        return reject(`guildId is not a valid guild. (val=${guildId})`);
      }
      const user = new User(this, {
        userId: userId,
        guildId: guildId,
        data: options,
      });
      this.users.push(user);
      await this.saveUser(userId, guildId, user.data);
      resolve(user);
    });
  }

  createConfig(guildId, options) {
    return new Promise(async (resolve, reject) => {
      if (!this.ready) {
        return reject("The manager is not ready yet.");
      }
      options =
        options && typeof options === "object"
          ? merge(defaultConfigOptions, options)
          : defaultConfigOptions;
      if (!guildId) {
        return reject(`guildId is not a valid guild. (val=${guildId})`);
      }
      const config = new Config(this, {
        guildId: guildId,
        data: options,
      });
      this.configs.push(config);
      await this.saveConfig(guildId, config.data);
      resolve(config);
    });
  }

  removeUser(userId, guildId) {
    return new Promise(async (resolve, reject) => {
      const user = this.users.find(
        (u) => u.guildId === guildId && u.userId === userId
      );
      if (!user) {
        return reject(
          "No user found with Id " +
            userId +
            " in guild with Id" +
            guildId +
            "."
        );
      }
      this.users = this.users.filter(
        (d) =>
          d !==
          {
            userId: userId,
            guildId: guildId,
            data: user.data.data,
          }
      );
      await this.deleteUser(userId, guildId);
      resolve();
    });
  }

  removeConfig(guildId) {
    return new Promise(async (resolve, reject) => {
      const config = this.configs.find((c) => c.guildId === guildId);
      if (!config) {
        return reject("No config found for guild with Id " + guildId + ".");
      }
      this.configs = this.configs.filter((c) => c.guildId !== guildId);
      await this.deleteConfig(guildId);
      resolve();
    });
  }

  updateUser(userId, guildId, options = {}) {
    return new Promise(async (resolve, reject) => {
      const user = this.users.find(
        (u) => u.guildId === guildId && u.userId === userId
      );
      if (!user) {
        return reject(
          "No user found with Id " +
            userId +
            " in guild with Id" +
            guildId +
            "."
        );
      }
      user.edit(options).then(resolve).catch(reject);
    });
  }

  updateConfig(guildId, options = {}) {
    return new Promise(async (resolve, reject) => {
      const config = this.configs.find((c) => c.guildId === guildId);
      if (!config) {
        return reject("No config found for guild with Id " + guildId + ".");
      }
      config.edit(options).then(resolve).catch(reject);
    });
  }

  async deleteUser(userId, guildId) {
    await writeFile(
      this.options.userStorage,
      JSON.stringify(
        this.users.map((user) => user.data),
        (_, v) => (typeof v === "bigint" ? serialize(v) : v)
      ),
      "utf-8"
    );
    this.refreshUserStorage();
    return;
  }

  async deleteConfig(guildId) {
    await writeFile(
      this.options.configStorage,
      JSON.stringify(
        this.configs.map((config) => config.data),
        (_, v) => (typeof v === "bigint" ? serialize(v) : v)
      ),
      "utf-8"
    );
    this.refreshConfigStorage();
    return;
  }

  async refreshUserStorage() {
    return true;
  }

  async refreshConfigStorage() {
    return true;
  }

  async editUser(_userId, _guildId, _userData) {
    await writeFile(
      this.options.userStorage,
      JSON.stringify(
        this.users.map((user) => user.data),
        (_, v) => (typeof v === "bigint" ? serialize(v) : v)
      ),
      "utf-8"
    );
    this.refreshUserStorage();
    return;
  }

  async editConfig(_guildId, _configData) {
    await writeFile(
      this.options.configStorage,
      JSON.stringify(
        this.configs.map((config) => config.data),
        (_, v) => (typeof v === "bigint" ? serialize(v) : v)
      ),
      "utf-8"
    );
    this.refreshConfigStorage();
    return;
  }

  async saveUser(userId, guildId, userData) {
    await writeFile(
      this.options.userStorage,
      JSON.stringify(
        this.users.map((user) => user.data),
        (_, v) => (typeof v === "bigint" ? serialize(v) : v)
      ),
      "utf-8"
    );
    this.refreshUserStorage();
    return;
  }

  async saveConfig(guildId, configData) {
    await writeFile(
      this.options.configStorage,
      JSON.stringify(
        this.configs.map((config) => config.data),
        (_, v) => (typeof v === "bigint" ? serialize(v) : v)
      ),
      "utf-8"
    );
    this.refreshConfigStorage();
    return;
  }

  async getAllUsers() {
    const storageExists = await access(this.options.userStorage)
      .then(() => true)
      .catch(() => false);
    if (!storageExists) {
      await writeFile(this.options.userStorage, "[]", "utf-8");
      return [];
    } else {
      const storageContent = await readFile(this.options.userStorage, (_, v) =>
        typeof v === "string" && /BigInt\("(-?\d+)"\)/.test(v) ? eval(v) : v
      );
      try {
        const users = await JSON.parse(storageContent.toString());
        if (Array.isArray(users)) {
          return users;
        } else {
          console.log(storageContent, users);
          throw new SyntaxError(
            "The storage file is not properly formatted (users is not an array)."
          );
        }
      } catch (err) {
        if (err.message === "Unexpected end of JSON input") {
          throw new SyntaxError(
            "The storage file is not properly formatted (Unexpected end of JSON input)."
          );
        } else throw err;
      }
    }
  }

  async getAllConfigs() {
    const storageExists = await access(this.options.configStorage)
      .then(() => true)
      .catch(() => false);
    if (!storageExists) {
      await writeFile(this.options.configStorage, "[]", "utf-8");
      return [];
    } else {
      const storageContent = await readFile(
        this.options.configStorage,
        (_, v) =>
          typeof v === "string" && /BigInt\("(-?\d+)"\)/.test(v) ? eval(v) : v
      );
      try {
        const configs = await JSON.parse(storageContent.toString());
        if (Array.isArray(configs)) {
          return configs;
        } else {
          console.log(storageContent, configs);
          throw new SyntaxError(
            "The storage file is not properly formatted (configs is not an array)."
          );
        }
      } catch (err) {
        if (err.message === "Unexpected end of JSON input") {
          throw new SyntaxError(
            "The storage file is not properly formatted (Unexpected end of JSON input)."
          );
        } else throw err;
      }
    }
  }

  async _handleMessage(message) {
    if (!this.users.find((u) => u.userId === message.member.id)) {
      let config = this.configs.find(
        (g) => g.guildId === message.member.guild.id
      );
      if (!config) {
        config = await this.createConfig(message.member.guild.id);
      }
      if (
        !(
          (await config.checkMember(message.member)) &&
          (await config.checkChannel(message.channel)) &&
          (await config.checkMessage(message.content))
        )
      )
        return;
      else {
        await this.createUser(message.member.id, message.member.guild.id);
        return await this.addMessages(
          message.member.id,
          message.member.guild.id,
          message.channel.id,
          await config.messagesToAdd()
        );
      }
    } else {
      let config = this.configs.find(
        (g) => g.guildId === message.member.guild.id
      );
      if (!config) {
        config = await this.createConfig(message.member.guild.id);
      }
      if (
        !(
          (await config.checkMember(message.member)) &&
          (await config.checkChannel(message.channel)) &&
          (await config.checkMessage(message.content))
        )
      )
        return;
      else
        return await this.addMessages(
          message.member.id,
          message.member.guild.id,
          message.channel.id,
          await config.messagesToAdd()
        );
    }
  }

  async _init() {
    const rawUsers = await this.getAllUsers();
    rawUsers.forEach((user) => {
      this.users.push(new User(this, user));
    });
    const rawConfig = await this.getAllConfigs();
    rawConfig.forEach((config) => {
      this.configs.push(new Config(this, config));
    });
    this.ready = true;
    this.client.on("messageCreate", (message) => this._handleMessage(message));
  }
}

module.exports = MessagesManager;
