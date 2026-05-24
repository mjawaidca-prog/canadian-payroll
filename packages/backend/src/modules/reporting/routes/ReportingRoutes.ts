import { Router, Request, Response, NextFunction } from 'express';
import { DataSource } from 'typeorm';
import { T4Service } from '../services/T4Service';
import { ROEService } from '../services/ROEService';
import { AppError } from '../../../common/errors/AppError';

export function createReportingRoutes(dataSource: DataSource): Router {
  const router = Router();
  const t4Service = new T4Service(dataSource);
  const roeService = new ROEService(dataSource);

  // T4 Endpoints
  router.post('/t4/generate/:organizationId/:taxYear', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { organizationId, taxYear } = req.params;
      const records = await t4Service.generateT4Records(organizationId, parseInt(taxYear));
      res.json({ success: true, data: records });
    } catch (error) {
      next(error);
    }
  });

  router.get('/t4/summary/:organizationId/:taxYear', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { organizationId, taxYear } = req.params;
      const { businessNumber } = req.query;
      const summary = await t4Service.generateT4Summary(
        organizationId,
        parseInt(taxYear),
        businessNumber as string
      );
      res.json({ success: true, data: summary });
    } catch (error) {
      next(error);
    }
  });

  router.post('/t4/validate', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { records } = req.body;
      const errors = t4Service.validateT4Records(records);
      if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
      }
      res.json({ success: true, message: 'All records valid' });
    } catch (error) {
      next(error);
    }
  });

  router.post('/t4/export-xml', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { records, businessNumber } = req.body;
      if (!records || !businessNumber) {
        throw new AppError(400, 'Records and businessNumber are required');
      }
      const xml = t4Service.generateCRAXML(records, businessNumber);
      res.set('Content-Type', 'application/xml');
      res.send(xml);
    } catch (error) {
      next(error);
    }
  });

  // ROE Endpoints
  router.post('/roe/generate/:employeeId', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { employeeId } = req.params;
      const { reasonCode } = req.body;
      const roe = await roeService.generateROE(employeeId);
      if (reasonCode) {
        roe.reasonCode = reasonCode;
      }
      res.json({ success: true, data: roe });
    } catch (error) {
      next(error);
    }
  });

  router.post('/roe/export-xml', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { roe } = req.body;
      if (!roe) {
        throw new AppError(400, 'ROE data is required');
      }
      const xml = roeService.generateCRAXML(roe);
      res.set('Content-Type', 'application/xml');
      res.send(xml);
    } catch (error) {
      next(error);
    }
  });

  router.get('/roe/:employeeId', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { employeeId } = req.params;
      const roe = await roeService.generateROE(employeeId);
      res.json({ success: true, data: roe });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
