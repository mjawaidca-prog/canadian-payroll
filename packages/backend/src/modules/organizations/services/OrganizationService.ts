import { DataSource, Repository } from 'typeorm';
import { Organization } from '../../../database/entities';
import { CreateOrganizationDto, UpdateOrganizationDto } from '../dtos/CreateOrganizationDto';
import { NotFoundError, ConflictError } from '../../../common/errors/AppError';

export class OrganizationService {
  private repository: Repository<Organization>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(Organization);
  }

  async create(dto: CreateOrganizationDto): Promise<Organization> {
    // Check for duplicates (optional)
    const existing = await this.repository.findOne({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictError(`Organization with name "${dto.name}" already exists`);
    }

    const organization = this.repository.create(dto);
    return this.repository.save(organization);
  }

  async findById(id: string): Promise<Organization> {
    const organization = await this.repository.findOne({ where: { id } });
    if (!organization) {
      throw new NotFoundError('Organization', id);
    }
    return organization;
  }

  async findAll(limit: number = 10, offset: number = 0): Promise<[Organization[], number]> {
    return this.repository.findAndCount({
      take: limit,
      skip: offset,
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, dto: UpdateOrganizationDto): Promise<Organization> {
    const organization = await this.findById(id);

    Object.assign(organization, dto);
    return this.repository.save(organization);
  }

  async delete(id: string): Promise<void> {
    const organization = await this.findById(id);
    await this.repository.remove(organization);
  }

  async getEmployeeCount(organizationId: string): Promise<number> {
    const organization = await this.repository.findOne({
      where: { id: organizationId },
      relations: ['employees'],
    });

    if (!organization) {
      throw new NotFoundError('Organization', organizationId);
    }

    return organization.employees?.length || 0;
  }
}
