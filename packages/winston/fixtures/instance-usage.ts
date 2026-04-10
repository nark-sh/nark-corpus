/**
 * Instance Usage for winston
 */

import winston from 'winston';

class LoggerService {
  private logger: winston.Logger;
  
  constructor() {
    // ⚠️ No error handling
    this.logger = winston.createLogger({
      transports: [new winston.transports.File({ filename: 'app.log' })]
    });
  }
  
  log(message: string) {
    this.logger.info(message); // ⚠️ No error handling
  }
}

const logger = winston.createLogger({
  transports: [new winston.transports.Console()]
}); // ⚠️ No error listeners

export { LoggerService, logger };
