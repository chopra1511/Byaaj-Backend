require("dotenv").config();
const express = require("express");
const bodyparser = require("body-parser");
const cors = require("cors");
const colors = require("colors");
const { graphqlHTTP } = require("express-graphql");
const ConnectDB = require("./config/db");
const schema = require("./graphql/schemas");

const PORT = process.env.PORT || 3000;

const startServer = () => {
  const app = express();
  app.use(bodyparser.json());
  app.use(bodyparser.urlencoded({ extended: true }));

  //create HTTP server
  const server = require("http").createServer(app);

  //Connect to database
  ConnectDB();
  
  //CORS Configuration
  app.use(
    cors({
      origin: ["http://localhost:5174", "https://byaaj-frontend.vercel.app"],
      credentials: true,
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