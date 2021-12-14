const { TextChannel } = require("discord.js");
const serialize = require("serialize-javascript");
const lodash = require("lodash");
const { EventEmitter } = require("events");
const {} = require("./Constants.js");
const MessagesManager = require("./Manager.js");
class Config extends EventEmitter {
  constructor(manager, options) {
    super();
    this.manager = manager;
    this.guildId = options.guildId;
    this.options = options.data;
  }

  get trackBots() {
    return this.options.trackBots || this.manager.options.default.trackBots;
  }

  get trackAllChannels() {
    return (
      this.options.trackAllChannels ||
      this.manager.options.default.trackAllChannels
    );
  }

  get channelIds() {
    return this.options.channelIds || this.manager.options.default.channelIds;
  }

  get minXpToTrack() {
    return (
      this.options.minXpToTrack || this.manager.options.default.minXpToTrack
    );
  }

  get minLevelToTrack() {
    return (
      this.options.minLevelToTrack ||
      this.manager.options.default.minLevelToTrack
    );
  }

  get maxXpToTrack() {
    return (
      this.options.maxXpToTrack || this.manager.options.default.maxXpToTrack
    );
  }

  get maxLevelToTrack() {
    return (
      this.options.maxLevelToTrack ||
      this.manager.options.default.maxLevelToTrack
    );
  }

  get messagesTrackingEnabled() {
    return (
      this.options.messagesTrackingEnabled ||
      this.manager.options.default.messagesTrackingEnabled
    );
  }

  get levelingTrackingEnabled() {
    return (
      this.options.levelingTrackingEnabled ||
      this.manager.options.default.levelingTrackingEnabled
    );
  }

  get data() {
    const baseData = {
      guildId: this.guildId,
      data: {
        trackBots: this.options.trackBots,
        trackAllChannels: this.options.trackAllChannels,
        exemptChannels:
          !this.options.exemptChannels ||
          typeof this.options.exemptChannels === "string"
            ? this.options.exemptChannels
            : serialize(this.options.exemptChannels),
        checkMessage:
          !this.options.checkMessage ||
          typeof this.options.checkMessage === "string"
            ? this.options.checkMessage
            : serialize(this.options.checkMessage),
        channelIds: this.options.channelIds,
        exemptPermissions: this.options.exemptPermissions,
        exemptMembers:
          !this.options.exemptMembers ||
          typeof this.options.exemptMembers === "string"
            ? this.options.exemptMembers
            : serialize(this.options.exemptMembers),
        isEnabled: this.options.isEnabled,
        minXpToTrack: this.options.minXpToTrack,
        minLevelToTrack: this.options.minLevelToTrack,
        maxXpToTrack: this.options.maxXpToTrack,
        maxLevelToTrack: this.options.maxLevelToTrack,
        xpAmountToAdd:
          !this.options.xpAmountToAdd ||
          typeof this.options.xpAmountToAdd === "string"
            ? this.options.xpAmountToAdd
            : serialize(this.options.xpAmountToAdd),
        messagesToAdd:
          !this.options.messagesToAdd ||
          typeof this.options.messagesToAdd === "string"
            ? this.options.messagesToAdd
            : serialize(this.options.messagesToAdd),
        messagesTrackingEnabled: this.options.messagesTrackingEnabled,
        levelingTrackingEnabled: this.options.levelingTrackingEnabled,
        levelMultiplier:
          !this.options.levelMultiplier ||
          typeof this.options.levelMultiplier === "string"
            ? this.options.levelMultiplier
            : serialize(this.options.levelMultiplier),
      },
    };
    return baseData;
  }

  get exemptPermissions() {
    return Array.isArray(this.options.exemptPermissions) &&
      this.options.exemptPermissions.length
      ? this.options.exemptPermissions
      : this.manager.options.default.exemptPermissions;
  }

  get exemptMembersFunction() {
    return this.options.exemptMembers
      ? typeof this.options.exemptMembers === "string" &&
        this.options.exemptMembers.includes("function anonymous")
        ? eval(`(${this.options.exemptMembers})`)
        : eval(this.options.exemptMembers)
      : null;
  }

  get exemptChannelsFunction() {
    return this.options.exemptChannels
      ? typeof this.options.exemptChannels === "string" &&
        this.options.exemptChannels.includes("function anonymous")
        ? eval(`(${this.options.exemptChannels})`)
        : eval(this.options.exemptChannels)
      : null;
  }

  get xpAmountToAddFunction() {
    return this.options.xpAmountToAdd
      ? typeof this.options.xpAmountToAdd === "string" &&
        this.options.xpAmountToAdd.includes("function anonymous")
        ? eval(`(${this.options.xpAmountToAdd})`)
        : eval(this.options.xpAmountToAdd)
      : null;
  }

  get messagesToAddFunction() {
    return this.options.messagesToAdd
      ? typeof this.options.messagesToAdd === "string" &&
        this.options.messagesToAdd.includes("function anonymous")
        ? eval(`(${this.options.messagesToAdd})`)
        : eval(this.options.messagesToAdd)
      : null;
  }

  get levelMultiplierFunction() {
    return this.options.levelMultiplier
      ? typeof this.options.levelMultiplier === "string" &&
        this.options.levelMultiplier.includes("function anonymous")
        ? eval(`(${this.options.levelMultiplier})`)
        : eval(this.options.levelMultiplier)
      : null;
  }

  get checkMessageFunction() {
    return this.options.checkMessage
      ? typeof this.options.checkMessage === "string" &&
        this.options.checkMessage.includes("function anonymous")
        ? eval(`(${this.options.checkMessage})`)
        : eval(this.options.checkMessage)
      : null;
  }

  async exemptMembers(member) {
    if (typeof this.exemptMembersFunction === "function") {
      try {
        const result = await this.exemptMembersFunction(member);
        return result;
      } catch (err) {
        console.error(
          `User Id: ${member.id}\nGuild Id: ${this.guildId}\nChannel Id: ${
            member.channel.id
          }\n${serialize(this.exemptMembersFunction)}\n${err}`
        );
        return false;
      }
    }
    if (typeof this.manager.options.default.exemptMembers === "function") {
      return await this.manager.options.default.exemptMembers(member);
    }
    return false;
  }

  async exemptChannels(channel) {
    if (typeof this.exemptChannelsFunction === "function") {
      try {
        const result = await this.exemptChannelsFunction(channel);
        return result;
      } catch (err) {
        console.error(
          `Guild Id: ${this.guildId}\nChannel Id: ${channel.id}\n${serialize(
            this.exemptChannelsFunction
          )}\n${err}`
        );
        return false;
      }
    }
    if (typeof this.manager.options.default.exemptChannels === "function") {
      return await this.manager.options.default.exemptChannels(channel);
    }
    return false;
  }

  async xpAmountToAdd() {
    if (typeof this.xpAmountToAddFunction === "function") {
      try {
        const result = await this.xpAmountToAddFunction();
        if (typeof result === "number") return result;
        else return Math.floor(Math.random() * 10) + 1;
      } catch (err) {
        console.error(
          `xpAmountToAdd Config Error\n${serialize(
            this.xpAmountToAddFunction
          )}\n${err}`
        );
        return Math.floor(Math.random() * 10) + 1;
      }
    }
    if (typeof this.manager.options.default.xpAmountToAdd === "function") {
      const result = await this.manager.options.default.xpAmountToAdd();
      if (typeof result === "number") return result;
      else return Math.floor(Math.random() * 10) + 1;
    }
    return Math.floor(Math.random() * 10) + 1;
  }

  async messagesToAdd() {
    if (typeof this.messagesToAddFunction === "function") {
      try {
        const result = await this.messagesToAddFunction();
        if (typeof result === "number") return result;
        else return 1;
      } catch (err) {
        console.error(
          `messagesToAdd Config Error\n${serialize(
            this.messagesToAddFunction
          )}\n${err}`
        );
        return 1;
      }
    }
    if (typeof this.manager.options.default.messagesToAdd === "function") {
      const result = await this.manager.options.default.messagesToAdd();
      if (typeof result === "number") return result;
      else return 1;
    }
    return 1;
  }

  async levelMultiplier() {
    if (typeof this.levelMultiplierFunction === "function") {
      try {
        const result = await this.levelMultiplierFunction();
        if (typeof result === "number") return result;
        else return 0.1;
      } catch (err) {
        console.error(
          `levelMultiplier Config Error\n${serialize(
            this.levelMultiplierFunction
          )}\n${err}`
        );
        return 0.1;
      }
    }
    if (typeof this.manager.options.default.levelMultiplier === "function") {
      const result = await this.manager.options.default.levelMultiplier();
      if (typeof result === "number") return result;
      else return 0.1;
    }
    return 0.1;
  }

  async checkMember(member) {
    const exemptMember = await this.exemptMembers(member);
    if (exemptMember) return false;
    const hasPermission = this.exemptPermissions.some((permission) =>
      member.permissions.has(permission)
    );
    if (hasPermission) return false;
    if (!this.trackBots && member.user.bot) return false;
    if (
      this.minXpToTrack &&
      member.data.data.levelingData.xp < this.minXpToTrack
    )
      return false;
    if (
      this.minLevelToTrack > 0 &&
      member.data.data.levelingData.level < this.minLevelToTrack
    )
      return false;
    if (
      this.maxXpToTrack > 0 &&
      member.data.data.levelingData.xp > this.maxXpToTrack
    )
      return false;
    if (
      this.maxLevelToTrack > 0 &&
      member.data.data.levelingData.level > this.maxLevelToTrack
    )
      return false;
    return true;
  }

  async checkChannel(channel) {
    const exemptChannel = await this.exemptChannels(channel);
    if (exemptChannel) return false;
    if (
      !this.trackAllChannels &&
      !lodash._.includes(this.channelIds, channel.id)
    )
      return false;
    return true;
  }

  async checkMessage(message) {
    if (typeof this.checkMessageFunction === "function") {
      try {
        const result = await this.checkMessageFunction(message);
        return result;
      } catch (err) {
        console.error(
          `Message: ${message}\n${serialize(this.checkMessageFunction)}\n${err}`
        );
        return false;
      }
    }
    if (typeof this.manager.options.default.checkMessage === "function") {
      return await this.manager.options.default.checkMessage(message);
    }
    return false;
  }

  edit(options = {}) {
    return new Promise(async (resolve, reject) => {
      if (typeof options.newTrackBots === "boolean")
        this.options.trackBots = options.newTrackBots;
      if (typeof options.newTrackAllChannels === "boolean")
        this.options.trackAllChannels = options.newTrackAllChannels;
      if (
        typeof options.newExemptChannels === "string" &&
        options.newExemptChannels.includes("function anonymous")
      )
        this.options.exemptChannels = options.newExemptChannels;
      if (Array.isArray(options.newChannelIds))
        this.options.channelIds = options.newChannelIds;
      if (Array.isArray(options.newExemptPermissions))
        this.options.exemptPermissions = options.newExemptPermissions;
      if (
        typeof options.newExemptMembers === "string" &&
        options.newExemptMembers.includes("function anonymous")
      )
        this.options.exemptMembers = options.newExemptMembers;
      if (Number.isInteger(options.newMinXpToTrack))
        this.options.minXpToTrack = options.newMinXpToTrack;
      if (Number.isInteger(options.newMinLevelToTrack))
        this.options.minLevelToTrack = options.newMinLevelToTrack;
      if (Number.isInteger(options.newMaxXpToTrack))
        this.options.maxXpToTrack = options.newMaxXpToTrack;
      if (Number.isInteger(options.newMaxLevelToTrack))
        this.options.maxLevelToTrack = options.newMaxLevelToTrack;
      if (
        typeof options.newXpAmountToAdd === "string" &&
        options.newXpAmountToAdd.includes("function anonymous")
      )
        this.options.xpAmountToAdd = options.newXpAmountToAdd;
      if (
        typeof options.newMessagesToAdd === "string" &&
        options.newMessagesToAdd.includes("function anonymous")
      )
        this.options.messagesToAdd = options.newMessagesToAdd;
      if (typeof options.newMessagesTrackingEnabled === "boolean")
        this.options.messagesTrackingEnabled =
          options.newMessagesTrackingEnabled;
      if (typeof options.newLevelingTrackingEnabled === "boolean")
        this.options.levelingTrackingEnabled =
          options.newLevelingTrackingEnabled;
      if (
        typeof options.newLevelMultiplier === "string" &&
        options.newLevelMultiplier.includes("function anonymous")
      )
        this.options.levelMultiplier = options.newLevelMultiplier;
      await this.manager.editConfig(this.guildId, this.data);
      resolve(this);
    });
  }
}
module.exports = Config;
