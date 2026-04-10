/**
 * Instance Usage for NestJS
 */

import { Injectable, Controller, Get } from '@nestjs/common';

@Injectable()
class ServiceNoErrorHandling {
  async getData() {
    // ❌ No error handling
    return [];
  }
}

@Controller('api')
class ControllerNoErrorHandling {
  @Get()
  async getEndpoint() {
    // ❌ No error handling
    return {};
  }
}

export { ServiceNoErrorHandling, ControllerNoErrorHandling };
