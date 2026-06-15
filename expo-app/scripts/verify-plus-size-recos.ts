/**
 * Smoke test: body_glow quiz should yield >= 3 plus-size product recos.
 * Run: npx tsx scripts/verify-plus-size-recos.ts
 */
import { contextFromQuiz, recommendProducts } from '../src/services/recoEngine';

const ctx = contextFromQuiz({ goals: ['body_glow'], outcomes: [], glowUpType: 'skin' } as any);
const recos = recommendProducts(ctx, 8);
const withProduct = recos.filter((r) => r.product);

console.log('persona:', ctx.persona);
console.log('concerns:', ctx.concerns.join(', '));
console.log('recos:', recos.length, 'with product:', withProduct.length);
recos.forEach((r) => console.log(' -', r.ruleId, r.product?.name || '(advice only)', r.because.slice(0, 60)));

if (ctx.persona !== 'us_plus_size') {
  console.error('FAIL: persona should be us_plus_size');
  process.exit(1);
}
if (withProduct.length < 3) {
  console.error('FAIL: expected >= 3 product recos, got', withProduct.length);
  process.exit(1);
}
console.log('PASS');
