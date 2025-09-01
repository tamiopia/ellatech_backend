import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Welcome endpoint' })
  @ApiResponse({ status: 200, description: 'Welcome message' })
  getHello(): string {
    return 'hello the Backend Service  is running well !';
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service health status' })
  healthCheck() {
    return { 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      version: 'NestJS v11',
      message: 'Service is healthy and ready'
    };
  }
}