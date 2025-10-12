import { DatabaseService } from '../../shared/database/database.service';
export declare class UserSecurityRepository {
    private readonly database;
    constructor(database: DatabaseService);
    private get pool();
    ensureSecurityRow(userId: string): Promise<void>;
}
