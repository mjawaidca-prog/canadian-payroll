import { DataSource, Repository } from 'typeorm';
import { Employee } from '../../../database/entities';
import { CreateEmployeeDto, UpdateEmployeeDto } from '../dtos/CreateEmployeeDto';
import { NotFoundError, ConflictError } from '../../../common/errors/AppError';

export class EmployeeService {
  private repository: Repository<Employee>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(Employee);
  }

  async create(dto: CreateEmployeeDto): Promise<Employee> {
    // Check for duplicate SIN within organization
    const existing = await this.repository.findOne({
      where: {
        organizationId: dto.organizationId,
        sin: dto.sin,
      },
    });

    if (existing) {
      throw new ConflictError(`Employee with SIN already exists in this organization`);
    }

    const employee = this.repository.create(dto);
    return this.repository.save(employee);
  }

  async findById(id: string, organizationId?: string): Promise<Employee> {
    const query: any = { id };
    if (organizationId) {
      query.organizationId = organizationId;
    }

    const employee = await this.repository.findOne({ where: query });
    if (!employee) {
      throw new NotFoundError('Employee', id);
    }
    return employee;
  }

  async findByOrganization(
    organizationId: string,
    limit: number = 50,
    offset: number = 0,
    includeInactive: boolean = false
  ): Promise<[Employee[], number]> {
    const query = this.repository
      .createQueryBuilder('employee')
      .where('employee.organizationId = :organizationId', { organizationId });

    if (!includeInactive) {
      query.andWhere('employee.isActive = true');
    }

    return query
      .orderBy('employee.firstName', 'ASC')
      .addOrderBy('employee.lastName', 'ASC')
      .take(limit)
      .skip(offset)
      .getManyAndCount();
  }

  async findActiveByOrganization(organizationId: string): Promise<Employee[]> {
    return this.repository.find({
      where: {
        organizationId,
        isActive: true,
      },
      order: {
        firstName: 'ASC',
        lastName: 'ASC',
      },
    });
  }

  async update(id: string, organizationId: string, dto: UpdateEmployeeDto): Promise<Employee> {
    const employee = await this.findById(id, organizationId);

    // Prevent changing organization
    if (dto.organizationId) {
      throw new Error('Cannot change employee organization');
    }

    Object.assign(employee, dto);
    return this.repository.save(employee);
  }

  async deactivate(id: string, organizationId: string): Promise<Employee> {
    const employee = await this.findById(id, organizationId);
    employee.isActive = false;
    if (!employee.terminationDate) {
      employee.terminationDate = new Date();
    }
    return this.repository.save(employee);
  }

  async reactivate(id: string, organizationId: string): Promise<Employee> {
    const employee = await this.findById(id, organizationId);
    employee.isActive = true;
    employee.terminationDate = null;
    return this.repository.save(employee);
  }

  async delete(id: string, organizationId: string): Promise<void> {
    const employee = await this.findById(id, organizationId);
    await this.repository.remove(employee);
  }

  // Mask SIN for security
  maskSIN(sin: string): string {
    return `***-***-${sin.slice(-4)}`;
  }
}
