import { OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';
export declare class DatabaseService implements OnModuleDestroy {
    private readonly pool;
    constructor(pool: Pool);
    getPool(): Pool;
    query(text: string, params?: any[]): Promise<any[]>;
    onModuleDestroy(): Promise<void>;
}
