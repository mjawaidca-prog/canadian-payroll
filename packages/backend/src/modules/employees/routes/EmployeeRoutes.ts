import { Router, Request, Response, NextFunction } from 'express';
import { DataSource } from 'typeorm';
import { EmployeeService } from '../services/EmployeeService';
import { CreateEmployeeDto, UpdateEmployeeDto } from '../dtos/CreateEmployeeDto';
import { AppError } from '../../../common/errors/AppError';

export function createEmployeeRoutes(dataSource: DataSource): Router {
  const router = Router({ mergeParams: true }); // Captures organizationId from parent route
  const service = new EmployeeService(dataSource);

  // Create employee
  router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { organizationId } = req.params;
      const dto: CreateEmployeeDto = {
        ...req.body,
        organizationId,
      };

      // Validate required fields
      const required = ['firstName', 'lastName', 'sin', 'dateOfBirth', 'hireDate'];
      const missing = required.filter((field) => !dto[field as keyof CreateEmployeeDto]);

      if (missing.length > 0) {
        throw new AppError(400, `Missing required fields: ${missing.join(', ')}`);
      }

      const employee = await service.create(dto);

      res.status(201).json({
        success: true,
        data: employee,
      });
    } catch (error) {
      next(error);
    }
  });

  // Get all employees for organization
  router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { organizationId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;
      const includeInactive = req.query.includeInactive === 'true';

      const [employees, total] = await service.findByOrganization(
        organizationId,
        limit,
        offset,
        includeInactive
      );

      res.json({
        success: true,
        data: employees,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  });

  // Get active employees only
  router.get('/active', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { organizationId } = req.params;
      const employees = await service.findActiveByOrganization(organizationId);

      res.json({
        success: true,
        data: employees,
      });
    } catch (error) {
      next(error);
    }
  });

  // Get single employee
  router.get('/:employeeId', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { organizationId, employeeId } = req.params;
      const employee = await service.findById(employeeId, organizationId);

      res.json({
        success: true,
        data: employee,
      });
    } catch (error) {
      next(error);
    }
  });

  // Update employee
  router.patch('/:employeeId', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { organizationId, employeeId } = req.params;
      const dto: UpdateEmployeeDto = req.body;

      const employee = await service.update(employeeId, organizationId, dto);

      res.json({
        success: true,
        data: employee,
      });
    } catch (error) {
      next(error);
    }
  });

  // Deactivate employee
  router.post(
    '/:employeeId/deactivate',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { organizationId, employeeId } = req.params;
        const employee = await service.deactivate(employeeId, organizationId);

        res.json({
          success: true,
          message: 'Employee deactivated',
          data: employee,
        });
      } catch (error) {
        next(error);
      }
    }
  );

  // Reactivate employee
  router.post(
    '/:employeeId/reactivate',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { organizationId, employeeId } = req.params;
        const employee = await service.reactivate(employeeId, organizationId);

        res.json({
          success: true,
          message: 'Employee reactivated',
          data: employee,
        });
      } catch (error) {
        next(error);
      }
    }
  );

  // Delete employee
  router.delete('/:employeeId', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { organizationId, employeeId } = req.params;
      await service.delete(employeeId, organizationId);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
}
