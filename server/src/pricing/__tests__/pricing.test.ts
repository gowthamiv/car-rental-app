import { SedanPricing } from '../SedanPricing';
import { SuvPricing } from '../SuvPricing';
import { VanPricing } from '../VanPricing';
import { PickupPricing } from '../PickupPricing';

/*describe('SedanPricing', () => {
  it('charges $20/day under 10 days', () => {
    expect(new SedanPricing().calculatePrice(5)).toBe(100);
  });
  it('charges $15/day at 10+ days', () => {
    expect(new SedanPricing().calculatePrice(12)).toBe(180);
  });
});

describe('SuvPricing', () => {
  it('adds mileage cost to the base rate', () => {
    expect(new SuvPricing().calculatePrice(8, 40)).toBe(280);
  });
  it('defaults to zero mileage cost if none supplied', () => {
    expect(new SuvPricing().calculatePrice(8)).toBe(120);
  });
});

describe('VanPricing', () => {
  it('charges a flat $22/day', () => {
    expect(new VanPricing().calculatePrice(6)).toBe(132);
  });
});

describe('PickupPricing', () => {
  it('charges a flat $30/day', () => {
    expect(new PickupPricing().calculatePrice(3)).toBe(90);
  });
});*/