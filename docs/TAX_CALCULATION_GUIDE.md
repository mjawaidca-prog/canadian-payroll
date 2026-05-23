# Canadian Tax Calculation Guide

This document explains how the payroll system calculates Canadian taxes, deductions, and benefits.

## Table of Contents
1. [Overview](#overview)
2. [Gross-to-Net Calculation](#gross-to-net-calculation)
3. [CPP Contribution](#cpp-contribution)
4. [EI Contribution](#ei-contribution)
5. [Federal Income Tax](#federal-income-tax)
6. [Provincial Income Tax](#provincial-income-tax)
7. [Year-to-Date Accumulators](#year-to-date-accumulators)
8. [2024 Tax Rates](#2024-tax-rates)
9. [Examples](#examples)

## Overview

The payroll calculation engine follows the Canadian Revenue Agency (CRA) standards for:
- Canada Pension Plan (CPP) contributions
- Employment Insurance (EI) premiums
- Federal and Provincial income tax withholding
- Year-to-date accumulation for annual limits

### Calculation Order
```
GROSS INCOME
    ↓
CPP CONTRIBUTION (deductible)
    ↓
EI CONTRIBUTION (deductible)
    ↓
FEDERAL INCOME TAX (based on remaining income)
    ↓
PROVINCIAL INCOME TAX (based on remaining income)
    ↓
OTHER DEDUCTIONS (benefits, RRSP, etc.)
    ↓
NET PAY
```

## Gross-to-Net Calculation

The engine uses the `PayrollCalculationEngine.calculate()` method which takes:

```typescript
interface PayrollCalculationInput {
  grossAmount: number;          // Pay for this period
  taxYear: number;              // 2024, 2025, etc.
  province: string;             // ON, BC, AB, etc.
  federalTaxExemptions: number; // Number of exemptions
  provincialTaxExemptions: number;
  ytdGross: number;             // Year-to-date gross
  ytdCPP: number;               // Year-to-date CPP paid
  ytdEI: number;                // Year-to-date EI paid
  ytdFederalTax: number;        // Year-to-date federal tax
  ytdProvincialTax: number;     // Year-to-date provincial tax
  taxTable: TaxTable;           // Tax rates from database
}
```

### Output

```typescript
interface PayrollCalculationResult {
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
  details: PayrollCalculationDetails; // Calculation breakdown
}
```

## CPP Contribution

### 2024 Parameters
- **Rate**: 5.95% of pensionable earnings
- **Pensionable Earnings**: Gross - $3,500 (basic exemption)
- **Maximum Earnings**: $68,500
- **Maximum Annual Contribution**: $3,867.50
- **Pay Period Maximum**: $3,867.50 ÷ 26 (for biweekly)

### Calculation Logic

```
CPP Pensionable Earnings = Gross - $3,500

If YTD Gross > $68,500:
  CPP = $0 (maximum already reached)
Else if Pensionable Earnings > $0:
  Gross CPP = Pensionable Earnings × 5.95%
  CPP = MIN(Gross CPP, $3,867.50 - YTD CPP)
Else:
  CPP = $0
```

### Example
```
Gross: $3,000
YTD Gross: $0

Pensionable Earnings = $3,000 - $3,500 = -$500 (no contribution)
CPP = $0
```

Another example:
```
Gross: $4,000
YTD Gross: $0

Pensionable Earnings = $4,000 - $3,500 = $500
Gross CPP = $500 × 5.95% = $29.75
CPP = $29.75
```

## EI Contribution

### 2024 Parameters (Ontario)
- **Rate**: 1.63% of insurable earnings
- **Insurable Earnings**: Gross (up to maximum)
- **Maximum Earnings**: $63,200
- **Maximum Annual Contribution**: $1,049.12
- **Pay Period Maximum**: $1,049.12 ÷ 26 (for biweekly)

**Note**: EI rates vary by province:
- Ontario: 1.63%
- British Columbia: 1.63%
- Alberta: 1.53%
- Manitoba: 1.65%
- Saskatchewan: 1.63%
- Quebec: 1.26% (employee rate)
- Nova Scotia: 1.66%
- New Brunswick: 1.63%
- Newfoundland & Labrador: 1.63%
- Prince Edward Island: 1.63%

### Calculation Logic

```
If YTD Gross > $63,200 (province dependent):
  EI = $0 (maximum already reached)
Else:
  Gross EI = Gross × Rate (from tax table)
  EI = MIN(Gross EI, Max Annual - YTD EI)
```

### Example
```
Gross: $3,000
YTD Gross: $15,000
YTD EI: $0

Gross EI = $3,000 × 1.63% = $48.90
EI = MIN($48.90, $1,049.12 - $0) = $48.90
```

## Federal Income Tax

### 2024 Tax Brackets

| Income Range | Tax Rate |
|---|---|
| $0 - $55,867 | 15% |
| $55,867 - $111,733 | 20.5% |
| $111,733 - $173,205 | 26% |
| $173,205 - $246,752 | 29% |
| $246,752+ | 33% |

### Basic Personal Amount
- **2024 Federal**: $15,705
- **Credits**: $15,705 × 15% = $2,355.75

### Calculation Method

The system uses the **monthly cumulative method** for payroll accuracy:

```
1. Calculate annualized income:
   Annual Equivalent = Gross × 26 (for biweekly)

2. Calculate taxable income:
   Taxable Income = Annual Equivalent - Basic Personal Amount

3. Apply tax brackets:
   Tax on $0-$55,867 = Amount × 15%
   Tax on $55,867-$111,733 = Amount × 20.5%
   (and so on...)

4. Calculate credits:
   Basic Personal Credit = Basic Personal Amount × 15%
   CPP Credit = CPP Contribution × 15%
   EI Credit = EI Contribution × 15%

5. Prorate to pay period:
   Pay Period Tax = (Annual Tax ÷ 26) - Credits
```

### Example

```
Gross: $3,000 (biweekly)
Federal Exemptions: 1
YTD: $0

Annual Equivalent = $3,000 × 26 = $78,000
Taxable Income = $78,000 - $15,705 = $62,295

Tax Calculation:
- On $55,867: $55,867 × 15% = $8,380.05
- On $6,428 ($62,295 - $55,867): $6,428 × 20.5% = $1,317.74
- Total Annual Tax: $9,697.79

Biweekly Tax = $9,697.79 ÷ 26 = $373.00
Less: Basic Personal Credit = $2,355.75 ÷ 26 = $90.60
Less: CPP Credit = (from previous calculations)
Federal Tax ≈ $280
```

## Provincial Income Tax

### Ontario 2024 Tax Brackets

| Income Range | Tax Rate |
|---|---|
| $0 - $51,446 | 5.05% |
| $51,446 - $102,894 | 9.15% |
| $102,894 - $150,000 | 11.16% |
| $150,000 - $220,708 | 12.16% |
| $220,708+ | 13.16% |

### Provincial Basic Personal Amount
- **Ontario 2024**: $11,981

### Calculation Method

Same as federal, but using provincial brackets and rates.

```
Annual Equivalent = Gross × 26
Taxable Income = Annual Equivalent - Provincial BPA
(Apply provincial brackets)
Provincial Credit = Provincial BPA × 5.05% (Ontario rate)
Biweekly Tax = (Annual Tax ÷ 26) - Credits
```

**Note**: Each province has different brackets and rates. The system loads these from the `TaxTable` entity in the database.

## Year-to-Date Accumulators

YTD tracking ensures employees don't overpay or underpay once limits are reached.

### CPP YTD Tracking

```typescript
ytdCPP = ytdCPP + newCPP

if (ytdCPP > $3,867.50) {
  cppThisPayment = adjusted down to not exceed max
}
```

### EI YTD Tracking

```typescript
ytdEI = ytdEI + newEI

if (ytdEI > $1,049.12) {
  eiThisPayment = adjusted down to not exceed max
}
```

### Tax YTD Tracking

For progressive tax calculations, the system accumulates:
- `ytdGross`: Total earnings to date
- `ytdFederalTax`: Total federal tax withheld
- `ytdProvincialTax`: Total provincial tax withheld

This allows accurate cumulative tax calculation accounting for bracket progression.

## 2024 Tax Rates Summary

### Federal
- Tax Rate: 15%, 20.5%, 26%, 29%, 33%
- Basic Personal Amount: $15,705
- CPP Maximum: $3,867.50
- EI Maximum: $1,049.12

### Provincial Examples

**Ontario**
- Tax Rates: 5.05%, 9.15%, 11.16%, 12.16%, 13.16%
- Basic Personal Amount: $11,981
- EI Rate: 1.63% (up to $63,200)

**British Columbia**
- Tax Rates: 5.06%, 7.7%, 10.5%, 12.29%, 14.29%, 16.8%, 17.75%, 20.5%, 20.53%
- Basic Personal Amount: $12,267
- EI Rate: 1.63% (up to $63,200)

**Alberta**
- Tax Rates: 10%, 12%, 13%, 14%, 15%
- Basic Personal Amount: $21,885
- EI Rate: 1.53% (up to $63,200)
- **No Provincial Sales Tax**

**Quebec**
- Tax Rates: 15%, 20%, 24%, 25.75%, 26%, 27.575%, 28.175%, 29.575%
- Basic Personal Amount: $15,705
- EI Rate: 1.26% (up to $63,200)
- **Note**: Quebec has separate payroll with Revenu Québec

**Manitoba**
- Tax Rates: 10.8%, 12.75%, 17.4%, 20.06%
- Basic Personal Amount: $15,705
- EI Rate: 1.65% (up to $63,200)

## Examples

### Example 1: New Employee Ontario

```
Scenario:
- Salary: $50,000/year (biweekly = $1,923.08)
- Province: Ontario
- YTD Gross: $0
- Federal/Provincial Exemptions: 1 each

Calculations:
Gross: $1,923.08

CPP:
- Pensionable = $1,923.08 - $3,500 = -$1,576.92 (no contribution)
- CPP = $0

EI:
- EI = $1,923.08 × 1.63% = $31.37

Federal Tax:
- Annual Equiv = $1,923.08 × 26 = $49,999.92
- Taxable = $49,999.92 - $15,705 = $34,294.92
- Tax (at 15% bracket) = $34,294.92 × 15% = $5,144.24
- Biweekly = $5,144.24 ÷ 26 = $197.85
- Less Credits = ~$140

Provincial Tax:
- Taxable = $49,999.92 - $11,981 = $38,018.92
- Tax (at 5.05% bracket) = $38,018.92 × 5.05% = $1,920.45
- Biweekly = $1,920.45 ÷ 26 = $73.86
- Less Credits = ~$45

Net Pay:
$1,923.08 - $0 - $31.37 - $140 - $45 = $1,706.71
```

### Example 2: Mid-Year Employee BC

```
Scenario:
- Pay: $3,500
- Province: British Columbia
- YTD Gross: $39,500
- CPP Maximum: $3,867.50
- Federal/Provincial Exemptions: 1 each

Calculations:
Gross: $3,500
YTD Gross: $42,500 (after this payment)

CPP:
- Pensionable = $3,500 - $3,500 = $0
- CPP = $0

EI:
- EI = $3,500 × 1.63% = $57.05

Federal Tax:
- Annual Equiv = $42,500 × 26 = $1,105,000 (cumulative annualized)
- (Proper monthly method applies)
- Federal Tax ≈ $420

Provincial Tax (BC):
- Provincial Tax ≈ $180

Net Pay:
$3,500 - $0 - $57.05 - $420 - $180 = $2,842.95
```

## Validation & Compliance

### CRA Cross-Check Examples

The system validates calculations against:
- **CRA T4 Examples**: Annual totals match published CRA examples
- **Payroll Deductions Tables**: Published by CRA for accuracy
- **Provincial Authorities**: Each province's tax authority guidelines

### YTD Maximum Verification

```typescript
if (ytdCPP > 3867.50) throw Error("CPP maximum exceeded")
if (ytdEI > 1049.12) throw Error("EI maximum exceeded")
if (ytdGross > 68500 && ytdCPP > 0) throw Error("CPP earnings maximum exceeded")
```

## Implementation in Code

```typescript
import { PayrollCalculationEngine } from 'payroll-backend';

const result = PayrollCalculationEngine.calculate({
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
  taxTable: taxTableFromDatabase,
});

console.log(`Gross: $${result.grossAmount}`);
console.log(`CPP: $${result.cppContribution}`);
console.log(`EI: $${result.eiContribution}`);
console.log(`Federal Tax: $${result.federalTax}`);
console.log(`Provincial Tax: $${result.provincialTax}`);
console.log(`Net: $${result.netAmount}`);
```

## References

- [CRA Payroll Deductions Tables](https://www.canada.ca/taxes/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-15000-gross-income/line-11700-employment-income.html)
- [CPP Contribution Rates](https://www.canada.ca/service/employer-contribution-rates)
- [EI Premium Rates](https://www.canada.ca/service/employment-insurance-rates)
- Provincial Tax Websites (Ontario.ca, BCTaxes, etc.)

---

**Last Updated**: 2024
**Document Version**: 1.0
