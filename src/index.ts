import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import { buildSchema, emitSchemaDefinitionFile } from "type-graphql";
import resolvers from "./resolvers/index";
import dotenv from "dotenv";
import { createConnection } from "typeorm";
import entities from "./entities";
import User from "./entities/User";
import jwt from "jsonwebtoken";
import authChecker from "./utils/authcheker";
import express from "express";
import cors from "cors";

import { graphqlUploadExpress } from "graphql-upload";
import { FILE_SIZE_LIMIT_MB } from "./utils/config";

dotenv.config();

const main = async () => {
  const schema = await buildSchema({ resolvers, authChecker });

  await emitSchemaDefinitionFile("./schema.gql", schema);

  const server = new ApolloServer({
    schema,
    context: async ({
      req,
      res,
    }: {
      req: express.Request;
      res: express.Response;
    }) => {
      let user;
      if (req.headers.cookie) {
        const token = req.headers.cookie.split("token=")[1];
        if (token) {
          const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
          user = await User.findOne({ id: decoded });
        }
      }
      return { req, res, user };
    },
  });

  await server.start();

  const app = express();

  app.use(
    graphqlUploadExpress({
      maxFileSize: FILE_SIZE_LIMIT_MB * 1000000, // 10MB
      maxFiles: 5,
    })
  );

  app.use(
    cors({
      credentials: true,
      origin: ["http://localhost:3000", "https://studio.apollographql.com"],
    })
  );

  server.applyMiddleware({ app, cors: false });

  app.use(express.static("public"));

  app.listen(process.env.PORT || 8000, () =>
    console.log(`Server running: http://localhost:${process.env.PORT || 8000}`)
  );
};

createConnection({
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities,
  synchronize: true,
  ssl: process.env.IS_SSL === "true" ? true : false,
})
  .then(() => {
    console.log("Database connected");
    main();
  })
  .catch((e) => {
    console.log(e);
  });
