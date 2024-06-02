const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const { Octokit } = require('@octokit/rest');

const createLogger = require('./utils/logger');
const logger = createLogger('serviceA');

//const { loadState, saveState, state } = require('./services/githubService');
//const { fetchRepositories } = require('./controllers/repositoryController');


const bodyParser = require('body-parser');
//const fs = require('fs');
//const path = require('path');
//const winston = require('winston');

const app = express();
const PORT = process.env.PORT || 5001;
const cors = require('cors'); // Import the CORS middleware


const GITHUB_API_BASE_URL = 'https://api.github.com';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || 'your_github_token_here';

const octokit = new Octokit({
  auth: GITHUB_TOKEN
});

let state = {
  currentBatch: 1,
  repositories: []
};

const DATA_PATH = path.join(__dirname, 'data.json');

const loadState = () => {
  if (fs.existsSync(DATA_PATH)) {
    const rawData = fs.readFileSync(DATA_PATH);
    state = JSON.parse(rawData);
  }
};

const saveState = () => {
  fs.writeFileSync(DATA_PATH, JSON.stringify(state, null, 2));
};

const fetchRepositories = async () => {
  const perPage = 4000;
  const page = state.currentBatch;
  const url = `${GITHUB_API_BASE_URL}/search/repositories?q=stars:>1&sort=stars&order=desc&per_page=${perPage}&page=${page}`;

  try {
    console.log(`Fetching repositories from GitHub: page ${page}`);
    const response = await axios.get(url, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`
      }
    });

    console.log(`Fetched ${response.data.items.length} repositories`);

    state.repositories.push(...response.data.items);
    state.currentBatch++;
    saveState();

    console.log('Repositories fetched and state updated successfully');
  } catch (error) {
    console.error('Error fetching repositories:', error);
  }
};

// Schedule the fetching operation to run at the start of every hour
/*
cron.schedule('0 * * * *', async () => {
  console.log('Starting scheduled repository fetch');
  await fetchRepositories();
});*/

// Use CORS middleware with options
app.use(cors({
  origin: 'http://localhost:3000', // Allow only this origin
  methods: 'GET,POST', // Allow only these methods
  allowedHeaders: 'Content-Type,Authorization', // Allow only these headers
}));

app.get('/repositories', (req, res) => {
  res.json(state.repositories);
});

app.listen(PORT, () => {
  loadState();
  console.log(`Server is running on port ${PORT}`);
});

app.get('/fetch-repositories-manual', async (req, res) => {
    await fetchRepositories();
    res.json({ message: 'Manual fetch triggered' });
});
  

//


/*
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
*/
app.use(bodyParser.json());
/*
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
});*/



// Route to handle log messages
app.post('/log', (req, res) => {
  try {
    const { level, message } = req.body;
    if (!level || !message) {
      res.status(400).send('Bad Request: Missing log level or message');
      return;
    }

    console.log('Received log:', message);
    /*
    if (level == 'info') {
      logger.info(message);
    } else {
      console.warn(`Unknown log level: ${level}, defaulting to info`);
      logger.info(message);
    }*/

    if (logger[level]) {
      logger[level](message);
    } else {
      console.warn(`Unknown log level: ${level}, defaulting to info`);
      logger.info(message);
    }

    res.status(200).send('Log received');
  } catch (error) {
    console.error('Error receiving log:', error);
    res.status(500).send('Internal Server Error');
  }
});


/*
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});*/