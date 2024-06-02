const fs = require('fs');
const path = require('path');
const { logger } = require('../utils/logger');

const DATA_PATH = path.join(__dirname, '..', 'data.json');

let state = {
  currentBatch: 1,
  repositories: []
};

const loadState = () => {
  if (fs.existsSync(DATA_PATH)) {
    const rawData = fs.readFileSync(DATA_PATH);
    state = JSON.parse(rawData);
    logger.info('State loaded from data.json');
  }
};

const saveState = () => {
  fs.writeFileSync(DATA_PATH, JSON.stringify(state, null, 2));
  logger.info('State saved to data.json');
};

module.exports = {
  state,
  loadState,
  saveState,
};
