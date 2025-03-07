const { GraphQLList, GraphQLID, GraphQLString } = require("graphql");
const moment = require("moment");
const CustomerType = require("../types/CustomerType");
const Customer = require("../../models/Customer");
const EntryType = require("../types/EntryType");
const Entry = require("../../models/Entry");
const InterestTrackingType = require("../types/InterestTrackingType");
const InterestTracking = require("../../models/InterestTracking");

const customerQueries = {
  customers: {
    type: new GraphQLList(CustomerType),
    resolve: async (parent, args, context) => {
      try {
        const { req } = context;
        const userID = req.session.userId;

        if (!userID) {
          throw new Error("User is not authenticated");
        }

        const customers = await Customer.find({ userID }).populate({
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
      return year;
    },
  },

  customersWithUpcomingInterest: {
    type: new GraphQLList(CustomerType),
    resolve: async (parent, args, context) => {
      try {
        const { req } = context;
        const userID = req.session.userId;

        if (!userID) {
          throw new Error("User is not authenticated");
        }

        const customers = await Customer.find({ userID }).populate({
          path: "entries", // Populates the 'entries' field from the Entry model
          populate: {
            path: "entries", // Populate the nested 'entries' array inside the Entry model
          },
        });

        const today = moment(); // Get current date
        const nextMonth = today.add(1, "month").month(); // Get upcoming month

        // Filter customers whose next payment date falls in the upcoming month
        const upcomingCustomers = customers.filter((customer) =>
          customer.entries.some((entry) => {
            if (!entry.entries.length) return false; 

            const createdAt = moment(entry.entries[0].date); // Convert date
            const nextPaymentDate = createdAt.clone().add(1, "month"); // Add 1 month

            return nextPaymentDate.month() + 1 === nextMonth; 
          })
        );

        return upcomingCustomers;
      } catch (error) {
        console.error("Error fetching upcoming interest payments:", error);
        throw new Error("Failed to fetch customers");
      }
    },
  },
};

module.exports = customerQueries;
