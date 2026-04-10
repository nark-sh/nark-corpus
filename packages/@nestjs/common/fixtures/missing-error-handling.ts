/**
 * Missing NestJS Error Handling
 * Should produce ERROR violations
 */

import { Injectable, Controller, Get } from '@nestjs/common';

// ❌ No error handling in constructor
@Injectable()
export class UserServiceNoErrorHandling {
  constructor() {
    // Initialization without error handling
  }
  
  // ❌ No error handling
  async getUsers() {
    return [];
  }
}

// ❌ Controller without error handling
@Controller('users')
export class UserControllerNoErrorHandling {
  @Get()
  async findAll() {
    // ❌ Async operation without error handling
    return [];
  }
}
