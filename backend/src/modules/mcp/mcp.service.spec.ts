import { McpService, type WorkflowDefinition } from './mcp.service';

describe('McpService utility methods', () => {
  const config = { get: jest.fn() };
  const mcpClient = {
    connect: jest.fn(),
    disconnect: jest.fn(),
  };
  const mcpTools = {
    analyzeWorkflow: jest.fn(),
  };

  const service = new McpService(
    config as any,
    mcpClient as any,
    mcpTools as any,
  );

  it('optimizes workflow by dropping disabled nodes and dangling edges', async () => {
    const definition: WorkflowDefinition = {
      nodes: [
        { id: 'n1', type: 'start', disabled: true },
        { id: 'n2', type: 'step' },
      ],
      edges: [
        { from: 'n1', to: 'n2' },
        { from: 'n2', to: 'n3' },
      ],
    };

    const { optimized, changes } = await service.optimizeWorkflow(definition);

    expect(changes).toContain('Removed disabled nodes');
    expect(changes).toContain('Removed dangling edges');
    expect(optimized.nodes).toHaveLength(1);
    expect(optimized.edges).toHaveLength(0);
  });

  it('simulates workflow execution and produces logs', async () => {
    const definition: WorkflowDefinition = {
      nodes: [
        { id: 'start', type: 'trigger' },
        { id: 'next', type: 'action' },
      ],
      edges: [{ from: 'start', to: 'next' }],
    };

    const result = await service.simulateWorkflow(definition, { sample: true });

    expect(result.logs).toHaveLength(4);
    expect(result.output).toEqual({
      ok: true,
      inputsEcho: { sample: true },
    });
  });
});
