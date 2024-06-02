const express = require('express');
const cron = require('node-cron');
const { loadState, saveState, state } = require('./services/githubService');
const { fetchRepositories } = require('./controllers/repositoryController');
const { logger } = require('./utils/logger');

const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const winston = require('winston');

const app = express();
const PORT = process.env.PORT || 5000;

app.get('/repositories', (req, res) => {
  res.json(state.repositories);
});

app.get('/fetch-repositories-manual', async (req, res) => {
  await fetchRepositories();
  res.json({ message: 'Manual fetch triggered' });
});

app.listen(PORT, () => {
  //loadState();
  //logger.info('Starting scheduled repository fetch');
  //logger.info(`Server is running on port ${PORT}`);
});

// Schedule the fetching operation to run at the start of every hour
cron.schedule('0 * * * *', async () => {
  logger.info('Starting scheduled repository fetch');
  await fetchRepositories();
});

app.use(bodyParser.json());

app.post('/log', (req, res) => {
  const { level, message } = req.body;
  logger.info(message);
  if (logger[level]) {
    logger[level](message);
    logger.info(message);
  } else {
    logger.info(message);
  }
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});