module.exports = {
  /* Info */
  version: require("./package.json").version,
  author: require("./package.json").author,
  license: require("./package.json").license,

  /* Classes */
  MessagesManager: require("./src/Manager"),
};
