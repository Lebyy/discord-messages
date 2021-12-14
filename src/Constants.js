exports.defaultMessagesManagerOptions = {
  userStorage: "./users.json",
  configStorage: "./configs.json",
  default: {
    trackBots: false,
    trackAllChannels: true,
    exemptChannels: () => false,
    checkMessage: () => true,
    channelIds: [],
    exemptPermissions: [],
    exemptMembers: () => false,
    minXpToTrack: 0,
    minLevelToTrack: 0,
    maxXpToTrack: 0,
    maxLevelToTrack: 0,
    xpAmountToAdd: () => Math.floor(Math.random() * 10) + 1,
    messagesToAdd: () => 1,
    messagesTrackingEnabled: true,
    levelingTrackingEnabled: true,
    levelMultiplier: () => 0.1,
  },
};

exports.defaultUserOptions = {
  messages: {
    channels: [],
    total: 0,
  },
  levelingData: {
    xp: 0,
    level: 0,
  },
};

exports.defaultConfigOptions = {
  trackBots: false,
  trackAllChannels: true,
  exemptChannels: () => false,
  checkMessage: () => true,
  channelIds: [],
  exemptPermissions: [],
  exemptMembers: () => false,
  minXpToTrack: 0,
  minLevelToTrack: 0,
  maxXpToTrack: 0,
  maxLevelToTrack: 0,
  xpAmountToAdd: () => Math.floor(Math.random() * 10) + 1,
  messagesToAdd: () => 1,
  messagesTrackingEnabled: true,
  levelingTrackingEnabled: true,
  levelMultiplier: () => 0.1,
};
