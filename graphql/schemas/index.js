const { GraphQLObjectType, GraphQLSchema } = require("graphql");
const Query = require("../queries");
const Mutation = require("../mutations");

const RootQuery = new GraphQLObjectType({
  name: "Query",
  fields: Query,
});

const RootMutation = new GraphQLObjectType({
  name: "Mutation",
  fields: Mutation,
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
});
