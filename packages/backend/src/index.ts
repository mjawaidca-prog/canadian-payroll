import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import typeormConfig from './typeorm.config';
import { createOrganizationRoutes } from './modules/organizations/routes/OrganizationRoutes';
import { createEmployeeRoutes } from './modules/employees/routes/EmployeeRoutes';
import { createReportingRoutes } from './modules/reporting/routes/ReportingRoutes';
import { AppError } from './common/errors/AppError';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database connection
let dataSource: DataSource;

const initializeDatabase = async () => {
  try {
    dataSource = new DataSource(typeormConfig);
    await dataSource.initialize();
    console.log('✓ Database connection established');
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    process.exit(1);
  }
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (optional)
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    database: dataSource?.isInitialized ? 'connected' : 'disconnected',
  });
});

// API Status
app.get('/api/status', (req: Request, res: Response) => {
  res.json({
    success: true,
    application: 'Canadian Payroll System',
    version: '0.1.0',
    status: 'running',
    database: dataSource?.isInitialized ? 'connected' : 'disconnected',
  });
});

// Routes (will be added after database initialization)
const setupRoutes = () => {
  // Organization routes
  app.use('/api/organizations', createOrganizationRoutes(dataSource));

  // Employee routes (nested under organizations)
  app.use(
    '/api/organizations/:organizationId/employees',
    createEmployeeRoutes(dataSource)
  );

  // Reporting routes (T4, ROE, tax reporting)
  app.use('/api/reporting', createReportingRoutes(dataSource));

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: 'Endpoint not found',
      path: req.path,
    });
  });

  // Error handler middleware
  app.use((error: Error | AppError, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.code,
      });
    }

    // Unknown error
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  });
};

// Start server
const startServer = async () => {
  try {
    await initializeDatabase();
    setupRoutes();

    app.listen(PORT, () => {
      console.log(`\n✓ Payroll API server running on port ${PORT}`);
      console.log(`  Health check: http://localhost:${PORT}/health`);
      console.log(`  API Status: http://localhost:${PORT}/api/status`);
      console.log(`\nAPI Endpoints:`);
      console.log(`  Organizations: http://localhost:${PORT}/api/organizations`);
      console.log(`  Employees: http://localhost:${PORT}/api/organizations/{id}/employees`);
      console.log(`  Reporting (T4/ROE): http://localhost:${PORT}/api/reporting`);
      console.log('\n');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
