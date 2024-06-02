  const fs = require('fs');
  const winston = require('winston');
  const path = require('path');

  const logDirectory = path.join(__dirname, 'logs');

  // Create log directory if it does not exist
  if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
  }

  const createLogger = (serviceName) => {
    return winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.label({ label: serviceName }),
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: path.join(logDirectory, 'error.log'), level: 'error' }),
        new winston.transports.File({ filename: path.join(logDirectory, 'combined.log') }),
        new winston.transports.Console({
          format: winston.format.simple(),
        }),
      ],
    });
} 

module.exports = createLogger;
