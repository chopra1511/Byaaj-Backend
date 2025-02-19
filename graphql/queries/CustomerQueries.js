const { GraphQLList, GraphQLID, GraphQLString } = require("graphql");
const CustomerType = require("../types/CustomerType");
const Customer = require("../../models/Customer");
const EntryType = require("../types/EntryType");
const Entry = require("../../models/Entry");
const InterestTrackingType = require("../types/InterestTrackingType");
const InterestTracking = require("../../models/InterestTracking");

const customerQueries = {
  customers: {
    type: new GraphQLList(CustomerType),
    resolve: async () => {
      try {
        const customers = await Customer.find().populate({
          path: "entries", // Populates the 'entries' field from the Entry model
          populate: {
            path: "entries", // Populate the nested 'entries' array inside the Entry model
          },
        });

        return customers;
      } catch (error) {
        console.error("Error fetching all customers:", error);
        throw new Error("Failed to fetch customers");
      }
    },
  },

  customer: {
    type: CustomerType,
    args: {
      customerID: { type: GraphQLID },
    },
    resolve: async (parent, args) => {
      try {
        const customer = await Customer.findById(args.customerID).populate({
          path: "entries", // Populates the 'entries' field from the Entry model
          populate: {
            path: "entries", // Populate the nested 'entries' array inside the Entry model
          },
        });
        if (!customer) throw new Error("Customer not found");
        return customer;
      } catch (error) {
        console.error("Error fetching customer:", error);
        throw new Error("Failed to fetch customer");
      }
    },
  },

  entries: {
    type: EntryType,
    args: { customerID: { type: GraphQLID } },
    resolve(parent, args) {
      return Entry.findOne({ customerID: args.customerID });
    },
  },

  customerInterestTracking: {
    type: InterestTrackingType,
    args: {
      customerID: { type: GraphQLID },
    },
    async resolve(_, { customerID }) {
      return await InterestTracking.findOne({ customerID });
    },
  },

  getMonths: {
    type: new GraphQLList(InterestTrackingType),
    args: { customerID: { type: GraphQLID }, year: { type: GraphQLString } },
    async resolve(parent, args) {
      const tracking = await InterestTracking.find({
        customerID: args.customerID,
      });
      const trackingYear = tracking.map((track) => {
        return track.tracking;
      });
      const year = trackingYear[0].map((year) => {
        if (year.year === args.year) return year.months;
      });
      // console.log("Year:", year[0]);
      return year;
    },
  },
};

module.exports = customerQueries;
