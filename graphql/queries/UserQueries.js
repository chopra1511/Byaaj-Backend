const { GraphQLList, GraphQLString } = require("graphql");
const User = require("../../models/User");
const UserType = require("../types/UserType");


const userQueries = {
  currentUser: {
    type: UserType,
    resolve: async (parent, args, context) => {
      const { req } = context;
      if (!req.session.userId) {
        throw new Error("Not authenticated!");
      }

      const user = await User.findById(req.session.userId);
      if (!user) {
        throw new Error("User not found!");
      }

      return user;
    },
  },
};

module.exports = userQueries;