const customerMutations = require("./CustomerMutations");
const userMutations = require("./UserMuataion");

module.exports = {
  ...customerMutations,
  ...userMutations,
};
