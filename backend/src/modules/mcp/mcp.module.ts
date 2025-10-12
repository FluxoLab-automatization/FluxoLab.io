import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { McpController } from './mcp.controller';
import { McpService } from './mcp.service';
import { McpClient } from './mcp-client.service';
import { McpToolsService } from './mcp-tools.service';

@Module({
  imports: [ConfigModule],
  controllers: [McpController],
  providers: [McpService, McpClient, McpToolsService],
  exports: [McpService, McpClient, McpToolsService],
})
export class McpModule {}
