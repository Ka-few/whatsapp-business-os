require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { typeDefs, resolvers } = require('./graphql');

const healthRoutes = require('./routes/health');
const dashboardRoutes = require('./routes/dashboard');
const appointmentRoutes = require('./routes/appointments');
const authRoutes = require('./routes/auth');
const whatsappRoutes = require('./routes/whatsapp');

async function startServer() {
  const app = express();
  const PORT = Number(String(process.env.PORT || 4000).trim());

  // Wait for Apollo Server to start
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
  });
  await apolloServer.start();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);

  // GraphQL endpoint
  app.use('/graphql', expressMiddleware(apolloServer, {
    context: async ({ req }) => {
      // Simplistic authentication for MVP: extract businessId from headers
      // (In production, this would verify a JWT and extract the user's business ID)
      const businessId = req.headers['x-business-id'] || 'default-business-id';
      return { businessId };
    },
  }));

  // REST endpoints
  app.use('/api/v1', healthRoutes);
  app.use('/api/v1', dashboardRoutes);
  app.use('/api/v1', appointmentRoutes);
  app.use('/api/v1', authRoutes);
  app.use('/api/v1', whatsappRoutes);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'whatsapp-business-os-backend' });
  });

  const server = app.listen(PORT, () => {
    console.log(`Backend listening on port ${PORT}`);
    console.log(`GraphQL endpoint available at http://localhost:${PORT}/graphql`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(
        `Port ${PORT} is already in use. Stop the existing process or start the backend with a different PORT.`
      );
      process.exit(1);
    }

    console.error('Failed to start backend server:', error);
    process.exit(1);
  });
}

startServer().catch(console.error);
