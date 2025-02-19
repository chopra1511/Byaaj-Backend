const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLFloat,
  GraphQLList,
} = require("graphql");

const EntryItemType = new GraphQLObjectType({
  name: "EntryItem",
  fields: () => ({
    id: { type: GraphQLID },
    type: { type: GraphQLString },
    amount: { type: GraphQLFloat },
    details: { type: GraphQLString },
    date: { type: GraphQLString },
  }),
});

const BalanceType = new GraphQLObjectType({
  name: "Balance",
  fields: () => ({
    totalAmount: { type: GraphQLFloat },
    type: { type: GraphQLString },
  }),
});

const EntryType = new GraphQLObjectType({
  name: "Entry",
  fields: () => ({
    id: { type: GraphQLID },
    customerID: { type: GraphQLID },
    entries: { type: new GraphQLList(EntryItemType) },
    balance: { type: BalanceType },
  }),
});

module.exports = EntryType;
