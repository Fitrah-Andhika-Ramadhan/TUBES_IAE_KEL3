require('dotenv').config();
console.log('[Users Service] JWT_SECRET:', process.env.JWT_SECRET);
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const { ApolloServer } = require('apollo-server-express');
const { typeDefs, resolvers } = require('./graphql/schema');
const logger = require('./logger');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} from ${req.ip}`);
  next();
});

// User API routes
app.use('/api/users', userRoutes);

// Apollo Server setup
async function startApolloServer() {
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  app.listen(PORT, () => {
    logger.info(`Users Service with Apollo GraphQL running on port ${PORT}`);
  });
}

startApolloServer();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'users-service', time: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.send('Users Service is running');
});

// Error handler middleware
app.use((err, req, res, next) => {
  logger.error('Error:', err);
  res.status(500).json({ status: 'error', message: 'Internal server error' });
});


