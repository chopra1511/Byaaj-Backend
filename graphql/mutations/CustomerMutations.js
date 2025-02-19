const {
  GraphQLFloat,
  GraphQLString,
  GraphQLID,
  GraphQLObjectType,
  GraphQLInt,
} = require("graphql");
const Customer = require("../../models/Customer");
const CustomerType = require("../types/CustomerType");
const EntryType = require("../types/EntryType");
const Entry = require("../../models/Entry");
const InterestTrackingType = require("../types/InterestTrackingType");
const InterestTracking = require("../../models/InterestTracking");

const customerMutations = {
  // createCustomer: {
  //   type: CustomerType,
  //   args: {
  //     name: { type: GraphQLString },
  //     phone: { type: GraphQLString },
  //     initialType: { type: GraphQLString },
  //     initialAmount: { type: GraphQLFloat },
  //     interest: { type: GraphQLFloat },
  //     date: { type: GraphQLString },
  //   },
  //   resolve: async (parent, args) => {
  //     const newCustomer = new Customer({
  //       name: args.name,
  //       phone: args.phone,
  //       interest: args.interest,
  //     });
  //     const savedCustomer = await newCustomer.save();

  //     const initialEntry = new Entry({
  //       customerID: savedCustomer._id,
  //       entries: [
  //         {
  //           type: args.initialType, // "Paid" or "Got"
  //           amount: args.initialAmount,
  //           details: "Initial transaction", // Optional note
  //           date: args.date,
  //         },
  //       ],
  //       balance: {
  //         totalAmount: args.initialAmount,
  //         type: args.initialType,
  //       },
  //     });
  //     const savedEntry = await initialEntry.save();

  //     if (args.interest) {
  //       const interestTracking = new InterestTracking({
  //         customerID: savedCustomer._id,
  //         tracking: [],
  //         totalInterestPaid: 0,
  //       });
  //       const savedInterestTracking = await interestTracking.save();
  //       savedCustomer.interestTracking.push(savedInterestTracking._id);
  //     }

  //     savedCustomer.entries.push(savedEntry._id);
  //     await savedCustomer.save();
  //     return savedCustomer;
  //   },
  // },

  createCustomer: {
    type: CustomerType,
    args: {
      name: { type: GraphQLString },
      phone: { type: GraphQLString },
      initialType: { type: GraphQLString },
      initialAmount: { type: GraphQLFloat },
      interest: { type: GraphQLFloat },
      date: { type: GraphQLString }, // e.g. "2025-02-03"
    },
    resolve: async (parent, args) => {
      // 1. Create the customer document
      const newCustomer = new Customer({
        name: args.name,
        phone: args.phone,
        interest: args.interest,
      });
      const savedCustomer = await newCustomer.save();

      // 2. Create an Entry document (initial transaction)
      const initialEntry = new Entry({
        customerID: savedCustomer._id,
        entries: [
          {
            type: args.initialType, // "Paid" or "Got"
            amount: args.initialAmount,
            details: "Initial transaction",
            date: args.date,
          },
        ],
        balance: {
          totalAmount: args.initialAmount,
          type: args.initialType,
        },
      });
      const savedEntry = await initialEntry.save();

      // 3. If interest is defined, create an InterestTracking document
      if (args.interest) {
        // Parse the provided date (when the customer was added)
        const startDateObj = new Date(args.date);
        // e.g., "2025-02-03" => February 3, 2025
        let startYear = startDateObj.getFullYear();
        let nextMonthIndex = startDateObj.getMonth() + 1;
        // If the customer was added in Feb (index=1), nextMonthIndex=2 => Start from March

        // If the next month goes beyond December, shift to January of the next year
        if (nextMonthIndex > 11) {
          nextMonthIndex = 0;
          startYear += 1;
        }

        // Generate the array of months from nextMonthIndex to December
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const monthsArray = [];
        for (let i = nextMonthIndex; i < 12; i++) {
          monthsArray.push({
            month: months[i],
            interestAmt: 0,
            status: "Pending",
            paidDate: null,
          });
        }

        // Create the InterestTracking document with a single year entry
        const interestTracking = new InterestTracking({
          customerID: savedCustomer._id,
          tracking: [
            {
              year: startYear,
              months: monthsArray,
            },
          ],
          totalInterestPaid: 0,
        });
        const savedInterestTracking = await interestTracking.save();

        // Link the InterestTracking document to the customer
        savedCustomer.interestTracking.push(savedInterestTracking._id);
      }

      // 4. Link the Entry document to the customer
      savedCustomer.entries.push(savedEntry._id);
      await savedCustomer.save();

      return savedCustomer;
    },
  },

  addEntry: {
    type: EntryType,
    args: {
      customerID: { type: GraphQLID },
      type: { type: GraphQLString },
      amount: { type: GraphQLFloat },
      details: { type: GraphQLString },
      date: { type: GraphQLString },
    },
    async resolve(parent, args) {
      try {
        let entryDoc = await Entry.findOne({ customerID: args.customerID });

        if (!entryDoc) {
          entryDoc = new Entry({
            customerID: args.customerID,
            entries: [],
            balance: {
              totalAmount: args.amount,
              type: args.type,
            },
          });
        } else {
          // Calculate new balance
          let currentBalance = entryDoc.balance?.totalAmount || 0;
          let currentType = entryDoc.balance?.type || args.type;
          let newBalance = currentBalance;
          let newType = currentType;

          // If current balance type matches new entry type
          if (currentType === args.type) {
            newBalance += args.amount;
          } else {
            // Types are different, need to subtract
            if (currentBalance > args.amount) {
              newBalance = currentBalance - args.amount;
              newType = currentType;
            } else if (currentBalance < args.amount) {
              newBalance = args.amount - currentBalance;
              newType = args.type;
            } else {
              newBalance = 0;
              newType = "Settled";
            }
          }

          // Add new entry
          entryDoc.entries.push({
            type: args.type,
            amount: args.amount,
            details: args.details,
            date: args.date ? new Date(args.date) : Date.now(),
          });

          // Update balance
          entryDoc.balance = {
            totalAmount: newBalance,
            type: newBalance === 0 ? "Settled" : newType,
          };
        }

        const updatedEntry = await entryDoc.save();
        return updatedEntry;
      } catch (error) {
        console.error("Error adding entry:", error);
        throw new Error("Failed to add entry");
      }
    },
  },

  editEntry: {
    type: EntryType,
    args: {
      customerID: { type: GraphQLID },
      entryID: { type: GraphQLID },
      amount: { type: GraphQLFloat },
      type: { type: GraphQLString },
      details: { type: GraphQLString },
      date: { type: GraphQLString },
    },
    async resolve(parent, args) {
      try {
        // Find the entry document for the customer
        const entryDoc = await Entry.findOne({ customerID: args.customerID });

        if (!entryDoc) {
          throw new Error("Entry not found for the provided customer ID");
        }

        // Find the entry to update
        const entryIndex = entryDoc.entries.findIndex(
          (entry) => entry._id.toString() === args.entryID
        );

        if (entryIndex === -1) {
          throw new Error("Entry not found");
        }

        // Update the specific entry
        entryDoc.entries[entryIndex] = {
          ...entryDoc.entries[entryIndex],
          type: args.type || entryDoc.entries[entryIndex].type,
          amount: args.amount || entryDoc.entries[entryIndex].amount,
          details: args.details || entryDoc.entries[entryIndex].details,
          date: args.date
            ? new Date(args.date)
            : entryDoc.entries[entryIndex].date,
        };

        // Recalculate balance and type
        let totalPaid = 0;
        let totalGot = 0;

        entryDoc.entries.forEach((entry) => {
          if (entry.type === "Paid") {
            totalPaid += entry.amount;
          } else if (entry.type === "Got") {
            totalGot += entry.amount;
          }
        });

        let newBalance = Math.abs(totalPaid - totalGot);
        let newType = "Settled";

        if (totalPaid > totalGot) {
          newType = "Paid";
        } else if (totalGot > totalPaid) {
          newType = "Got";
        }

        // Update the balance
        entryDoc.balance = {
          totalAmount: newBalance,
          type: newType,
        };

        // Save the updated document
        const updatedEntryDoc = await entryDoc.save();
        return updatedEntryDoc;
      } catch (error) {
        console.error("Error editing entry:", error);
        throw new Error("Failed to edit entry");
      }
    },
  },

  updateInterestTracking: {
    type: InterestTrackingType,
    args: {
      customerID: { type: GraphQLID },
      year: { type: GraphQLInt },
      month: { type: GraphQLString },
      interestAmt: { type: GraphQLFloat },
      status: { type: GraphQLString },
      paidDate: {type: GraphQLString}
    },
    async resolve(parent, args) {
      const { customerID, year, month, interestAmt, status, paidDate } = args;

      let trackingData = await InterestTracking.findOne({ customerID });

      if (!trackingData) {
        // If no tracking data exists, create a new entry
        trackingData = new InterestTracking({
          customerID,
          tracking: [
            {
              year,
              months: [{ month, interestAmt: interestAmt, status, paidDate }],
            },
          ],
          totalInterestPaid: status === "Paid" ? interestAmt : 0,
        });
      } else {
        // Try to find the year entry
        let yearEntry = trackingData.tracking.find((y) => y.year === year);

        if (!yearEntry) {
          // If the year is not found, add a new year entry
          trackingData.tracking.push({
            year,
            months: [{ month, interestAmt: interestAmt, status }],
          });
          // Retrieve the newly added yearEntry for later use
          yearEntry = trackingData.tracking.find((y) => y.year === year);
        } else {
          // Find the month entry within the year
          let monthEntry = yearEntry.months.find((m) => m.month === month);

          if (!monthEntry) {
            // If month doesn't exist, add it
            yearEntry.months.push({
              month,
              interestAmt: interestAmt,
              status,
              paidDate
            });

            // If new status is Paid, add to total
            if (status === "Paid") {
              trackingData.totalInterestPaid += interestAmt;
            }
          } else {
            // If month exists, read the old status
            const oldStatus = monthEntry.status;

            // If month exists, update its status and interest amount
            monthEntry.status = status;
            monthEntry.interestAmt = interestAmt;
            monthEntry.paidDate = status === "Paid" ? paidDate : null;

            // If old status was Paid but new is Pending, subtract
            if (oldStatus === "Paid" && status === "Pending") {
              trackingData.totalInterestPaid -= monthEntry.interestAmt;
              monthEntry.interestAmt = 0;
            }
            // If old status wasn't Paid but new is Paid, add
            else if (oldStatus !== "Paid" && status === "Paid") {
              trackingData.totalInterestPaid += interestAmt;
            }
          }
        }

        // Now that we have a valid yearEntry, check if all months in that year are paid
        const allMonthsPaid = yearEntry.months.every(
          (m) => m.status === "Paid"
        );
        if (allMonthsPaid) {
          const nextYear = year + 1;
          const nextYearExists = trackingData.tracking.find(
            (y) => y.year === nextYear
          );
          if (!nextYearExists) {
            // Add next year's entry with all months set to "Pending"
            trackingData.tracking.push({
              year: nextYear,
              months: [
                { month: "Jan", interestAmt: 0, status: "Pending" },
                { month: "Feb", interestAmt: 0, status: "Pending" },
                { month: "Mar", interestAmt: 0, status: "Pending" },
                { month: "Apr", interestAmt: 0, status: "Pending" },
                { month: "May", interestAmt: 0, status: "Pending" },
                { month: "Jun", interestAmt: 0, status: "Pending" },
                { month: "Jul", interestAmt: 0, status: "Pending" },
                { month: "Aug", interestAmt: 0, status: "Pending" },
                { month: "Sep", interestAmt: 0, status: "Pending" },
                { month: "Oct", interestAmt: 0, status: "Pending" },
                { month: "Nov", interestAmt: 0, status: "Pending" },
                { month: "Dec", interestAmt: 0, status: "Pending" },
              ],
            });
          }
        }
      }

      await trackingData.save();
      return trackingData;
    },
  },
};

module.exports = customerMutations;
