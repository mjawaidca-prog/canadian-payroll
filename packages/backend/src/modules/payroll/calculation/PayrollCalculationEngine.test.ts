import { PayrollCalculationEngine, PayrollCalculationInput } from './PayrollCalculationEngine';
import { TaxTable } from '../../../database/entities';

// Mock 2024 tax table for Ontario
const mockOntarioTaxTable2024: TaxTable = {
  id: 'test-1',
  organizationId: null,
  taxYear: 2024,
  province: 'ON',
  federalBrackets: [
    { min: 0, max: 55867, rate: 0.15 },
    { min: 55867, max: 111733, rate: 0.205 },
    { min: 111733, max: 173205, rate: 0.26 },
    { min: 173205, max: 246752, rate: 0.29 },
    { min: 246752, max: null, rate: 0.33 },
  ],
  provincialBrackets: [
    { min: 0, max: 51446, rate: 0.0505 },
    { min: 51446, max: 102894, rate: 0.0915 },
    { min: 102894, max: 150000, rate: 0.1116 },
    { min: 150000, max: 220708, rate: 0.1216 },
    { min: 220708, max: null, rate: 0.1316 },
  ],
  basicPersonalAmount: 15705,
  provincialBasicPersonalAmount: 11981,
  cppParameters: {
    year: 2024,
    rate: 0.0595,
    maxContribution: 3867.5,
    basicExemption: 3500,
    maxEarnings: 68500,
  },
  eiParameters: {
    year: 2024,
    rate: 0.0163,
    maxContribution: 1049.12,
    maxEarnings: 63200,
  },
  source: 'CRA 2024',
  version: 'A',
  effectiveDate: new Date('2024-01-01'),
  expiryDate: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const createInput = (overrides?: Partial<PayrollCalculationInput>): PayrollCalculationInput => ({
  grossAmount: 3000,
  taxYear: 2024,
  province: 'ON',
  federalTaxExemptions: 1,
  provincialTaxExemptions: 1,
  ytdGross: 0,
  ytdCPP: 0,
  ytdEI: 0,
  ytdFederalTax: 0,
  ytdProvincialTax: 0,
  taxTable: mockOntarioTaxTable2024,
  ...overrides,
});

describe('PayrollCalculationEngine', () => {
  describe('CPP Calculation', () => {
    test('should calculate CPP correctly for standard employee', () => {
      const input = createInput({ grossAmount: 4000 });
      const result = PayrollCalculationEngine.calculate(input);

      // Pensionable earnings: 4000 - 3500 = 500
      // CPP: 500 * 5.95% = 29.75
      expect(result.cppContribution).toBeCloseTo(29.75, 2);
    });

    test('should not charge CPP if gross is below basic exemption', () => {
      const input = createInput({ grossAmount: 3000 }); // Below 3500 exemption
      const result = PayrollCalculationEngine.calculate(input);

      expect(result.cppContribution).toBe(0);
    });

    test('should respect CPP maximum annual contribution', () => {
      const input = createInput({
        grossAmount: 5000,
        ytdCPP: 3800, // Already near maximum (3867.50)
      });
      const result = PayrollCalculationEngine.calculate(input);

      // Total CPP should not exceed 3867.50
      expect(result.ytdCPP).toBeLessThanOrEqual(3867.5);
    });

    test('should not charge CPP if YTD gross exceeds maximum earnings', () => {
      const input = createInput({
        grossAmount: 2000,
        ytdGross: 68500, // Already at maximum
      });
      const result = PayrollCalculationEngine.calculate(input);

      expect(result.cppContribution).toBe(0);
    });

    test('should accumulate CPP in YTD', () => {
      const input = createInput({
        grossAmount: 4000,
        ytdGross: 10000,
        ytdCPP: 290.75, // Already accumulated
      });
      const result = PayrollCalculationEngine.calculate(input);

      expect(result.ytdCPP).toBeCloseTo(290.75 + 29.75, 1);
    });
  });

  describe('EI Calculation', () => {
    test('should calculate EI correctly', () => {
      const input = createInput({ grossAmount: 3000 });
      const result = PayrollCalculationEngine.calculate(input);

      // EI: 3000 * 1.63% = 48.90
      expect(result.eiContribution).toBeCloseTo(48.9, 1);
    });

    test('should respect EI maximum annual contribution', () => {
      const input = createInput({
        grossAmount: 3000,
        ytdGross: 63000, // Near maximum earnings
        ytdEI: 1000, // Already near maximum (1049.12)
      });
      const result = PayrollCalculationEngine.calculate(input);

      expect(result.ytdEI).toBeLessThanOrEqual(1049.12);
    });

    test('should not charge EI if YTD earnings exceed maximum', () => {
      const input = createInput({
        grossAmount: 2000,
        ytdGross: 63200, // Already at maximum
      });
      const result = PayrollCalculationEngine.calculate(input);

      expect(result.eiContribution).toBe(0);
    });

    test('should accumulate EI in YTD', () => {
      const input = createInput({
        grossAmount: 3000,
        ytdGross: 10000,
        ytdEI: 100,
      });
      const result = PayrollCalculationEngine.calculate(input);

      expect(result.ytdEI).toBeCloseTo(100 + 48.9, 1);
    });
  });

  describe('Federal Tax Calculation', () => {
    test('should calculate federal tax for low income', () => {
      const input = createInput({ grossAmount: 2000 });
      const result = PayrollCalculationEngine.calculate(input);

      // Annual equivalent: 2000 * 26 = 52,000
      // Taxable: 52,000 - 15,705 = 36,295
      // Tax at 15%: 36,295 * 15% = 5,444.25
      // Biweekly: 5,444.25 / 26 = 209.39
      // Less credits (basic personal, CPP, EI)
      expect(result.federalTax).toBeGreaterThan(0);
      expect(result.federalTax).toBeLessThan(250);
    });

    test('should apply basic personal amount credit', () => {
      const input = createInput({ grossAmount: 1000 });
      const result = PayrollCalculationEngine.calculate(input);

      // Low income should result in minimal tax
      expect(result.federalTax).toBeLessThan(50);
    });

    test('should accumulate federal tax in YTD', () => {
      const input = createInput({
        grossAmount: 3000,
        ytdGross: 10000,
        ytdFederalTax: 500,
      });
      const result = PayrollCalculationEngine.calculate(input);

      expect(result.ytdFederalTax).toBeGreaterThan(500);
    });

    test('should calculate federal tax for higher income bracket', () => {
      const input = createInput({ grossAmount: 6000 }); // Annual: 156,000
      const result = PayrollCalculationEngine.calculate(input);

      // Higher income should result in higher tax
      expect(result.federalTax).toBeGreaterThan(300);
    });
  });

  describe('Provincial Tax Calculation', () => {
    test('should calculate Ontario provincial tax', () => {
      const input = createInput({ grossAmount: 2000 });
      const result = PayrollCalculationEngine.calculate(input);

      // Should have provincial tax
      expect(result.provincialTax).toBeGreaterThan(0);
    });

    test('should accumulate provincial tax in YTD', () => {
      const input = createInput({
        grossAmount: 3000,
        ytdGross: 10000,
        ytdProvincialTax: 200,
      });
      const result = PayrollCalculationEngine.calculate(input);

      expect(result.ytdProvincialTax).toBeGreaterThan(200);
    });
  });

  describe('Net Pay Calculation', () => {
    test('should calculate correct net pay', () => {
      const input = createInput({ grossAmount: 3000 });
      const result = PayrollCalculationEngine.calculate(input);

      const expectedNet =
        result.grossAmount -
        result.cppContribution -
        result.eiContribution -
        result.federalTax -
        result.provincialTax;

      expect(result.netAmount).toBeCloseTo(expectedNet, 2);
    });

    test('net pay should be less than gross', () => {
      const input = createInput({ grossAmount: 3000 });
      const result = PayrollCalculationEngine.calculate(input);

      expect(result.netAmount).toBeLessThan(result.grossAmount);
    });

    test('should handle zero gross pay', () => {
      const input = createInput({ grossAmount: 0 });
      const result = PayrollCalculationEngine.calculate(input);

      expect(result.netAmount).toBe(0);
    });
  });

  describe('Year-to-Date Accumulators', () => {
    test('should accumulate gross correctly', () => {
      const input = createInput({
        grossAmount: 3000,
        ytdGross: 10000,
      });
      const result = PayrollCalculationEngine.calculate(input);

      expect(result.ytdGross).toBeCloseTo(13000, 2);
    });

    test('should accumulate all components', () => {
      const input = createInput({
        grossAmount: 3000,
        ytdGross: 30000,
        ytdCPP: 1000,
        ytdEI: 500,
        ytdFederalTax: 3000,
        ytdProvincialTax: 1500,
      });
      const result = PayrollCalculationEngine.calculate(input);

      expect(result.ytdGross).toBeCloseTo(33000, 2);
      expect(result.ytdCPP).toBeGreaterThan(1000);
      expect(result.ytdEI).toBeGreaterThan(500);
      expect(result.ytdFederalTax).toBeGreaterThan(3000);
      expect(result.ytdProvincialTax).toBeGreaterThan(1500);
    });
  });

  describe('Real-world Scenarios', () => {
    test('Scenario 1: Annual salary $50,000 biweekly pay', () => {
      const biweeklyGross = 50000 / 26; // ~1923.08

      const input = createInput({
        grossAmount: biweeklyGross,
        ytdGross: 0,
      });
      const result = PayrollCalculationEngine.calculate(input);

      // Verify reasonable values
      expect(result.cppContribution).toBeLessThan(30); // Below exemption
      expect(result.eiContribution).toBeGreaterThan(30);
      expect(result.eiContribution).toBeLessThan(35);
      expect(result.federalTax).toBeGreaterThan(100);
      expect(result.federalTax).toBeLessThan(200);
      expect(result.netAmount).toBeGreaterThan(1500);
      expect(result.netAmount).toBeLessThan(1800);
    });

    test('Scenario 2: Annual salary $100,000 biweekly pay', () => {
      const biweeklyGross = 100000 / 26; // ~3846.15

      const input = createInput({
        grossAmount: biweeklyGross,
        ytdGross: 0,
      });
      const result = PayrollCalculationEngine.calculate(input);

      // Verify reasonable values
      expect(result.cppContribution).toBeGreaterThan(150);
      expect(result.cppContribution).toBeLessThan(200);
      expect(result.eiContribution).toBeGreaterThan(60);
      expect(result.federalTax).toBeGreaterThan(500);
      expect(result.provincialTax).toBeGreaterThan(200);
      expect(result.netAmount).toBeGreaterThan(2700);
      expect(result.netAmount).toBeLessThan(3000);
    });

    test('Scenario 3: Year-end pay run (accumulator test)', () => {
      const payrunCount = 25; // 25 pay runs completed
      const biweeklyGross = 3000;

      let input = createInput({ grossAmount: biweeklyGross });

      // Simulate 25 pay runs
      for (let i = 0; i < payrunCount; i++) {
        const result = PayrollCalculationEngine.calculate(input);
        input = createInput({
          grossAmount: biweeklyGross,
          ytdGross: result.ytdGross,
          ytdCPP: result.ytdCPP,
          ytdEI: result.ytdEI,
          ytdFederalTax: result.ytdFederalTax,
          ytdProvincialTax: result.ytdProvincialTax,
        });
      }

      const finalResult = PayrollCalculationEngine.calculate(input);

      // Verify annual totals are reasonable
      expect(finalResult.ytdGross).toBeCloseTo(75000, -2); // 3000 * 25
      expect(finalResult.ytdCPP).toBeGreaterThan(1000);
      expect(finalResult.ytdCPP).toBeLessThanOrEqual(3867.5); // Max CPP
      expect(finalResult.ytdEI).toBeGreaterThan(500);
      expect(finalResult.ytdEI).toBeLessThanOrEqual(1049.12); // Max EI
    });
  });

  describe('Edge Cases', () => {
    test('should handle very high income', () => {
      const input = createInput({ grossAmount: 10000 });
      const result = PayrollCalculationEngine.calculate(input);

      expect(result.netAmount).toBeGreaterThan(0);
      expect(result.netAmount).toBeLessThan(result.grossAmount);
    });

    test('should handle decimal precision correctly', () => {
      const input = createInput({ grossAmount: 1234.56 });
      const result = PayrollCalculationEngine.calculate(input);

      // Total should equal gross minus deductions
      const totalDeductions =
        result.cppContribution +
        result.eiContribution +
        result.federalTax +
        result.provincialTax;

      expect(result.netAmount).toBeCloseTo(
        result.grossAmount - totalDeductions,
        2
      );
    });

    test('should handle leap year dates', () => {
      // 2024 is a leap year
      const input = createInput({
        taxYear: 2024,
        grossAmount: 3000,
      });
      const result = PayrollCalculationEngine.calculate(input);

      expect(result.netAmount).toBeGreaterThan(0);
    });
  });

  describe('Tax Table Variations', () => {
    test('should work with different provincial tax brackets', () => {
      const albertaTaxTable: TaxTable = {
        ...mockOntarioTaxTable2024,
        province: 'AB',
        provincialBrackets: [
          { min: 0, max: 142292, rate: 0.1 },
          { min: 142292, max: 284585, rate: 0.12 },
          { min: 284585, max: 426878, rate: 0.13 },
          { min: 426878, max: 639655, rate: 0.14 },
          { min: 639655, max: null, rate: 0.15 },
        ],
        provincialBasicPersonalAmount: 21885,
      };

      const input = createInput({
        grossAmount: 3000,
        province: 'AB',
        taxTable: albertaTaxTable,
      });

      const result = PayrollCalculationEngine.calculate(input);

      // Alberta has different tax rates, should result in different tax
      expect(result.provincialTax).toBeGreaterThan(0);
    });
  });
});
