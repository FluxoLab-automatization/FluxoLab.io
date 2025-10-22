import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

const USAGE_ALERT_METRICS = ['webhooks', 'users', 'workflows'] as const;
const USAGE_ALERT_CONDITIONS = ['greater_than', 'less_than', 'equals'] as const;
const ALERT_CHANNELS = ['email', 'slack', 'webhook', 'sms'] as const;
const ENVIRONMENT_STATUSES = ['active', 'inactive'] as const;
const SSO_PROVIDERS = ['google', 'microsoft', 'okta', 'auth0'] as const;
const LOG_DESTINATIONS = ['elasticsearch', 'splunk', 'datadog', 'custom'] as const;

export class CreateUsageAlertDto {
  @IsIn(USAGE_ALERT_METRICS)
  metric: (typeof USAGE_ALERT_METRICS)[number];

  @Type(() => Number)
  @IsNumber()
  threshold: number;

  @IsIn(USAGE_ALERT_CONDITIONS)
  condition: (typeof USAGE_ALERT_CONDITIONS)[number];

  @IsOptional()
  @IsString()
  window?: string;

  @IsOptional()
  @IsIn(ALERT_CHANNELS)
  channel?: (typeof ALERT_CHANNELS)[number];

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class UpdateEnvironmentStatusDto {
  @IsIn(ENVIRONMENT_STATUSES)
  status: (typeof ENVIRONMENT_STATUSES)[number];
}

export class ConfigureSsoDto {
  @IsIn(SSO_PROVIDERS)
  provider: (typeof SSO_PROVIDERS)[number];

  @IsString()
  clientId: string;

  @IsString()
  clientSecret: string;

  @IsBoolean()
  enabled: boolean;
}

export class ConfigureLdapDto {
  @IsString()
  host: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  port: number;

  @IsString()
  baseDn: string;

  @IsString()
  bindDn: string;

  @IsString()
  bindPassword: string;

  @IsBoolean()
  enabled: boolean;
}

export class ConfigureLogDestinationDto {
  @IsIn(LOG_DESTINATIONS)
  destination: (typeof LOG_DESTINATIONS)[number];

  @IsString()
  endpoint: string;

  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsBoolean()
  enabled: boolean;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  language?: string;
}

export class UpdateSecuritySettingsDto {
  @IsOptional()
  @IsBoolean()
  twoFactorEnabled?: boolean;

  @IsOptional()
  @IsString()
  recoveryEmail?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}

export class CreateApiKeyDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scopes?: string[];

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
