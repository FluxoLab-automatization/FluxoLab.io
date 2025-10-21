import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { LeadsService } from './leads.service';

// DTO para validação básica do payload do lead
class CaptureLeadDto {
  payload: Record<string, any>;
}

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @HttpCode(202) // Retorna "Accepted" para indicar que a requisição foi aceita para processamento
  captureLead(@Body() leadDto: CaptureLeadDto) {
    this.leadsService.captureLead(leadDto.payload);
    return { message: 'Lead accepted for processing.' };
  }
}
