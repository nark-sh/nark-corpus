/**
 * Proper NestJS Error Handling
 * Should produce 0 violations
 */

import { Injectable, Controller, Get, HttpException, HttpStatus } from '@nestjs/common';

// ✅ Injectable with error handling
@Injectable()
export class UserService {
  constructor() {
    try {
      // Initialization logic
    } catch (error) {
      console.error('Service initialization failed:', error);
      throw error;
    }
  }
  
  async getUsers() {
    try {
      // Logic
      return [];
    } catch (error) {
      throw new HttpException('Failed to get users', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

// ✅ Controller with error handling
@Controller('users')
export class UserController {
  @Get()
  async findAll() {
    try {
      // Logic
      return [];
    } catch (error) {
      throw new HttpException('Request failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
