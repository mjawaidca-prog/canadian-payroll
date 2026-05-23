import { Router, Request, Response, NextFunction } from 'express';
import { DataSource } from 'typeorm';
import { PayStubService } from '../services/PayStubService';
import { NotFoundError } from '../../../common/errors/AppError';

export function createPayStubRoutes(dataSource: DataSource): Router {
  const router = Router({ mergeParams: true });
  const service = new PayStubService(dataSource);

  // Generate pay stub for a specific pay run item
  router.post(
    '/organizations/:organizationId/pay-runs/:payRunId/items/:payRunItemId/generate-stub',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { organizationId, payRunItemId } = req.params;

        const payStub = await service.generatePayStub({
          payRunItemId,
          organizationId,
        });

        res.status(201).json({
          success: true,
          message: 'Pay stub generated successfully',
          data: {
            id: payStub.id,
            fileName: payStub.fileName,
            fileSize: payStub.fileSize,
            createdAt: payStub.createdAt,
          },
        });
      } catch (error) {
        next(error);
      }
    }
  );

  // Get pay stub details
  router.get(
    '/organizations/:organizationId/pay-stubs/:id',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { id } = req.params;
        const payStub = await service.getPayStub(id);

        res.json({
          success: true,
          data: {
            id: payStub.id,
            payRunItemId: payStub.payRunItemId,
            fileName: payStub.fileName,
            fileSize: payStub.fileSize,
            sentToEmployee: payStub.sentToEmployee,
            sentAt: payStub.sentAt,
            sentToEmail: payStub.sentToEmail,
            createdAt: payStub.createdAt,
            archivedAt: payStub.archivedAt,
          },
        });
      } catch (error) {
        next(error);
      }
    }
  );

  // Download pay stub PDF
  router.get(
    '/organizations/:organizationId/pay-stubs/:id/download',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { id } = req.params;
        const payStub = await service.getPayStub(id);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${payStub.fileName}"`);
        res.setHeader('Content-Length', payStub.fileSize);

        res.send(payStub.pdfBlob);
      } catch (error) {
        next(error);
      }
    }
  );

  // Get all pay stubs for a pay run
  router.get(
    '/organizations/:organizationId/pay-runs/:payRunId/stubs',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { payRunId } = req.params;

        const payStubs = await service.getPayStubsByPayRun(payRunId);

        res.json({
          success: true,
          data: payStubs.map((stub) => ({
            id: stub.id,
            payRunItemId: stub.payRunItemId,
            fileName: stub.fileName,
            fileSize: stub.fileSize,
            sentToEmployee: stub.sentToEmployee,
            sentAt: stub.sentAt,
            createdAt: stub.createdAt,
          })),
          count: payStubs.length,
        });
      } catch (error) {
        next(error);
      }
    }
  );

  // Mark pay stub as sent
  router.post(
    '/organizations/:organizationId/pay-stubs/:id/mark-sent',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { id } = req.params;
        const { email } = req.body;

        if (!email) {
          throw new Error('Email is required');
        }

        const payStub = await service.markAsSent(id, email);

        res.json({
          success: true,
          message: 'Pay stub marked as sent',
          data: {
            id: payStub.id,
            sentToEmployee: payStub.sentToEmployee,
            sentAt: payStub.sentAt,
            sentToEmail: payStub.sentToEmail,
          },
        });
      } catch (error) {
        next(error);
      }
    }
  );

  return router;
}
