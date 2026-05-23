export class PaginationDto {
  page: number = 1;
  limit: number = 20;
  sortBy: string = 'createdAt';
  sortOrder: 'ASC' | 'DESC' = 'DESC';

  constructor(data?: Partial<PaginationDto>) {
    if (data) {
      this.page = Math.max(1, data.page ?? this.page);
      this.limit = Math.min(100, Math.max(1, data.limit ?? this.limit));
      this.sortBy = data.sortBy ?? this.sortBy;
      this.sortOrder = data.sortOrder ?? this.sortOrder;
    }
  }

  get skip(): number {
    return (this.page - 1) * this.limit;
  }
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
