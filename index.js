const mongoose = require("mongoose");
const Messages = require("./models/messages.js");
let mongoUrl;

/**
 *
 *
 * @class DiscordMessages
 */
class DiscordMessages {

  /**
   *
   *
   * @static
   * @param {string} dbUrl - A valid mongo database URI.
   * @return {Promise} - The mongoose connection promise.
   * @memberof DiscordMessages
   */
  static async setURL(dbUrl) {
    if (!dbUrl) throw new TypeError("A database url was not provided.");
		if(mongoUrl) throw new TypeError("A database url was already configured.");
    mongoUrl = dbUrl;
    return mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    });
  }

  /**
   *
   *
   * @static
   * @param {string} userId - Discord user id.
   * @param {string} guildId - Discord guild id.
   * @return {object} - The user data object.
   * @memberof DiscordMessages
   */
  static async createUser(userId, guildId) {
    if (!userId) throw new TypeError("An user id was not provided.");
    if (!guildId) throw new TypeError("A guild id was not provided.");

    const isUser = await Messages.findOne({ userID: userId, guildID: guildId });
    if (isUser) return false;

    const newUser = new Messages({
      userID: userId,
      guildID: guildId
    });

    await newUser.save().catch(e => console.log(`Failed to create user: ${e}`));

    return newUser;
  }

  /**
   *
   *
   * @static
   * @param {string} userId - Discord user id.
   * @param {string} guildId - Discord guild id.
   * @return {object} - The user data object.
   * @memberof DiscordMessages
   */
  static async deleteUser(userId, guildId) {
    if (!userId) throw new TypeError("An user id was not provided.");
    if (!guildId) throw new TypeError("A guild id was not provided.");

    const user = await Messages.findOne({ userID: userId, guildID: guildId });
    if (!user) return false;

    await Messages.findOneAndDelete({ userID: userId, guildID: guildId }).catch(e => console.log(`Failed to delete user: ${e}`));

    return user;
  }

  /**
   *
   *
   * @static
   * @param {string} userId - Discord user id.
   * @param {string} guildId - Discord guild id.
   * @param {number} messages - Amount of messages to append.
   * @return {object} - The user data object. 
   * @memberof DiscordMessages
   */
  static async appendMessage(userId, guildId, messages) {
    if (!userId) throw new TypeError("An user id was not provided.");
    if (!guildId) throw new TypeError("A guild id was not provided.");
    if (messages == 0 || !messages || isNaN(parseInt(messages))) throw new TypeError("An amount of messages was not provided/was invalid.");
		const user = await Messages.findOne({ userID: userId, guildID: guildId });

    if (!user) {
      const newUser = new Messages({
        userID: userId,
        guildID: guildId,
        messages: messages
    });

      await newUser.save().catch(e => console.log(`Failed to save new user.`));

      return messages;
    };

    user.messages += parseInt(messages, 10);

    await user.save().catch(e => console.log(`Failed to append messages: ${e}`) );

    return user.messages
  }

  /**
   *
   *
   * @static
   * @param {string} userId - Discord user id.
   * @param {string} guildId - Discord guild id.
   * @param {number} messages - Amount of messages to set.
   * @return {object} - The user data object.
   * @memberof DiscordMessages
   */
  static async setMessages(userId, guildId, messages) {
    if (!userId) throw new TypeError("An user id was not provided.");
    if (!guildId) throw new TypeError("A guild id was not provided.");
    if (messages == 0 || !messages || isNaN(parseInt(messages))) throw new TypeError("An amount of messages was not provided/was invalid.");

    const user = await Messages.findOne({ userID: userId, guildID: guildId });
    if (!user) return false;

    user.messages = messages;

    user.save().catch(e => console.log(`Failed to set messages: ${e}`) );

    return user;
  }

  /**
   *
   *
   * @static
   * @param {string} userId - Discord user id.
   * @param {string} guildId - Discord guild id.
	 * @param {boolean} [fetchPosition=false] - Wheter to fetch the users position.
   * @return {object} - The user data object.
   * @memberof DiscordMessages
   */
  static async fetch(userId, guildId, fetchPosition = false) {
    if (!userId) throw new TypeError("An user id was not provided.");
    if (!guildId) throw new TypeError("A guild id was not provided.");
    const user = await Messages.findOne({
      userID: userId,
      guildID: guildId
    });
    if (!user) return false;
		let userobj = {}
    if (fetchPosition === true) {
      const leaderboard = await Messages.find({
        guildID: guildId
      }).sort([['messages', 'descending']]).exec();
      userobj.position = leaderboard.findIndex(i => i.userID === userId) + 1;
    }
		userobj.data = user
    return userobj;
  }

  /**
   *
   *
   * @static
   * @param {string} userId - Discord user id.
   * @param {string} guildId - Discord guild id.
   * @param {number} messages - Amount of messages to subtract.
   * @return {object} - The user data object.
   * @memberof DiscordMessages
   */
  static async subtractMessages(userId, guildId, messages) {
    if (!userId) throw new TypeError("An user id was not provided.");
    if (!guildId) throw new TypeError("A guild id was not provided.");
    if (messages == 0 || !messages || isNaN(parseInt(messages))) throw new TypeError("An amount of messages was not provided/was invalid.");

    const user = await Messages.findOne({ userID: userId, guildID: guildId });
    if (!user) return false;

    user.messages -= messages;

    user.save().catch(e => console.log(`Failed to subtract messages: ${e}`) );

    return user;
  }

	/**
   *
   *
   * @static
   * @param {string} guildId - Discord guild id.
   * @return {boolean} - Return's true if success.
   * @memberof DiscordMessages
   */
  static async resetGuild(guildId) {
    if (!guildId) throw new TypeError("A guild id was not provided.");

    const user = await Messages.findOne({ guildID: guildId });
    if (!user) return false;

    await Messages.findOneAndDelete({
			guildID: guildId
		}).catch(e => console.log(`Failed to reset guild: ${e}`));

		return true;
  }

  /**
   *
   *
   * @static
   * @param {string} guildId - Discord guild id.
   * @param {number} limit - Amount of maximum enteries to return.
   * @return {Array} - The leaderboard array.
   * @memberof DiscordMessages
   */
  static async fetchLeaderboard(guildId, limit) {
    if (!guildId) throw new TypeError("A guild id was not provided.");
    if (!limit) throw new TypeError("A limit was not provided.");

    var users = await Messages.find({ guildID: guildId }).sort([['messages', 'descending']]).exec();

    return users.slice(0, limit);
  }

  /**
   *
   *
   * @static
   * @param {string} client - Your Discord.CLient.
   * @param {array} leaderboard - The output from 'fetchLeaderboard' function.
   * @param {boolean} [fetchUsers=false] - Wheter to fetch each users position.
   * @return {*} 
   * @memberof DiscordMessages
   */
  static async computeLeaderboard(client, leaderboard, fetchUsers = false) {
    if (!client) throw new TypeError("A client was not provided.");
    if (!leaderboard) throw new TypeError("A leaderboard id was not provided.");

    if (leaderboard.length < 1) return [];

    const computedArray = [];

    if (fetchUsers) {
      for (const key of leaderboard) {
        const user = await client.users.fetch(key.userID) || { username: "Unknown", discriminator: "0000" };
        computedArray.push({
          guildID: key.guildID,
          userID: key.userID,
          messages: key.messages,
          position: (leaderboard.findIndex(i => i.guildID === key.guildID && i.userID === key.userID) + 1),
          username: user.username,
          discriminator: user.discriminator
        });
      }
    } else {
      leaderboard.map(key => computedArray.push({
        guildID: key.guildID,
        userID: key.userID,
        messages: key.messages,
        position: (leaderboard.findIndex(i => i.guildID === key.guildID && i.userID === key.userID) + 1),
        username: client.users.cache.get(key.userID) ? client.users.cache.get(key.userID).username : "Unknown",
        discriminator: client.users.cache.get(key.userID) ? client.users.cache.get(key.userID).discriminator : "0000"
      }));
    }

    return computedArray;
  }

}

module.exports = DiscordMessages;
