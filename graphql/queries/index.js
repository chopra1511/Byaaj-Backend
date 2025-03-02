const customerQueries = require("./CustomerQueries");
const userQueries = require("./UserQueries");

module.exports = {
  ...customerQueries,
  ...userQueries
};
