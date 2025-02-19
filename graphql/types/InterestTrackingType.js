const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLFloat,
  GraphQLList,
} = require("graphql");

const MonthType = new GraphQLObjectType({
  name: "Month",
  fields: () => ({
    month: { type: GraphQLString },
    interestAmt: { type: GraphQLFloat },
    status: { type: GraphQLString },
    paidDate: { type: GraphQLString },
  }),
});

const YearType = new GraphQLObjectType({
  name: "Year",
  fields: () => ({
    year: { type: GraphQLString },
    months: { type: new GraphQLList(MonthType) },
  }),
});

const InterestTrackingType = new GraphQLObjectType({
  name: "InterestTrackingType",
  fields: () => ({
    customerID: { type: GraphQLID },
    tracking: { type: new GraphQLList(YearType) },
    totalInterestPaid: { type: GraphQLFloat },
  }),
});

module.exports = InterestTrackingType;
