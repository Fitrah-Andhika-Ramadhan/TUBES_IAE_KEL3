// Apollo Server setup for API Gateway, combining all schemas/resolvers
const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const { typeDefs: bookingTypeDefs, resolvers: bookingResolvers } = require('./booking');
const { typeDefs: hotelTypeDefs, resolvers: hotelResolvers } = require('./hotel');
const { typeDefs: usersTypeDefs, resolvers: usersResolvers } = require('./users');
const { typeDefs: paymentTypeDefs, resolvers: paymentResolvers } = require('./payment');
const { typeDefs: flightTypeDefs, resolvers: flightResolvers } = require('./flight');
const { typeDefs: trainTypeDefs, resolvers: trainResolvers } = require('./train');
const { typeDefs: localTravelTypeDefs, resolvers: localTravelResolvers } = require('./localTravel');
const { typeDefs: externalAuthTypeDefs, resolvers: externalAuthResolvers } = require('./externalAuth'); // Added import for externalAuth

// Combine all typeDefs and resolvers (add more as you expand other domains)
const typeDefs = [
  bookingTypeDefs,
  hotelTypeDefs,
  usersTypeDefs,
  paymentTypeDefs,
  flightTypeDefs,
  trainTypeDefs,
  localTravelTypeDefs,
  externalAuthTypeDefs // Added externalAuthTypeDefs
];
const resolvers = [
  bookingResolvers,
  hotelResolvers,
  usersResolvers,
  paymentResolvers,
  flightResolvers,
  trainResolvers,
  localTravelResolvers,
  externalAuthResolvers // Added externalAuthResolvers
];

async function startApolloServer(app) { // Accept the main app instance
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      // Return an object that will be the context for all resolvers
      // We are specifically adding the req object here so it can be accessed in resolvers
      return { req };
    },
  });
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' }); // Apply middleware to the passed app
  return app; // Return the same app instance
}

module.exports = { startApolloServer }; // Export only the function
