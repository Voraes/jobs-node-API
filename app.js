require('dotenv').config();
require('express-async-errors');
const express = require('express');
const app = express();

//Error handling
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

//ConnectDB
const connectDB = require('./db/connect');

//Router
const authRouter = require('./routes/auth');
const jobsRouter = require('./routes/jobs');

// extra security packages
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const rateLimiter = require('express-rate-limit');

//Middleware
const authenticationMiddleware = require('./middleware/authentication');

app.set('trust proxy', 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, //15 minutes
    max: 100, //limit each IP to 100 requests per windowMs
  })
);
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xss());

//swagger
const swaggerUI = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

// routes
app.get('/', (req, res) =>
  res.send('<h1>Jobs API</h1><br><a href="/api-docs">Documentation</a>')
);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/jobs', authenticationMiddleware, jobsRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port);
  } catch (error) {
    console.log(error);
  }
};

start();
