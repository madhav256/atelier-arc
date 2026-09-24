import { describe, it, expect } from 'vitest';
import { PRICE_TILE_BANDS, bandForPriceParam, applyPriceParam } from './priceBands';

describe('browse-by-price tiles', () => {
  it('maps every home-page tile index to its price band', () => {
    expect(PRICE_TILE_BANDS).toHaveLength(5);
    expect(bandForPriceParam('0')).toEqual({ min: '', max: '50000' });
    expect(bandForPriceParam('1')).toEqual({ min: '50000', max: '100000' });
    expect(bandForPriceParam('2')).toEqual({ min: '100000', max: '500000' });
    expect(bandForPriceParam('3')).toEqual({ min: '500000', max: '1000000' });
    expect(bandForPriceParam('4')).toEqual({ min: '1000000', max: '' });
  });

  it('turns ?price= into the min/max params the API filters on', () => {
    const out = applyPriceParam(new URLSearchParams('price=2&sort=newest'));
    expect(out.get('price')).toBeNull();
    expect(out.get('minPrice')).toBe('100000');
    expect(out.get('maxPrice')).toBe('500000');
    expect(out.get('sort')).toBe('newest');
  });

  it('supports open-ended bands', () => {
    const under = applyPriceParam(new URLSearchParams('price=0'));
    expect(under.get('minPrice')).toBeNull();
    expect(under.get('maxPrice')).toBe('50000');
    const over = applyPriceParam(new URLSearchParams('price=4'));
    expect(over.get('minPrice')).toBe('1000000');
    expect(over.get('maxPrice')).toBeNull();
  });

  it('drops invalid price params without filtering', () => {
    for (const bad of ['9', '-1', 'abc', '1.5']) {
      const out = applyPriceParam(new URLSearchParams(`price=${bad}`));
      expect(out.get('price')).toBeNull();
      expect(out.get('minPrice')).toBeNull();
      expect(out.get('maxPrice')).toBeNull();
    }
  });
});
