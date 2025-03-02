const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLList,
} = require("graphql");
const CustomerType = require("./CustomerType");

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    password: { type: GraphQLString },
    phone: { type: GraphQLString },
    customer: { type: new GraphQLList(CustomerType) },
  }),
});

module.exports = UserType;
