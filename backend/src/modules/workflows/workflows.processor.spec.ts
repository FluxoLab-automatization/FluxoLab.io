import type { Job } from 'bull';
import { WorkflowsProcessor } from './workflows.processor';
import type { WhatsappService } from '../whatsapp/whatsapp.service';
import type { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../../config/env.validation';

describe('WorkflowsProcessor', () => {
  const sendMessage = jest.fn();
  const whatsappService = {
    sendMessage,
  } as unknown as WhatsappService;

  const configGet = jest.fn();
  const configService = {
    get: configGet,
  } as unknown as ConfigService<AppConfig, true>;

  const processor = new WorkflowsProcessor(whatsappService, configService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses fallback phone when payload is missing', async () => {
    configGet.mockReturnValue('55 (31) 9999-9999');

    const job = {
      id: '1',
      name: 'lead.captured',
      data: { payload: { name: 'Ada Lovelace' } },
    } as unknown as Job;

    await processor.handleLeadCaptured(job);

    expect(sendMessage).toHaveBeenCalledTimes(1);
    expect(sendMessage).toHaveBeenCalledWith(
      '553199999999',
      expect.stringContaining('Ada Lovelace'),
    );
  });

  it('sanitizes payload phone numbers before sending', async () => {
    configGet.mockReturnValue(null);
    const job = {
      id: '2',
      name: 'lead.captured',
      data: { payload: { phone: '+55 (31) 98888-7777', name: 'Grace' } },
    } as unknown as Job;

    await processor.handleLeadCaptured(job);

    expect(sendMessage).toHaveBeenCalledWith(
      '5531988887777',
      expect.stringContaining('Grace'),
    );
  });
});
