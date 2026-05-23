import { TaxTable, TaxBracket } from '../../../database/entities';
import Decimal from 'decimal.js';

export interface PayrollCalculationInput {
  grossAmount: number;
  taxYear: number;
  province: string;
  federalTaxExemptions: number;
  provincialTaxExemptions: number;
  ytdGross: number;
  ytdCPP: number;
  ytdEI: number;
  ytdFederalTax: number;
  ytdProvincialTax: number;
  taxTable: TaxTable;
}

export interface PayrollCalculationResult {
  grossAmount: number;
  cppContribution: number;
  eiContribution: number;
  federalTax: number;
  provincialTax: number;
  totalDeductions: number;
  netAmount: number;
  ytdGross: number;
  ytdCPP: number;
  ytdEI: number;
  ytdFederalTax: number;
  ytdProvincialTax: number;
  details: PayrollCalculationDetails;
}

export interface PayrollCalculationDetails {
  cppCalculation: string;
  eiCalculation: string;
  federalTaxCalculation: string;
  provincialTaxCalculation: string;
}

export class PayrollCalculationEngine {
  /**
   * Calculate payroll for a single pay period
   */
  static calculate(input: PayrollCalculationInput): PayrollCalculationResult {
    const gross = new Decimal(input.grossAmount);
    const taxTable = input.taxTable;

    // Calculate CPP
    const { cpp, cppDetails } = this.calculateCPP(input);

    // Calculate EI
    const { ei, eiDetails } = this.calculateEI(input);

    // Calculate income taxes (federal + provincial)
    const { federalTax, federalDetails } = this.calculateFederalTax(input, cpp);
    const { provincialTax, provincialDetails } = this.calculateProvincialTax(input, cpp);

    // Calculate totals
    const totalDeductions = new Decimal(cpp).plus(new Decimal(ei)).plus(new Decimal(federalTax)).plus(new Decimal(provincialTax));
    const netAmount = gross.minus(totalDeductions);

    // Update YTD accumulators
    const ytdGross = new Decimal(input.ytdGross).plus(gross);
    const ytdCPP = new Decimal(input.ytdCPP).plus(new Decimal(cpp));
    const ytdEI = new Decimal(input.ytdEI).plus(new Decimal(ei));
    const ytdFederalTax = new Decimal(input.ytdFederalTax).plus(new Decimal(federalTax));
    const ytdProvincialTax = new Decimal(input.ytdProvincialTax).plus(new Decimal(provincialTax));

    return {
      grossAmount: gross.toNumber(),
      cppContribution: new Decimal(cpp).toNumber(),
      eiContribution: new Decimal(ei).toNumber(),
      federalTax: new Decimal(federalTax).toNumber(),
      provincialTax: new Decimal(provincialTax).toNumber(),
      totalDeductions: totalDeductions.toNumber(),
      netAmount: netAmount.toNumber(),
      ytdGross: ytdGross.toNumber(),
      ytdCPP: ytdCPP.toNumber(),
      ytdEI: ytdEI.toNumber(),
      ytdFederalTax: ytdFederalTax.toNumber(),
      ytdProvincialTax: ytdProvincialTax.toNumber(),
      details: {
        cppCalculation: cppDetails,
        eiCalculation: eiDetails,
        federalTaxCalculation: federalDetails,
        provincialTaxCalculation: provincialDetails,
      },
    };
  }

  private static calculateCPP(input: PayrollCalculationInput): { cpp: number; cppDetails: string } {
    const cppParams = input.taxTable.cppParameters;
    const gross = new Decimal(input.grossAmount);
    const ytdGross = new Decimal(input.ytdGross);

    // CPP applies to earnings between basic exemption and max earnings
    const pensionableEarnings = gross.minus(new Decimal(cppParams.basicExemption));
    const cppRate = new Decimal(cppParams.rate);
    const maxContribution = new Decimal(cppParams.maxContribution);

    let cpp = new Decimal(0);
    const details: string[] = [];

    if (ytdGross.greaterThan(cppParams.maxEarnings)) {
      // Already at maximum
      details.push('CPP: YTD earnings exceed maximum, no contribution');
      return { cpp: 0, cppDetails: details.join('\n') };
    }

    if (pensionableEarnings.greaterThan(0)) {
      const grossCPP = pensionableEarnings.times(cppRate);
      const ytdCPP = new Decimal(input.ytdCPP);

      // Don't exceed maximum
      cpp = grossCPP.plus(ytdCPP).greaterThan(maxContribution)
        ? maxContribution.minus(ytdCPP)
        : grossCPP;

      if (cpp.lessThan(0)) cpp = new Decimal(0);
    }

    details.push(`Pensionable Earnings: $${pensionableEarnings.toFixed(2)}`);
    details.push(`Rate: ${(cppRate.times(100).toNumber())}%`);
    details.push(`CPP Contribution: $${cpp.toFixed(2)}`);

    return { cpp: cpp.toNumber(), cppDetails: details.join('\n') };
  }

  private static calculateEI(input: PayrollCalculationInput): { ei: number; eiDetails: string } {
    const eiParams = input.taxTable.eiParameters;
    const gross = new Decimal(input.grossAmount);
    const ytdGross = new Decimal(input.ytdGross);
    const eiRate = new Decimal(eiParams.rate);
    const maxContribution = new Decimal(eiParams.maxContribution);

    const details: string[] = [];

    if (ytdGross.greaterThan(eiParams.maxEarnings)) {
      details.push('EI: YTD earnings exceed maximum, no contribution');
      return { ei: 0, eiDetails: details.join('\n') };
    }

    const grossEI = gross.times(eiRate);
    const ytdEI = new Decimal(input.ytdEI);
    let ei = grossEI.plus(ytdEI).greaterThan(maxContribution)
      ? maxContribution.minus(ytdEI)
      : grossEI;

    if (ei.lessThan(0)) ei = new Decimal(0);

    details.push(`Insurable Earnings: $${gross.toFixed(2)}`);
    details.push(`Rate: ${(eiRate.times(100).toNumber())}%`);
    details.push(`EI Contribution: $${ei.toFixed(2)}`);

    return { ei: ei.toNumber(), eiDetails: details.join('\n') };
  }

  private static calculateFederalTax(
    input: PayrollCalculationInput,
    cpp: number
  ): { federalTax: number; federalDetails: string } {
    const gross = new Decimal(input.grossAmount);
    const taxTable = input.taxTable;
    const basicPersonalAmount = new Decimal(taxTable.basicPersonalAmount);

    // For payroll, we use cumulative/monthly method
    // Simplified: calculate annual equivalent and prorate
    const annualEquivalent = gross.times(26); // Biweekly to annual
    const basicPersonalCredit = basicPersonalAmount.times(new Decimal(0.15)); // Federal rate: 15%
    const cppCredit = new Decimal(cpp).times(new Decimal(0.15));

    let taxableIncome = annualEquivalent.minus(basicPersonalAmount);
    if (taxableIncome.lessThan(0)) taxableIncome = new Decimal(0);

    // Apply federal brackets
    const federalTaxAnnual = this.calculateTaxFromBrackets(
      taxableIncome.toNumber(),
      taxTable.federalBrackets
    );

    // Prorate to biweekly
    const federalTaxBiweekly = new Decimal(federalTaxAnnual).dividedBy(26);
    const federalTax = federalTaxBiweekly.minus(basicPersonalCredit).minus(cppCredit);

    const details: string[] = [
      `Taxable Income (Annual): $${taxableIncome.toFixed(2)}`,
      `Federal Tax (Annual): $${federalTaxAnnual.toFixed(2)}`,
      `Federal Tax (Biweekly): $${federalTaxBiweekly.toFixed(2)}`,
      `Basic Personal Credit: -$${basicPersonalCredit.toFixed(2)}`,
      `CPP Credit: -$${cppCredit.toFixed(2)}`,
      `Federal Tax Withheld: $${federalTax.toFixed(2)}`,
    ];

    return {
      federalTax: Math.max(0, federalTax.toNumber()),
      federalDetails: details.join('\n'),
    };
  }

  private static calculateProvincialTax(
    input: PayrollCalculationInput,
    cpp: number
  ): { provincialTax: number; provincialDetails: string } {
    const gross = new Decimal(input.grossAmount);
    const taxTable = input.taxTable;

    if (!taxTable.provincialBrackets || taxTable.provincialBrackets.length === 0) {
      return { provincialTax: 0, provincialDetails: 'No provincial brackets configured' };
    }

    const basicPersonalAmount = new Decimal(taxTable.provincialBasicPersonalAmount || 0);
    const annualEquivalent = gross.times(26);
    const basicPersonalCredit = basicPersonalAmount.times(new Decimal(0.0505)); // Ontario rate as example
    const cppCredit = new Decimal(cpp).times(new Decimal(0.0505));

    let taxableIncome = annualEquivalent.minus(basicPersonalAmount);
    if (taxableIncome.lessThan(0)) taxableIncome = new Decimal(0);

    const provincialTaxAnnual = this.calculateTaxFromBrackets(
      taxableIncome.toNumber(),
      taxTable.provincialBrackets
    );

    const provincialTaxBiweekly = new Decimal(provincialTaxAnnual).dividedBy(26);
    const provincialTax = provincialTaxBiweekly.minus(basicPersonalCredit).minus(cppCredit);

    const details: string[] = [
      `Taxable Income (Annual): $${taxableIncome.toFixed(2)}`,
      `Provincial Tax (Annual): $${provincialTaxAnnual.toFixed(2)}`,
      `Provincial Tax (Biweekly): $${provincialTaxBiweekly.toFixed(2)}`,
      `Basic Personal Credit: -$${basicPersonalCredit.toFixed(2)}`,
      `CPP Credit: -$${cppCredit.toFixed(2)}`,
      `Provincial Tax Withheld: $${provincialTax.toFixed(2)}`,
    ];

    return {
      provincialTax: Math.max(0, provincialTax.toNumber()),
      provincialDetails: details.join('\n'),
    };
  }

  private static calculateTaxFromBrackets(income: number, brackets: TaxBracket[]): number {
    let tax = 0;
    const incomeDecimal = new Decimal(income);

    for (const bracket of brackets) {
      const min = new Decimal(bracket.min);
      const max = bracket.max ? new Decimal(bracket.max) : null;
      const rate = new Decimal(bracket.rate);

      const taxableInBracket = max
        ? incomeDecimal.greaterThan(max)
          ? max.minus(min)
          : incomeDecimal.greaterThan(min)
            ? incomeDecimal.minus(min)
            : new Decimal(0)
        : incomeDecimal.greaterThan(min)
          ? incomeDecimal.minus(min)
          : new Decimal(0);

      if (taxableInBracket.greaterThan(0)) {
        tax += taxableInBracket.times(rate).toNumber();
      }

      if (max && incomeDecimal.lessThanOrEqualTo(max)) break;
    }

    return tax;
  }
}
