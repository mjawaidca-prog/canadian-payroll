# Canadian Payroll Software System

A comprehensive, full-stack Canadian payroll management platform with multi-platform support (Web, Desktop, CLI). Built with TypeScript, Node.js, React, and PostgreSQL.

## 🎯 Features

### Phase 1: Foundation (Current)
- ✅ PostgreSQL database schema with TypeORM
- ✅ Core payroll calculation engine
- ✅ Tax table management for all Canadian provinces
- ✅ Employee and organization management entities
- ✅ Pay run and pay item tracking
- 🔄 Database migrations system

### Phase 2-3: In Progress
- 📋 Pay stub PDF generation
- 📊 Tax reporting (T4, ROE, T4A)
- 🌐 React web dashboard
- 💻 Electron desktop application
- 📱 Command-line interface

### Phase 4+: Planned
- 🔐 Multi-tenant authentication
- 💳 Direct deposit integration
- 📈 Advanced analytics and reporting
- 🔄 CPA file format generation
- 🤖 AI-powered tax optimization

## 📁 Project Structure

```
canadian-payroll/
├── packages/
│   ├── backend/                    # Express.js API server
│   │   ├── src/
│   │   │   ├── database/
│   │   │   │   ├── entities/       # TypeORM entities
│   │   │   │   │   ├── Organization.ts
│   │   │   │   │   ├── Employee.ts
│   │   │   │   │   ├── PayRun.ts
│   │   │   │   │   ├── PayRunItem.ts
│   │   │   │   │   └── TaxTable.ts
│   │   │   │   ├── migrations/     # Database migrations
│   │   │   │   └── seeds/          # Seed data (tax tables)
│   │   │   ├── modules/
│   │   │   │   ├── auth/           # Authentication
│   │   │   │   ├── employees/      # Employee management
│   │   │   │   ├── payroll/
│   │   │   │   │   ├── calculation/  # PayrollCalculationEngine
│   │   │   │   │   ├── services/     # Payroll orchestration
│   │   │   │   │   └── controllers/  # API endpoints
│   │   │   │   ├── taxtables/      # Tax table management
│   │   │   │   └── reporting/      # T4, ROE, reports
│   │   │   ├── common/             # Shared utilities
│   │   │   └── index.ts            # Express app entry
│   │   ├── typeorm.config.ts       # Database config
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── web/                        # React + Next.js dashboard
│   │   ├── src/
│   │   │   ├── components/         # React components
│   │   │   ├── pages/              # Next.js pages
│   │   │   ├── hooks/              # Custom React hooks
│   │   │   └── store/              # Redux state
│   │   └── package.json
│   │
│   ├── desktop/                    # Electron desktop app
│   │   ├── src/
│   │   │   ├── main.ts             # Electron main process
│   │   │   ├── preload.ts          # IPC bridge
│   │   │   └── renderer/           # React frontend
│   │   └── package.json
│   │
│   └── cli/                        # Node.js CLI tool
│       ├── src/
│       │   ├── commands/           # CLI commands
│       │   └── index.ts            # CLI entry
│       └── package.json
│
├── docs/                           # Documentation
│   ├── API.md                      # API documentation
│   ├── SCHEMA.md                   # Database schema
│   ├── TAX_TABLES.md              # Tax calculation details
│   ├── INSTALLATION.md             # Setup guide
│   └── DEPLOYMENT.md               # Production deployment
│
├── .github/
│   └── workflows/                  # CI/CD pipelines
│       ├── test.yml
│       ├── lint.yml
│       └── deploy.yml
│
├── package.json                    # Root package.json (workspaces)
└── README.md                       # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 14+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/canadian-payroll.git
   cd canadian-payroll
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up database**
   ```bash
   # Create PostgreSQL database
   createdb payroll_dev

   # Copy environment file
   cp packages/backend/.env.example packages/backend/.env
   
   # Edit .env with your database credentials
   ```

4. **Run database migrations**
   ```bash
   npm run -w packages/backend migration:run
   ```

5. **Seed tax tables for 2024**
   ```bash
   npm run -w packages/backend seed:taxtables
   ```

6. **Start development servers**
   ```bash
   # Start API backend (port 3000)
   npm run backend:dev

   # In another terminal, start web dashboard (port 3001)
   npm run web:dev
   ```

7. **Access the application**
   - API: http://localhost:3000
   - Web Dashboard: http://localhost:3001
   - API Health: http://localhost:3000/health

## 🧮 Payroll Calculation Engine

The `PayrollCalculationEngine` handles Canadian tax calculations including:

### Supported Calculations
- **CPP Contribution**: Canada Pension Plan (5.95% in 2024)
- **EI Contribution**: Employment Insurance (1.63% in 2024)
- **Federal Tax**: Progressive tax brackets
- **Provincial Tax**: All 10 provinces + 3 territories
- **Deductions**: Benefits, RRSP, union dues, etc.

### Example Usage

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
  taxTable: taxTableEntity,
});

console.log(result);
// {
//   grossAmount: 3000,
//   cppContribution: 178.50,
//   eiContribution: 48.90,
//   federalTax: 389.25,
//   provincialTax: 156.80,
//   netAmount: 2226.55,
//   ...
// }
```

## 📊 Database Schema

### Organizations
Multi-tenant support - each organization has its own employees and pay runs.

### Employees
Track employee details, tax exemptions, salary/hourly rates, and employment status.

### PayRuns
Group payments for a pay period (weekly, biweekly, monthly).

### PayRunItems
Individual employee calculations within a pay run.

### TaxTables
Versioned tax brackets, CPP/EI rates, and credits for each year and province.

## 🔧 Available Commands

```bash
# Development
npm install                    # Install all dependencies
npm run dev                   # Start all packages in dev mode
npm run backend:dev          # Start API server only
npm run web:dev              # Start web dashboard only

# Building
npm run build                # Build all packages
npm run backend:build        # Build backend

# Testing
npm run test                 # Run all tests
npm run lint                 # Lint all packages

# Database
npm run migration:run        # Run pending migrations
npm run migration:generate   # Generate migration from entities

# Seeding
npm run seed:taxtables      # Populate tax tables for 2024
```

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Validation**: class-validator, Zod

### Frontend (Web)
- **Framework**: React 18
- **Meta-framework**: Next.js 14
- **UI Library**: Material-UI
- **State Management**: Redux Toolkit
- **Forms**: React Hook Form

### Desktop
- **Framework**: Electron
- **Frontend**: React (shared with web)
- **Local Storage**: SQLite

### CLI
- **CLI Framework**: Commander.js
- **Output**: Chalk, Table

## 📝 Development Roadmap

### Week 1-2: Foundation ✅
- [x] PostgreSQL schema
- [x] TypeORM setup
- [x] Payroll calculation engine
- [x] Tax table structure

### Week 3-4: API Layer
- [ ] Express API endpoints
- [ ] Employee CRUD operations
- [ ] Pay run management
- [ ] Calculation orchestration

### Week 5-6: Pay Stub Generation
- [ ] PDF generation (PDFKit/Puppeteer)
- [ ] Email integration
- [ ] Archive storage
- [ ] Digital signatures

### Week 7-8: Web Dashboard
- [ ] React components
- [ ] Employee management UI
- [ ] Payroll processing flow
- [ ] Reporting interface

### Week 9-10: Tax Reporting
- [ ] T4 generation
- [ ] ROE tracking
- [ ] Tax table admin UI
- [ ] Export functionality

## 🔐 Security

- AES-256 encryption for SIN and sensitive data
- TLS 1.3 for all API communication
- Multi-tenant row-level security
- Audit logging for all changes
- GDPR/PIPEDA compliance

## 📚 Documentation

- [API Documentation](docs/API.md)
- [Database Schema](docs/SCHEMA.md)
- [Tax Calculation Details](docs/TAX_TABLES.md)
- [Installation Guide](docs/INSTALLATION.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## 🤝 Contributing

This is a solo project, but future collaboration will follow:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License - See LICENSE file

## ✉️ Contact

Created by [Your Name]
Email: mjawaid.ca@gmail.com

---

**Status**: Phase 1 - Foundation Complete ✅
**Next**: Phase 2 - API Layer & Employee Management
