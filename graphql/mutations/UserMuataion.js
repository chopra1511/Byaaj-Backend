const { GraphQLString } = require("graphql");
const User = require("../../models/User");
const UserType = require("../types/UserType");
const bcrypt = require("bcrypt");

const userMutations = {
  registerUser: {
    type: UserType,
    args: {
      name: { type: GraphQLString },
      password: { type: GraphQLString },
      phone: { type: GraphQLString },
    },
    resolve: async (parent, args, context) => {
      try {
        const existingUser = await User.findOne({ phone: args.phone });
        if (existingUser) {
          throw new Error("User already exists!");
        }
        const hashedPassword = await bcrypt.hash(args.password, 10);

        //save user to database
        const user = new User({
          name: args.name,
          password: hashedPassword,
          phone: args.phone,
        });
        await user.save();
        return user;
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },

  userLogin: {
    type: UserType,
    args: {
      phone: { type: GraphQLString },
      password: { type: GraphQLString },
    },
    resolve: async (parent, args, context) => {
      const { req } = context;
      try {
        const user = await User.findOne({ phone: args.phone });
        if (!user) {
          throw new Error("User not found!");
        }
        const isValidPassword = await bcrypt.compare(
          args.password,
          user.password
        );
        if (!isValidPassword) {
          throw new Error("Invalid password!");
        }

        // Save user info in the session
        req.session.userId = user._id;
        req.session.save();

        return user;
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },

  logoutUser: {
    type: GraphQLString,
    resolve: async (parent, args, context) => {
      const { req, res } = context;

      if (!req || !req.session) {
        throw new Error("No session found");
      }

      return new Promise((resolve, reject) => {
        req.session.destroy((err) => {
          if (err) {
            console.error("Error destroying session:", err);
            reject(new Error("Logout failed"));
          } else {
            res.clearCookie("connect.sid", { path: "/" });
            resolve("Logged out successfully");
          }
        });
      });
    },
  },
};

module.exports = userMutations;
