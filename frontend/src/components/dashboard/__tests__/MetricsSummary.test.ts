import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import MetricsSummary from '../MetricsSummary.vue';

describe('MetricsSummary', () => {
  it('renderiza cards com métricas', () => {
    const wrapper = mount(MetricsSummary, {
      props: {
        metrics: {
          totalProjects: 4,
          totalWebhooks: 12,
          totalEvents: 256,
        },
      },
    });

    const text = wrapper.text();
    expect(text).toContain('4');
    expect(text).toContain('12');
    expect(text).toContain('256');
    expect(text).toContain('Projetos ativos');
    expect(text).toContain('Webhooks configurados');
    expect(text).toContain('Eventos recebidos');
  });
});
