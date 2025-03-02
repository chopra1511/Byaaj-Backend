const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLList,
  GraphQLFloat,
} = require("graphql");
const EntryType = require("./EntryType");

const InterestTrackingType = new GraphQLObjectType({
  name: "InterestTracking",
  fields: () => ({
    id: { type: GraphQLID },
    month: { type: GraphQLString },
    status: { type: GraphQLString },
  }),
});

const CustomerType = new GraphQLObjectType({
  name: "Customer",
  fields: () => ({
    id: { type: GraphQLID },
    userID: { type: GraphQLID },
    name: { type: GraphQLString },
    phone: { type: GraphQLString },
    interest: { type: GraphQLFloat },
    entries: { type: new GraphQLList(EntryType) },
    interestTracking: { type: new GraphQLList(InterestTrackingType) },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  }),
});

module.exports = CustomerType;
