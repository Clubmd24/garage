import { encryptJSON, decryptJSON } from '../lib/cryptoVault.js';
import { normalizeItems } from '../scrapers/ad360/normalize.js';

describe('AD360 Integration', () => {
  test('cryptoVault should encrypt and decrypt data correctly', () => {
    const testData = { test: 'data', number: 123 };
    const encrypted = encryptJSON(testData);
    const decrypted = decryptJSON(encrypted);
    
    expect(decrypted).toEqual(testData);
    expect(typeof encrypted).toBe('string');
    expect(encrypted).not.toContain('test');
    expect(encrypted).not.toContain('data');
  });

  test('normalizeItems should handle various input formats', () => {
    const testItems = [
      {
        brand: 'VAG',
        partNumber: 'ABC-123',
        description: 'Test Part',
        price: '10.50'
      },
      {
        marca: 'VOLKSWAGEN GENUINE',
        reference: 'XYZ-789',
        desc: 'Another Part',
        pvp: '25.00'
      }
    ];
    
    const normalized = normalizeItems(testItems);
    
    expect(normalized).toHaveLength(2);
    expect(normalized[0].brand).toBe('Volkswagen'); // Should alias VAG
    expect(normalized[0].partNumber).toBe('ABC-123');
    expect(normalized[0].price.amount).toBe(10.5);
    expect(normalized[0].price.currency).toBe('EUR');
    
    expect(normalized[1].brand).toBe('Volkswagen'); // Should alias VOLKSWAGEN GENUINE
    expect(normalized[1].partNumber).toBe('XYZ-789');
    expect(normalized[1].price.amount).toBe(25.0);
  });

  test('normalizeItems should deduplicate based on brand and part number', () => {
    const testItems = [
      {
        brand: 'VAG',
        partNumber: 'ABC-123',
        description: 'Test Part 1',
        price: '10.50'
      },
      {
        brand: 'VAG',
        partNumber: 'ABC-123',
        description: 'Test Part 2',
        price: '10.50'
      },
      {
        brand: 'BMW',
        partNumber: 'ABC-123',
        description: 'Different Brand',
        price: '15.00'
      }
    ];
    
    const normalized = normalizeItems(testItems);
    
    // Should deduplicate VAG ABC-123, but keep BMW ABC-123 as separate
    expect(normalized).toHaveLength(2);
    
    const vagItems = normalized.filter(item => item.brand === 'Volkswagen');
    const bmwItems = normalized.filter(item => item.brand === 'BMW');
    
    expect(vagItems).toHaveLength(1);
    expect(bmwItems).toHaveLength(1);
  });
}); 