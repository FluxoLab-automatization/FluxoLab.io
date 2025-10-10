process.env.DATABASE_URL =
  process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/fluxolab_test';

const test = require('node:test');
const assert = require('node:assert/strict');

const overviewService = require('../services/overview');

const { normalizeProjects, normalizeActivities, normalizeWebhooks, buildOnboardingBlocks } =
  overviewService.__test__;

test('normalizeProjects returns fallback templates when empty', () => {
  const projects = normalizeProjects([]);
  assert.equal(projects.length >= 2, true);
  assert.ok(
    projects.some((project) => project.title.includes('Boas-vindas')),
    'fallback should include welcome template'
  );
});

test('normalizeProjects maps real rows', () => {
  const now = new Date().toISOString();
  const rows = [
    {
      id: '123',
      title: 'Fluxo Demo',
      status: 'draft',
      metadata: { description: 'Teste' },
      created_at: now,
      updated_at: now,
    },
  ];
  const projects = normalizeProjects(rows);
  assert.equal(projects[0].title, 'Fluxo Demo');
  assert.equal(projects[0].metadata.description, 'Teste');
});

test('normalizeActivities fallback contains guiding actions', () => {
  const activities = normalizeActivities([]);
  assert.ok(
    activities.some((activity) => activity.action.includes('primeiros passos')),
    'fallback should contain getting started tip'
  );
});

test('normalizeWebhooks fallback returns sample event', () => {
  const events = normalizeWebhooks([]);
  assert.equal(events.length, 1);
  assert.equal(events[0].type, 'meta_verification');
});

test('buildOnboardingBlocks marks checklist as completed when project exists', () => {
  const blocksWithProjects = buildOnboardingBlocks(1);
  assert.equal(blocksWithProjects[0].completed, true);

  const blocksWithout = buildOnboardingBlocks(0);
  assert.equal(blocksWithout[0].completed, false);
});
