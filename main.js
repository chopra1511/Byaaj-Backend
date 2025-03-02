require("dotenv").config();
const express = require("express");
const bodyparser = require("body-parser");
const cors = require("cors");
const colors = require("colors");
const { graphqlHTTP } = require("express-graphql");
const ConnectDB = require("./config/db");
const schema = require("./graphql/schemas");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

const PORT = process.env.PORT || 3000;

const startServer = () => {
  const app = express();
  app.use(bodyparser.json());
  app.use(bodyparser.urlencoded({ extended: true }));

  //create HTTP server
  const server = require("http").createServer(app);

  //Connect to database
  ConnectDB();

   const store = new MongoDBStore({
     uri: process.env.MONGO_URI,
     collection: "sessions",
   });

   store.on("error", function (error) {
     console.log("Session store error:", error);
   });
  
  //CORS Configuration
  app.use(
    cors({
      origin: ["http://localhost:5173", "https://byaaj-frontend.vercel.app"],
      credentials: true,
    })
  );

  app.use(
    session({
      secret: process.env.JWT_SECRET,
      resave: false,
      saveUninitialized: false,
      store: store,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
      },
    })
  );

    app.use(
      "/graphql",
      graphqlHTTP((req, res) => ({
        schema,
        graphiql: process.env.NODE_ENV === "development",
        context: { req, res },
      }))
    );
    
    server.listen(PORT, () => {
      console.log(
        `Server is running on http://localhost:${PORT}/graphql`.magenta.bold
      );
    });
};


startServer();