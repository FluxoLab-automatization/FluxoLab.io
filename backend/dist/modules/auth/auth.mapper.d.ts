import { UserRecord } from './users.repository';
import { AuthenticatedUser, PresentedUser } from './auth.types';
export declare function mapToAuthenticatedUser(record: UserRecord): AuthenticatedUser;
export declare function mapToPresentedUser(record: UserRecord): PresentedUser;
export declare function presentAuthenticatedUser(user: AuthenticatedUser): PresentedUser;
