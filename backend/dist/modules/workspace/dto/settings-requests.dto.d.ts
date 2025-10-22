declare const USAGE_ALERT_METRICS: readonly ["webhooks", "users", "workflows"];
declare const USAGE_ALERT_CONDITIONS: readonly ["greater_than", "less_than", "equals"];
declare const ALERT_CHANNELS: readonly ["email", "slack", "webhook", "sms"];
declare const ENVIRONMENT_STATUSES: readonly ["active", "inactive"];
declare const SSO_PROVIDERS: readonly ["google", "microsoft", "okta", "auth0"];
declare const LOG_DESTINATIONS: readonly ["elasticsearch", "splunk", "datadog", "custom"];
export declare class CreateUsageAlertDto {
    metric: (typeof USAGE_ALERT_METRICS)[number];
    threshold: number;
    condition: (typeof USAGE_ALERT_CONDITIONS)[number];
    window?: string;
    channel?: (typeof ALERT_CHANNELS)[number];
    enabled?: boolean;
    metadata?: Record<string, unknown>;
}
export declare class UpdateEnvironmentStatusDto {
    status: (typeof ENVIRONMENT_STATUSES)[number];
}
export declare class ConfigureSsoDto {
    provider: (typeof SSO_PROVIDERS)[number];
    clientId: string;
    clientSecret: string;
    enabled: boolean;
}
export declare class ConfigureLdapDto {
    host: string;
    port: number;
    baseDn: string;
    bindDn: string;
    bindPassword: string;
    enabled: boolean;
}
export declare class ConfigureLogDestinationDto {
    destination: (typeof LOG_DESTINATIONS)[number];
    endpoint: string;
    apiKey?: string;
    enabled: boolean;
}
export declare class UpdateProfileDto {
    displayName?: string;
    email?: string;
    avatar?: string;
    timezone?: string;
    language?: string;
}
export declare class UpdateSecuritySettingsDto {
    twoFactorEnabled?: boolean;
    recoveryEmail?: string;
    phoneNumber?: string;
}
export declare class CreateApiKeyDto {
    label?: string;
    scopes?: string[];
    expiresAt?: string;
    metadata?: Record<string, unknown>;
}
export {};
