export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public errors?: Record<string, string[]>) {
    super(400, message, 'VALIDATION_ERROR');
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(404, `${resource}${id ? ` with ID ${id}` : ''} not found`, 'NOT_FOUND');
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(401, message, 'UNAUTHORIZED');
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message, 'CONFLICT');
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}
