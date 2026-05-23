export class CreateOrganizationDto {
  name: string;
  province: string;
  businessNumber?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export class UpdateOrganizationDto {
  name?: string;
  province?: string;
  businessNumber?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export class OrganizationResponseDto {
  id: string;
  name: string;
  province: string;
  businessNumber?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  contactEmail?: string;
  contactPhone?: string;
  createdAt: Date;
  updatedAt: Date;
}
