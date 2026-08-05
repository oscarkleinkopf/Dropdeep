import { describe, expect, it } from 'vitest';
import {
  AUDISIO_LAUNCH_BUDGET_BEGINNER_USD,
  AUDISIO_LAUNCH_BUDGET_EXPERIENCED_USD,
  AUDISIO_TEST_AD_BUDGET_USD,
  AUDISIO_TEST_MIN_LEARNING_ORDERS,
} from '../src/config/audisioRules.js';
import {
  projectAudisioTestBudgetPlan,
  projectCpaFromCpc,
  runMonteCarloSimulation,
} from '../src/research/montecarlo.js';

describe('projectCpaFromCpc', () => {
  it('divides CPC by conversion fraction', () => {
    expect(projectCpaFromCpc(0.15, 2.5)).toBe(6);
    expect(projectCpaFromCpc(0.8, 2)).toBe(40);
  });
});

describe('projectAudisioTestBudgetPlan', () => {
  it('projects runway for $300 at beginner and experienced pace', () => {
    const beginner = projectAudisioTestBudgetPlan({
      dailyBudget: AUDISIO_LAUNCH_BUDGET_BEGINNER_USD,
      cpc: 0.15,
      convRate: 2.5,
      aov: 40,
      cost: 10,
    });
    expect(beginner.totalTestBudgetUsd).toBe(AUDISIO_TEST_AD_BUDGET_USD);
    expect(beginner.daysRunway).toBe(30);
    expect(beginner.projectedCpaUsd).toBe(6);
    expect(beginner.estimatedOrdersFromTest).toBe(50);
    expect(beginner.methodNote).toMatch(/presupuesto de testeo del método/i);
    expect(beginner.autofinanceNote).toMatch(/autofinanci/i);
    expect(beginner.presets.experiencedDays).toBe(
      AUDISIO_TEST_AD_BUDGET_USD / AUDISIO_LAUNCH_BUDGET_EXPERIENCED_USD,
    );
    expect(beginner.flags.some((f) => f.code === 'low_learning')).toBe(false);
  });

  it('warns when CPA burns the test pool without enough orders', () => {
    const plan = projectAudisioTestBudgetPlan({
      dailyBudget: 10,
      cpc: 2,
      convRate: 1,
      aov: 40,
      cost: 10,
    });
    // CPA = 200; orders from $300 = 1.5
    expect(plan.projectedCpaUsd).toBe(200);
    expect(plan.estimatedOrdersFromTest).toBeLessThan(AUDISIO_TEST_MIN_LEARNING_ORDERS);
    expect(plan.flags.some((f) => f.code === 'low_learning')).toBe(true);
    expect(plan.flags.some((f) => f.code === 'cpa_too_high')).toBe(true);
    expect(plan.flags.some((f) => f.code === 'cpa_above_margin')).toBe(true);
  });
});

describe('runMonteCarloSimulation', () => {
  it('defaults daily budget to Audisio beginner pace and attaches testPlan', () => {
    const res = runMonteCarloSimulation({
      cpc: 0.15,
      convRate: 2.5,
      aov: 39.99,
      cost: 12,
    });
    expect(res.testPlan.dailyBudgetUsd).toBe(AUDISIO_LAUNCH_BUDGET_BEGINNER_USD);
    expect(res.testPlan.daysRunway).toBe(30);
    expect(typeof res.winRate).toBe('number');
    expect(res.p50).toHaveProperty('profit');
  });
});
