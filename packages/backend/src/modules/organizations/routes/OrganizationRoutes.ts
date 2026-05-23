import { Router, Request, Response, NextFunction } from 'express';
import { DataSource } from 'typeorm';
import { OrganizationService } from '../services/OrganizationService';
import { CreateOrganizationDto, UpdateOrganizationDto } from '../dtos/CreateOrganizationDto';
import { AppError } from '../../../common/errors/AppError';

export function createOrganizationRoutes(dataSource: DataSource): Router {
  const router = Router();
  const service = new OrganizationService(dataSource);

  // Create organization
  router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto: CreateOrganizationDto = req.body;

      // Validate required fields
      if (!dto.name || !dto.province) {
        throw new AppError(400, 'Name and province are required');
      }

      const organization = await service.create(dto);
      res.status(201).json({
        success: true,
        data: organization,
      });
    } catch (error) {
      next(error);
    }
  });

  // Get all organizations
  router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      const [organizations, total] = await service.findAll(limit, offset);

      res.json({
        success: true,
        data: organizations,
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

  // Get single organization
  router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organization = await service.findById(req.params.id);
      res.json({
        success: true,
        data: organization,
      });
    } catch (error) {
      next(error);
    }
  });

  // Update organization
  router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto: UpdateOrganizationDto = req.body;
      const organization = await service.update(req.params.id, dto);

      res.json({
        success: true,
        data: organization,
      });
    } catch (error) {
      next(error);
    }
  });

  // Delete organization
  router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      await service.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // Get employee count
  router.get('/:id/employee-count', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const count = await service.getEmployeeCount(req.params.id);
      res.json({
        success: true,
        data: { organizationId: req.params.id, employeeCount: count },
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
