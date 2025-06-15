// Apollo Client setup and sample query integration
import { ApolloClient, InMemoryCache } from '@apollo/client';
// For domain-specific hooks, use:
//   import { useHotels, useHotelDetail, ... } from './graphqlHotelHooks';
//   import { useFlights, useFlightDetail, ... } from './graphqlFlightHooks';
//   import { useTrains, useTrainDetail, ... } from './graphqlTrainHooks';
//   import { useLocalTravels, useLocalTravelDetail, ... } from './graphqlLocalTravelHooks';

// Configure the Apollo Client instance
export const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql', // Adjust the GraphQL endpoint as needed
  cache: new InMemoryCache(),
});

// All domain-specific query and mutation hooks have been moved to their respective files for modularity and maintainability.
// See: graphqlHotelHooks.js, graphqlFlightHooks.js, graphqlTrainHooks.js, graphqlLocalTravelHooks.js
