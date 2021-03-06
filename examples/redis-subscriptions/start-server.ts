import "reflect-metadata";
import * as http from "http";
import * as express from "express";
import * as bodyParser from "body-parser";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { execute, subscribe, GraphQLSchema } from "graphql";
import { graphqlExpress, graphiqlExpress } from "apollo-server-express";

export function startServer(schema: GraphQLSchema) {
  const HTTP_PORT = 4000;
  const WS_PORT = 4001;

  // create WebSocket listener server
  const websocketServer = http.createServer((request, response) => {
    response.writeHead(404);
    response.end();
  });

  // bind it to port and start listening
  websocketServer.listen(WS_PORT, () =>
    console.log(`Websocket Server is now running on localhost:${WS_PORT}`),
  );

  // create Subscription Server to handle subscriptions over WS
  const subscriptionServer = SubscriptionServer.create(
    { schema, execute, subscribe },
    { server: websocketServer, path: "/graphql" },
  );

  // create express-based gql endpoint
  const app = express();
  app.use("/graphql", bodyParser.json(), graphqlExpress({ schema }));
  app.use(
    "/graphiql",
    graphiqlExpress({
      endpointURL: "/graphql",
      subscriptionsEndpoint: `ws://localhost:${WS_PORT}/graphql`,
    }),
  );
  app.listen(HTTP_PORT, () => {
    console.log(`Running a GraphQL API server at localhost:${HTTP_PORT}/graphql`);
  });
}
