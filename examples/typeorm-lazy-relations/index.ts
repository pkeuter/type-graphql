import "reflect-metadata";
import * as express from "express";
import * as graphqlHTTP from "express-graphql";
import { Container } from "typedi";
import * as TypeORM from "typeorm";
import * as TypeGraphQL from "../../src";

import { RecipeResolver } from "./resolvers/recipe-resolver";
import { Recipe } from "./entities/recipe";
import { Rate } from "./entities/rate";
import { User } from "./entities/user";
import { seedDatabase } from "./helpers";
import { Context } from "./resolvers/types/context";

// register 3rd party IOC container
TypeGraphQL.useContainer(Container);
TypeORM.useContainer(Container);

async function bootstrap() {
  try {
    // create TypeORM connection
    await TypeORM.createConnection({
      type: "mysql",
      database: "type-graphql",
      username: "root", // fill this with your username
      password: "qwerty123", // and password
      port: 3306,
      host: "localhost",
      entities: [Recipe, Rate, User],
      synchronize: true,
      logger: "advanced-console",
      logging: "all",
      dropSchema: true,
      cache: true,
    });

    // seed database with some data
    const { defaultUser } = await seedDatabase();

    // build TypeGraphQL executable schema
    const schema = await TypeGraphQL.buildSchema({
      resolvers: [RecipeResolver],
    });

    // create mocked context
    const context: Context = { user: defaultUser };

    // create express-based gql endpoint
    const app = express();
    app.use(
      "/graphql",
      graphqlHTTP({
        schema,
        graphiql: true,
        context,
      }),
    );
    app.listen(4000, () => {
      console.log("Running a GraphQL API server at localhost:4000/graphql");
    });
  } catch (err) {
    console.error(err);
  }
}

bootstrap();
