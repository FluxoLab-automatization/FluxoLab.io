import { Injectable } from '@nestjs/common';

interface PendingResponder {
  resolve: (status: number, body: unknown) => void;
  reject: (error: Error) => void;
}

@Injectable()
export class WorkflowResponseRegistry {
  private readonly responders = new Map<string, PendingResponder>();

  register(correlationId: string, hooks: PendingResponder): void {
    this.responders.set(correlationId, hooks);
  }

  consume(correlationId: string): PendingResponder | null {
    const responder = this.responders.get(correlationId) ?? null;
    if (responder) {
      this.responders.delete(correlationId);
    }
    return responder;
  }
}

