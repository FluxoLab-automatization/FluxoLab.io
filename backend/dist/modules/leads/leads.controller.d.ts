import { LeadsService } from './leads.service';
declare class CaptureLeadDto {
    payload: Record<string, any>;
}
export declare class LeadsController {
    private readonly leadsService;
    constructor(leadsService: LeadsService);
    captureLead(leadDto: CaptureLeadDto): {
        message: string;
    };
}
export {};
