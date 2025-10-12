import { Controller, Get } from '@nestjs/common';

@Controller('api')
export class AppController {
  @Get()
  getRoot(): string {
    return 'Hello World!';
  }
}
