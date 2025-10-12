import { DatabaseService } from '../../shared/database/database.service';
export interface UserRecord {
    id: string;
    email: string;
    display_name: string;
    avatar_color: string | null;
    password_hash: string;
    created_at: Date;
    updated_at: Date;
    last_login_at: Date | null;
}
export declare class UsersRepository {
    private readonly database;
    constructor(database: DatabaseService);
    private get pool();
    findByEmail(email: string): Promise<UserRecord | null>;
    findById(id: string): Promise<UserRecord | null>;
    createUser({ email, passwordHash, displayName, avatarColor, }: {
        email: string;
        passwordHash: string;
        displayName: string;
        avatarColor: string | null;
    }): Promise<UserRecord>;
    touchLastLogin(id: string): Promise<void>;
}
