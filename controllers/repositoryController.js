const axios = require('axios');
const { state, saveState } = require('../services/githubService');
const { logger } = require('../utils/logger');

const GITHUB_API_BASE_URL = 'https://api.github.com';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || 'your_github_token_here';

const fetchRepositories = async () => {
  const perPage = 4000;
  const page = state.currentBatch;
  const url = `${GITHUB_API_BASE_URL}/search/repositories?q=stars:>1&sort=stars&order=desc&per_page=${perPage}&page=${page}`;

  try {
    logger.info(`Fetching repositories from GitHub: page ${page}`);
    const response = await axios.get(url, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`
      }
    });

    logger.info(`Fetched ${response.data.items.length} repositories`);

    state.repositories.push(...response.data.items);
    state.currentBatch++;
    saveState();

    logger.info('Repositories fetched and state updated successfully');
  } catch (error) {
    logger.error('Error fetching repositories:', error);
  }
};

module.exports = {
  fetchRepositories,
};
